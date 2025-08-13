// backend/src/security/authorization.js
// Mirrors your FE logic (RBAC + optional ABAC via predicate)

const ROLES = {
  GUEST: "guest",
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

// Coarse RBAC map (keep in sync with FE)
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
  [ROLES.ADMIN]: ["*"],
};

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

  // 1) Auth gate
  if (requireAuth && role === ROLES.GUEST) return false;

  // 2) MFA gate
  if (requireMFA && !attrs.mfaVerified) return false;

  // 3) Role gate
  if (roles?.length && !roles.includes(role)) return false;

  // 4) Permission gate
  const granted = ROLE_PERMISSIONS[role] || [];
  const has = (perm) => granted.includes("*") || granted.includes(perm);
  if (allOfPermissions?.length && !allOfPermissions.every(has)) return false;
  if (anyOfPermissions?.length && !anyOfPermissions.some(has)) return false;

  // 5) Attribute/predicate gate (ABAC hook)
  if (typeof predicate === "function" && !predicate(attrs)) return false;

  return true;
}

module.exports = { ROLES, hasPermission };
