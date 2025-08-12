// frontend/src/security/authorization.js
// Centralized authorization helpers (RBAC + simple ABAC via attributes)

export const ROLES = {
  GUEST: "guest",
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

// Map roles -> permissions (coarse RBAC baseline)
const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [],
  [ROLES.CUSTOMER]: [
    "cart:read", "cart:write",
    "orders:read", "orders:create",
    "profile:read", "profile:update",
  ],
  [ROLES.SELLER]: [
    "cart:read",
    "orders:read", "orders:manage", // manage own shop orders
    "shop:read", "shop:update", "products:create", "products:update",
  ],
  [ROLES.ADMIN]: ["*"], // full control
};

// Single function to normalize your user into a role + attributes
export function derivePrincipal(userFromContext) {
  if (!userFromContext) {
    return { role: ROLES.GUEST, attrs: {} };
  }

  // Persisted in localStorage by your Login flow:
  const mfaVerified = localStorage.getItem("mfaVerified") === "true";

  // Your Firestore userData is injected into UserContext on login:
  const {
    isStore = false,
    isVerified = false, // seller verification, if you use it
    uid,
    email,
    ...rest
  } = userFromContext;

  // Derive role
  let role = ROLES.CUSTOMER;
  if (isStore) role = ROLES.SELLER;
  if (rest?.customClaims?.admin === true) role = ROLES.ADMIN; // optional if you set custom claims

  return {
    role,
    attrs: {
      uid,
      email,
      isStore,
      isVerified,
      mfaVerified,
      ...rest,
    },
  };
}

// Policy-aware permission check
export function hasPermission(principal, requirement = {}) {
  const { role, attrs } = principal;
  const {
    anyOfPermissions,     // e.g., ["orders:manage", "orders:read"]
    allOfPermissions,     // e.g., ["profile:read", "mfa:verified"]
    roles,                // e.g., ["seller"]
    requireAuth,          // boolean
    requireMFA,           // boolean
    predicate,            // (attrs) => boolean  (ABAC hook)
  } = requirement;

  // 1) Auth gate
  if (requireAuth && role === ROLES.GUEST) return false;

  // 2) MFA gate
  if (requireMFA && !attrs.mfaVerified) return false;

  // 3) Role gate
  if (roles?.length && !roles.includes(role)) return false;

  // 4) Permission gate (RBAC)
  const granted = ROLE_PERMISSIONS[role] || [];
  const has = (perm) => granted.includes("*") || granted.includes(perm);

  if (allOfPermissions?.length && !allOfPermissions.every(has)) return false;
  if (anyOfPermissions?.length && !anyOfPermissions.some(has)) return false;

  // 5) Attribute/predicate gate (ABAC)
  if (typeof predicate === "function" && !predicate(attrs)) return false;

  return true;
}
