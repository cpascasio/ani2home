// backend/src/middleware/authorize.js
// Self‑contained authorization middleware (no external imports)

const ROLES = {
  GUEST: "guest",
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

// Keep this in sync with the FE map
const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [],
  [ROLES.CUSTOMER]: [
    "cart:read", "cart:write",
    "orders:read", "orders:create",
    "profile:read", "profile:update",
  ],
  [ROLES.SELLER]: [
    "cart:read",
    "orders:read", "orders:manage",
    "shop:read", "shop:update", "products:create", "products:update",
  ],
  [ROLES.ADMIN]: ["*"], // full control
};

// Policy evaluator (RBAC + optional ABAC predicate)
function hasPermission(principal, requirement = {}) {
  const { role, attrs = {} } = principal || {};
  const {
    anyOfPermissions,
    allOfPermissions,
    roles,
    requireAuth,
    requireMFA,
    predicate, // (attrs) => boolean
  } = requirement;

  // 1) Auth
  if (requireAuth && role === ROLES.GUEST) return false;

  // 2) MFA
  if (requireMFA && !attrs.mfaVerified) return false;

  // 3) Role
  if (roles?.length && !roles.includes(role)) return false;

  // 4) Permissions
  const granted = ROLE_PERMISSIONS[role] || [];
  const has = (perm) => granted.includes("*") || granted.includes(perm);

  if (allOfPermissions?.length && !allOfPermissions.every(has)) return false;
  if (anyOfPermissions?.length && !anyOfPermissions.some(has)) return false;

  // 5) ABAC hook
  if (typeof predicate === "function" && !predicate(attrs)) return false;

  return true;
}

/**
 * authorize(requirement)
 * requirement example:
 *  { requireAuth: true, requireMFA: true, roles: ["seller","admin"], anyOfPermissions: ["products:create"] }
 *
 * decodeToken middleware should set req.user with:
 *  { uid, email, isStore, admin, mfaVerified, ... }
 */
function authorize(requirement = {}) {
  return (req, res, next) => {
    try {
      const u = req.user; // may be undefined → guest

      // Derive normalized role from decoded claims
      const role = u?.admin
        ? ROLES.ADMIN
        : (u?.isStore
            ? ROLES.SELLER
            : (u
                ? ROLES.CUSTOMER
                : ROLES.GUEST));

      const principal = {
        role,
        attrs: {
          uid: u?.uid,
          email: u?.email,
          isStore: !!u?.isStore,
          mfaVerified: !!u?.mfaVerified,
          // add more attrs here if your routes need them for predicate checks
        },
      };

      // Evaluate policy
      if (!hasPermission(principal, requirement)) {
        // If the route explicitly requires auth and we have no user → 401
        if (requirement.requireAuth && !u) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        // Otherwise → 403 (fail closed)
        return res.status(403).json({ error: "Forbidden" });
      }

      // Optional: expose principal for downstream handlers (useful for ABAC)
      req.principal = principal;

      return next();
    } catch (err) {
      // Fail securely on unexpected errors
      return res.status(403).json({ error: "Forbidden" });
    }
  };
}

module.exports = authorize;
