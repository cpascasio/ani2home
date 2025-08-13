import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase-config";
import axios from "axios";

export const useSecureAuth = () => {
  const [firebaseUser, loading] = useAuthState(auth);
  const [validatedPermissions, setValidatedPermissions] = useState(null);
  const [validating, setValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);

  // Get localStorage user data (for display/UX only)
  const getLocalUser = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Validate permissions with backend
  const validatePermissions = async (force = false) => {
    if (!firebaseUser) return null;

    // Only validate every 5 minutes unless forced
    const now = Date.now();
    if (!force && lastValidation && now - lastValidation < 5 * 60 * 1000) {
      return validatedPermissions;
    }

    setValidating(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await axios.get("/api/auth/validate-permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.valid) {
        setValidatedPermissions(response.data.permissions);
        setLastValidation(now);
        return response.data.permissions;
      } else {
        setValidatedPermissions(null);
        return null;
      }
    } catch (error) {
      console.error("Permission validation failed:", error);
      setValidatedPermissions(null);
      return null;
    } finally {
      setValidating(false);
    }
  };

  // Validate store access specifically
  const validateStoreAccess = async () => {
    if (!firebaseUser) return false;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await axios.get("/api/auth/validate-store-access", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.hasAccess;
    } catch (error) {
      console.error("Store access validation failed:", error);
      return false;
    }
  };

  return {
    // Firebase auth state
    firebaseUser,
    loading,

    // Local user data (for display only)
    localUser: getLocalUser(),

    // Validated permissions (secure)
    validatedPermissions,
    validating,

    // Functions
    validatePermissions,
    validateStoreAccess,

    // Computed values
    isAuthenticated: !!firebaseUser,
    isLocalStore: getLocalUser()?.isStore || false, // For UI display
  };
};
