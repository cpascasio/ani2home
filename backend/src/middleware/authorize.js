// backend/src/middleware/authorize.js
const { ROLES, hasPermission } = require("../security/authorization");

module.exports = (requirement = {}) => (req, res, next) => {
  try {
    const u = req.user; // set by your decodeToken middleware

    // Compute role from claims
    const role =
      u?.admin ? ROLES.ADMIN :
      (u?.isStore ? ROLES.SELLER :
      (u ? ROLES.CUSTOMER : ROLES.GUEST));

    const principal = {
      role,
      attrs: {
        uid: u?.uid,
        email: u?.email,
        isStore: !!u?.isStore,
        mfaVerified: !!u?.mfaVerified, // set this during token decode or session verify
      },
    };

    // Default deny on uncertainty
    if (!hasPermission(principal, requirement)) {
      // If the route explicitly requires auth and we have no user, return 401; else 403
      if (requirement.requireAuth && !u) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  } catch (err) {
    // Fail securely: deny on errors (don’t leak details)
    return res.status(403).json({ error: "Forbidden" });
  }
};
