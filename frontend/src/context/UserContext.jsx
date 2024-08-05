import React, { createContext, useContext, useEffect, useReducer } from "react";
import { auth, provider } from "../config/firebase-config"; 

export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "LOGIN", payload: user });
    }
  }, []);
  return (
    <UserContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      auth.signOut();
      localStorage.clear();
      return { user: null };
    // other actions
    default:
      return state;
  }
};

// export const login = (dispatch) => {
//     dispatch({ type: "LOGIN" });
// };
//
// export const logout = (dispatch) => {
//     dispatch({ type: "LOGOUT" });
// };
