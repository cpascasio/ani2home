// backend/src/middleware/authorize.js
const { ROLES, hasPermission } = require("../security/authorization");

module.exports = (requirement = {}) => (req, res, next) => {
  try {
    const u = req.user; // set by decodeToken earlier

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
        mfaVerified: !!u?.mfaVerified,
      },
    };

    if (!hasPermission(principal, requirement)) {
      if (requirement.requireAuth && !u) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden" });
  }
};
