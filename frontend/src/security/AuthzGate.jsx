// frontend/src/security/AuthzGate.jsx
import React from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { derivePrincipal, hasPermission } from "./authorization";

// Generic guard for routes and components
export default function AuthzGate({
  require,         // requirement object for hasPermission()
  fallback,        // JSX to render if unauthorized (optional)
  redirectTo = "/login", // path to redirect if unauthorized (optional)
  children,
}) {
  const { user, loading, error } = useUser();
  const location = useLocation();

  // Fail securely on uncertainty: don't render protected content during loading/errors
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="animate-pulse">Checking access…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 opacity-80">Please try again.</p>
        </div>
      </div>
    );
  }

  const principal = derivePrincipal(user); // returns { role: GUEST } if user is null
  const ok = hasPermission(principal, require || {});

  if (!ok) {
    // If auth is required, redirect to login with return path:
    if (require?.requireAuth && redirectTo) {
      const next = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`${redirectTo}?next=${next}`} replace />;
    }
    // Else render a fallback (403)
    return (
      fallback || (
        <div className="min-h-[40vh] flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Not authorized</h2>
            <p className="mt-2 opacity-80">You don’t have permission to access this resource.</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

AuthzGate.propTypes = {
  require: PropTypes.object,
  fallback: PropTypes.node,
  redirectTo: PropTypes.string,
  children: PropTypes.node.isRequired,
};
