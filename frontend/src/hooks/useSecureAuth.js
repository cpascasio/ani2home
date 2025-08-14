// frontend/src/hooks/useSecureAuth.js
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase-config";
import apiClient from "../utils/apiClient";
import { useCallback } from "react";

export const useSecureAuth = () => {
  const [firebaseUser, loading] = useAuthState(auth);
  const [validatedPermissions, setValidatedPermissions] = useState(null);
  const [validating, setValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);

  // ✅ FIXED: Define localUser properly
  const localUser = getLocalUser();

  // ✅ FIXED: Define isAuthenticated
  const isAuthenticated = !!firebaseUser && !loading;

  // Get localStorage user data (for display/UX only)
  function getLocalUser() {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

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
      const response = await apiClient.get("/auth/validate-permissions", {
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

  // ✅ UPDATED: Store access validation (remove isVerified requirement)
  const validateStoreAccess = useCallback(async () => {
    if (!firebaseUser) {
      console.log("❌ No Firebase user for store validation");
      return false;
    }

    try {
      console.log("🔍 Validating store access...");
      const token = await firebaseUser.getIdToken();

      const response = await apiClient.get("/auth/validate-store-access", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🏪 Store validation response:", response.data);

      // ✅ UPDATED: Now only checks hasAccess (which is based on isStore + !isDisabled)
      return response.data.hasAccess === true;
    } catch (error) {
      console.error("❌ Store validation error:", error);
      return false;
    }
  }, [firebaseUser]);

  // ✅ UPDATED: Admin access validation (remove isVerified requirement)
  const validateAdminAccess = useCallback(async () => {
    if (!firebaseUser) {
      console.log("❌ No Firebase user for admin validation");
      return false;
    }

    try {
      console.log("🔍 Validating admin access...");
      const token = await firebaseUser.getIdToken();

      const response = await apiClient.get("/auth/validate-admin-access", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("👑 Admin validation response:", response.data);

      // ✅ UPDATED: Now only checks hasAccess (which is based on isAdmin + !isDisabled)
      return response.data.hasAccess === true;
    } catch (error) {
      console.error("❌ Admin validation error:", error);
      return false;
    }
  }, [firebaseUser]);

  return {
    // Firebase auth state
    firebaseUser,
    loading,

    // ✅ FIXED: Now properly defined
    localUser,

    // Validated permissions (secure)
    validatedPermissions,
    validating,

    // Functions
    validatePermissions,
    validateStoreAccess,
    validateAdminAccess,

    // ✅ FIXED: Now properly defined
    isAuthenticated,
    isLocalStore: localUser?.isStore || false, // For UI display
  };
};
