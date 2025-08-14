// frontend/src/components/ProtectedRoute.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSecureAuth } from "../hooks/useSecureAuth";

const ProtectedRoute = ({
  children,
  requireAuth = false,
  requireNoAuth = false,
  requireStore = false,
  requireAdmin = false, // 🆕 NEW: Admin requirement
  redirectTo = "/login",
  publicAccess = false,
}) => {
  const {
    firebaseUser,
    loading,
    localUser,
    validateStoreAccess,
    validateAdminAccess, // 🆕 NEW: Admin validation function
    isAuthenticated,
  } = useSecureAuth();

  const [storeValidated, setStoreValidated] = useState(null);
  const [adminValidated, setAdminValidated] = useState(null); // 🆕 NEW: Admin validation state
  const [validating, setValidating] = useState(false);
  const location = useLocation();

  const logUiAttempt = useCallback(
    async (target, result, reason) => {
      try {
        const token = await firebaseUser?.getIdToken?.();
        const res = await fetch("/api/auth/ui-access-attempt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            target,
            result,
            reason,
            path: location.pathname,
          }),
          credentials: "include",
        });
        if (!res.ok) {
          console.error(
            "[ui-access-attempt] HTTP",
            res.status,
            await res.text()
          );
        }
      } catch (e) {
        console.error("[ui-access-attempt] failed:", e);
      }
    },
    [firebaseUser, location.pathname]
  );

  // Debug logging
  console.log("ProtectedRoute Debug:", {
    path: location.pathname,
    requireAuth,
    requireStore,
    requireAdmin, // 🆕 NEW
    isAuthenticated,
    firebaseUser: !!firebaseUser,
    localUser: localUser,
    storeValidated,
    adminValidated, // 🆕 NEW
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
        })
        .catch((error) => {
          console.error("Store validation error:", error);
          setStoreValidated(false);
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

  // 🆕 NEW: For admin routes, validate with backend
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
        })
        .catch((error) => {
          console.error("Admin validation error:", error);
          setAdminValidated(false);
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
      logUiAttempt("protected", "blocked", "noauth_page_while_authenticated");
      return <Navigate to="/" replace />;
    }
    console.log("No auth required, showing page");
    return children;
  }

  if (requireAuth) {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      logUiAttempt(
        requireAdmin ? "admin" : requireStore ? "seller" : "protected",
        "blocked",
        "not_authenticated"
      );
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // 🆕 NEW: For admin access, check backend validation
    if (requireAdmin) {
      if (adminValidated === false) {
        logUiAttempt("admin", "blocked", "admin_denied");
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
        // logUiAttempt("seller", "blocked", "store_denied");
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
