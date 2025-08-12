// frontend/src/security/routePolicy.js
// Route-level policies in one place

export const POLICIES = {
  "/myProfile":        { requireAuth: true },
  "/myOrders":         { requireAuth: true, anyOfPermissions: ["orders:read"] },
  "/cart":             { requireAuth: true, anyOfPermissions: ["cart:read"] },
  "/checkout/:sellerId": { requireAuth: true, requireMFA: true, anyOfPermissions: ["orders:create"] },
  "/myShop":           { requireAuth: true, roles: ["seller", "admin"], anyOfPermissions: ["orders:manage"] },
  "/seller":           { requireAuth: true, roles: ["seller", "admin"] }, // if this is a seller dashboard
  // public pages need no policy
};
