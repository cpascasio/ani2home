import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSecureAuth } from "../hooks/useSecureAuth";

const ProtectedRoute = ({
  children,
  requireAuth = false,
  requireNoAuth = false,
  requireStore = false,
  redirectTo = "/login",
  publicAccess = false,
}) => {
  const {
    firebaseUser,
    loading,
    localUser,
    validateStoreAccess,
    isAuthenticated,
  } = useSecureAuth();

  const [storeValidated, setStoreValidated] = useState(null);
  const [validating, setValidating] = useState(false);
  const location = useLocation();

  // Debug logging
  console.log("ProtectedRoute Debug:", {
    path: location.pathname,
    requireAuth,
    requireStore,
    isAuthenticated,
    firebaseUser: !!firebaseUser,
    localUser: localUser,
    storeValidated,
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
