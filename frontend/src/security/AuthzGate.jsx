// frontend/src/security/AuthzGate.jsx
import React from "react";
import PropTypes from "prop-types";
import { useUser } from "../context/UserContext";
import { derivePrincipal, hasPermission } from "./authorization";
import { Navigate, useLocation } from "react-router-dom";

// Generic guard for routes and components
export default function AuthzGate({
  require,         // requirement object for hasPermission()
  fallback,        // JSX to render if unauthorized (optional)
  redirectTo,      // path to redirect if unauthorized (optional)
  children,
}) {
  const { user } = useUser();
  const principal = derivePrincipal(user);
  const ok = hasPermission(principal, require || {});
  const location = useLocation();

  if (!ok) {
    // If auth is required, redirect to login with return path:
    if (require?.requireAuth && redirectTo) {
      return <Navigate to={`${redirectTo}?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
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
