// backend/middleware/selectiveAuth.js
// This middleware allows GET requests without authentication
// but requires authentication for POST, PUT, DELETE

const { authenticateUser } = require("./auth");
const { requireFirebaseAuth } = require("./firebaseAuth");

const selectiveAuth = (req, res, next) => {
  // Allow all GET requests without authentication
  if (req.method === "GET") {
    return next();
  }

  // Special case: create-user endpoint only needs Firebase auth (not full user doc)
  if (req.method === "POST" && req.path === "/create-user") {
    return requireFirebaseAuth(req, res, next);
  }

  // Require full authentication (user must exist in database) for other POST, PUT, DELETE, PATCH
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
