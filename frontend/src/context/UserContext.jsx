import React, { createContext, useContext, useEffect, useReducer, useMemo } from "react";
import PropTypes from "prop-types";
import { auth } from "../config/firebase-config";

export const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, { user: null });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "LOGIN", payload: user });
    }
  }, []);

  // Memoize the value to prevent unnecessary re-renders on context consumers
  const value = useMemo(() => ({ ...state, dispatch }), [state]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      auth.signOut();
      localStorage.clear();
      return { user: null };
    case "UPDATE_USER":
      // Merge the new properties with existing user data
      const updatedUser = {
        ...state.user,
        ...action.payload,
      };

      // Update localStorage to persist the changes
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return { user: updatedUser };
    default:
      return state;
  }
};
