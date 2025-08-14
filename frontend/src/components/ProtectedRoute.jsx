// ============================================
// OPTION 1: Fix ProtectedRoute.jsx to use multiple user sources
// ============================================

// Updated ProtectedRoute.jsx with better user info collection

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSecureAuth } from "../hooks/useSecureAuth";
import { useUser } from "../context/UserContext"; // ✅ ADD THIS IMPORT
import axios from "axios";

// ✅ UPDATED: Route Access Logger Helper with better user info
const RouteAccessLogger = {
  async logUnauthorizedAccess(
    attemptedRoute,
    accessType,
    userInfo,
    reason = null
  ) {
    try {
      // ✅ ENHANCED: Collect user info from multiple sources
      const userData = {
        uid: userInfo?.uid || userInfo?.userId || null,
        email: userInfo?.email || null,
        isAdmin: userInfo?.isAdmin || false,
        isStore: userInfo?.isStore || false,
        username: userInfo?.username || userInfo?.userName || null,
        // Add more fields as needed
      };

      console.log("🔍 Logging access attempt with user data:", userData);

      await axios.post(
        "http://localhost:3000/api/auth/log-unauthorized-access",
        {
          attemptedRoute,
          accessType,
          userInfo: userData,
          reason,
          timestamp: new Date().toISOString(),
        }
      );

      console.log(`🛡️ Logged unauthorized access attempt to ${attemptedRoute}`);
    } catch (error) {
      console.error("Failed to log unauthorized route access:", error);
      // Don't block the UI if logging fails
    }
  },
};

const ProtectedRoute = ({
  children,
  requireAuth = false,
  requireNoAuth = false,
  requireStore = false,
  requireAdmin = false,
  redirectTo = "/login",
  publicAccess = false,
}) => {
  const {
    firebaseUser,
    loading,
    localUser,
    validateStoreAccess,
    validateAdminAccess,
    isAuthenticated,
  } = useSecureAuth();

  // ✅ ADD: Get user from UserContext as backup
  const { user: contextUser } = useUser();

  const [storeValidated, setStoreValidated] = useState(null);
  const [adminValidated, setAdminValidated] = useState(null);
  const [validating, setValidating] = useState(false);
  const [accessLogged, setAccessLogged] = useState(false);
  const location = useLocation();

  // ✅ ENHANCED: Combine user info from multiple sources
  const getUserInfo = () => {
    // Priority: firebaseUser > contextUser > localUser
    const user = firebaseUser || contextUser || localUser || {};

    return {
      uid: user.uid || user.userId || null,
      email: user.email || null,
      isAdmin: user.isAdmin || false,
      isStore: user.isStore || false,
      username: user.username || user.userName || user.displayName || null,
    };
  };

  // ✅ UPDATED: Log unauthorized access attempts with better user info
  const logUnauthorizedAccess = async (accessType, reason) => {
    if (accessLogged) return; // Prevent duplicate logs

    const userInfo = getUserInfo();
    console.log("🔍 User info for logging:", userInfo);

    await RouteAccessLogger.logUnauthorizedAccess(
      location.pathname,
      accessType,
      userInfo,
      reason
    );
    setAccessLogged(true);
  };

  // Debug logging - ✅ ENHANCED
  console.log("ProtectedRoute Debug:", {
    path: location.pathname,
    requireAuth,
    requireStore,
    requireAdmin,
    isAuthenticated,
    firebaseUser: firebaseUser
      ? { uid: firebaseUser.uid, email: firebaseUser.email }
      : null,
    contextUser: contextUser
      ? { uid: contextUser.uid || contextUser.userId, email: contextUser.email }
      : null,
    localUser: localUser
      ? { uid: localUser.uid || localUser.userId, email: localUser.email }
      : null,
    combinedUserInfo: getUserInfo(),
    storeValidated,
    adminValidated,
    validating,
    loading,
  });

  // For store routes, validate with backend
  useEffect(() => {
    if (
      requireStore &&
      isAuthenticated &&
      storeValidated === null &&
      !validating
    ) {
      console.log("Starting store validation...");
      setValidating(true);

      validateStoreAccess()
        .then((hasAccess) => {
          console.log("Store validation result:", hasAccess);
          setStoreValidated(hasAccess);

          if (!hasAccess) {
            logUnauthorizedAccess(
              "store",
              "Store privileges required but user lacks store access"
            );
          }
        })
        .catch((error) => {
          console.error("Store validation error:", error);
          setStoreValidated(false);
          logUnauthorizedAccess("store", "Store validation failed");
        })
        .finally(() => {
          setValidating(false);
        });
    }
  }, [
    requireStore,
    isAuthenticated,
    storeValidated,
    validateStoreAccess,
    validating,
  ]);

  // For admin routes, validate with backend
  useEffect(() => {
    if (
      requireAdmin &&
      isAuthenticated &&
      adminValidated === null &&
      !validating
    ) {
      console.log("Starting admin validation...");
      setValidating(true);

      validateAdminAccess()
        .then((hasAccess) => {
          console.log("Admin validation result:", hasAccess);
          setAdminValidated(hasAccess);

          if (!hasAccess) {
            logUnauthorizedAccess(
              "admin",
              "Admin privileges required but user lacks admin access"
            );
          }
        })
        .catch((error) => {
          console.error("Admin validation error:", error);
          setAdminValidated(false);
          logUnauthorizedAccess("admin", "Admin validation failed");
        })
        .finally(() => {
          setValidating(false);
        });
    }
  }, [
    requireAdmin,
    isAuthenticated,
    adminValidated,
    validateAdminAccess,
    validating,
  ]);

  // Log unauthenticated access attempts
  useEffect(() => {
    if (requireAuth && !loading && !isAuthenticated) {
      logUnauthorizedAccess(
        "authenticated",
        "Authentication required but user not logged in"
      );
    }
  }, [requireAuth, loading, isAuthenticated]);

  // Reset access logged when route changes
  useEffect(() => {
    setAccessLogged(false);
  }, [location.pathname]);

  if (loading || validating) {
    console.log("Showing loading state:", { loading, validating });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">
            {validating ? "Validating permissions..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (publicAccess) {
    console.log("Public access granted");
    return children;
  }

  if (requireNoAuth) {
    if (isAuthenticated) {
      console.log("User authenticated, redirecting from no-auth page");
      return <Navigate to="/" replace />;
    }
    console.log("No auth required, showing page");
    return children;
  }

  if (requireAuth) {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // For admin access, check backend validation
    if (requireAdmin) {
      if (adminValidated === false) {
        console.log("Admin access denied, redirecting to unauthorized");
        return (
          <Navigate
            to="/unauthorized"
            state={{
              from: location,
              reason:
                "Admin access denied. Your account does not have administrative privileges.",
            }}
            replace
          />
        );
      }

      if (adminValidated === null) {
        console.log("Admin validation still pending...");
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Validating admin access...</p>
            </div>
          </div>
        );
      }
    }

    // For store access, check backend validation
    if (requireStore) {
      if (storeValidated === false) {
        console.log("Store access denied, redirecting to unauthorized");
        return (
          <Navigate
            to="/unauthorized"
            state={{
              from: location,
              reason:
                "Store access denied. Your account may not have seller privileges or may be disabled.",
            }}
            replace
          />
        );
      }

      if (storeValidated === null) {
        console.log("Store validation still pending...");
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Validating store access...</p>
            </div>
          </div>
        );
      }
    }

    console.log("All checks passed, showing protected content");
    return children;
  }

  console.log("Default case, showing children");
  return children;
};

export default ProtectedRoute;
