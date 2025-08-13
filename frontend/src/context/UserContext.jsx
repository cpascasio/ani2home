// frontend/src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useReducer, useMemo } from "react";
import PropTypes from "prop-types";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase-config"; // keep your existing path

const initialState = {
  user: null,      // merged app user object (db + firebase + claims)
  loading: true,   // while we confirm session/claims/profile
  error: null,     // bootstrap errors (network, permission)
};

function userReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "LOGIN": {
      // Only used if you want to seed from localStorage; bootstrap will override
      return { ...state, user: action.payload, error: null };
    }
    case "UPDATE_USER": {
      const updatedUser = action.payload ? { ...(state.user || {}), ...action.payload } : null;

      // Persist for UX only; do not "trust" this for security decisions
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem("user");
      }

      return { ...state, user: updatedUser, error: null };
    }
    case "LOGOUT": {
      try { auth.signOut(); } catch {}
      localStorage.clear();
      return { ...state, user: null, error: null };
    }
    default:
      return state;
  }
}

export const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Optional: hydrate quickly from localStorage for snappier UX
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("user"));
      if (cached) dispatch({ type: "LOGIN", payload: cached });
    } catch {
      // ignore parse errors
    }
  }, []);

  // Authoritative bootstrap: Firebase session + claims + Firestore profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        if (!firebaseUser) {
          dispatch({ type: "UPDATE_USER", payload: null });
          return;
        }

        // 1) Fresh ID token & custom claims (e.g., admin)
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const customClaims = tokenResult?.claims || {};

        // 2) Your app profile from Firestore (e.g., isStore, displayName, etc.)
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        const userDataFromDB = snap.exists() ? snap.data() : {};

        // 3) Merge and persist
        dispatch({
          type: "UPDATE_USER",
          payload: {
            ...userDataFromDB,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            customClaims, // <-- makes derivePrincipal(...rest?.customClaims?.admin) work
          },
        });
      } catch (e) {
        // Fail securely: clear user on error so gates deny by default
        console.error("Auth bootstrap error:", e);
        dispatch({ type: "UPDATE_USER", payload: null });
        dispatch({ type: "SET_ERROR", payload: e });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({ ...state, dispatch }),
    [state.user, state.loading, state.error]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
