// frontend/src/hooks/useSecureAuth.js
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase-config";
import apiClient from "../utils/apiClient"; // 🆕 Changed from axios to apiClient

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

  // Validate store access specifically
  const validateStoreAccess = async () => {
    if (!firebaseUser) return false;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await apiClient.get("/auth/validate-store-access", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.hasAccess;
    } catch (error) {
      console.error("Store access validation failed:", error);
      return false;
    }
  };

  // 🆕 NEW: Validate admin access specifically
  const validateAdminAccess = async () => {
    if (!firebaseUser) {
      console.log("❌ [ADMIN] No Firebase user");
      return false;
    }

    try {
      console.log("🔍 [ADMIN] Starting admin validation...");
      const token = await firebaseUser.getIdToken();

      const response = await apiClient.get("/admin/validate-access", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🔍 [ADMIN] Response status:", response.status);
      console.log("🔍 [ADMIN] Response data:", response.data);

      const hasAccess = response.data.hasAccess || false;
      console.log(
        hasAccess ? "✅ [ADMIN] Access granted" : "❌ [ADMIN] Access denied"
      );

      return hasAccess;
    } catch (error) {
      console.error("❌ [ADMIN] Admin access validation failed:", error);
      console.error("❌ [ADMIN] Error details:", error.response?.data);
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
    validateAdminAccess, // 🆕 NEW: Admin validation function

    // Computed values
    isAuthenticated: !!firebaseUser,
    isLocalStore: getLocalUser()?.isStore || false, // For UI display
  };
};
