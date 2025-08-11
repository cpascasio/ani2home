// backend/middleware/selectiveAuth.js
// This middleware allows GET requests without authentication
// but requires authentication for POST, PUT, DELETE

const { authenticateUser } = require("./auth");

const selectiveAuth = (req, res, next) => {
  // Allow all GET requests without authentication
  if (req.method === "GET") {
    return next();
  }

  // Require authentication for POST, PUT, DELETE, PATCH
  return authenticateUser(req, res, next);
};

const selectiveAuthForStore = (req, res, next) => {
  // Allow all GET requests without authentication
  if (req.method === "GET") {
    return next();
  }

  // For non-GET requests, authenticate and check if user is a store
  authenticateUser(req, res, (err) => {
    if (err) return next(err);

    // Check if user is a store
    if (!req.user || !req.user.isStore) {
      return res.status(403).json({
        message: "Store access required",
        state: "error",
      });
    }

    next();
  });
};

module.exports = {
  selectiveAuth,
  selectiveAuthForStore,
};
