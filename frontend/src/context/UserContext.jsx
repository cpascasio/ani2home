// frontend/src/context/UserContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { auth } from "../config/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        if (firebaseUser) {
          // Firebase user exists, get user data from localStorage
          const storedUser = localStorage.getItem("user");

          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);

              // Verify the stored user matches the Firebase user
              if (
                userData.userId === firebaseUser.uid ||
                userData.uid === firebaseUser.uid
              ) {
                console.log("Loading user from localStorage:", userData);
                dispatch({
                  type: "LOGIN",
                  payload: userData,
                });
              } else {
                // Stored user doesn't match Firebase user, clear storage
                console.warn("Stored user doesn't match Firebase user");
                localStorage.clear();
                dispatch({ type: "LOGOUT" });
              }
            } catch (error) {
              console.error("Error parsing stored user:", error);
              localStorage.clear();
              dispatch({ type: "LOGOUT" });
            }
          } else {
            // Firebase user exists but no stored user data
            // This might happen during registration process
            console.log("Firebase user exists but no stored user data");
            dispatch({ type: "SET_LOADING", payload: false });
          }
        } else {
          // No Firebase user, clear everything
          console.log("No Firebase user, clearing context");
          dispatch({ type: "LOGOUT" });
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        dispatch({ type: "LOGOUT" });
      }

      if (mounted) {
        dispatch({ type: "SET_INITIALIZED", payload: true });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => ({ ...state, dispatch }), [state]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
      console.log("User logged in:", action.payload);

      return {
        ...state,
        user: action.payload,
        loading: false,
      };

    case "LOGOUT":
      // Sign out from Firebase if not already signed out
      if (auth.currentUser) {
        auth.signOut().catch(console.error);
      }

      // Clear all localStorage
      localStorage.clear();
      console.log("User logged out");

      return {
        ...state,
        user: null,
        loading: false,
      };

    case "UPDATE_USER":
      const updatedUser = {
        ...state.user,
        ...action.payload,
      };

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("User updated:", updatedUser);

      return {
        ...state,
        user: updatedUser,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_INITIALIZED":
      return {
        ...state,
        initialized: action.payload,
        loading: action.payload ? false : state.loading,
      };

    default:
      return state;
  }
};

// Additional hook for checking specific permissions
export const usePermissions = () => {
  const { user, loading } = useUser();

  return {
    loading,
    isAuthenticated: !!user,
    isStore: user?.isStore || false,
    isAdmin: user?.isAdmin || false,
    canAccessStore: user?.isStore || false,
    user,
  };
};
