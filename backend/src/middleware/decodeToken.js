// backend/src/middleware/decodeToken.js
const admin = require("firebase-admin");

// Initialize admin elsewhere once with service account
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

module.exports = async function decodeToken(req, res, next) {
  try {
    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
    if (!token) {
      req.user = null;
      return next(); // leave as guest; authorize() will decide
    }

    const decoded = await admin.auth().verifyIdToken(token, true);
    // Example: you might also load your users/{uid} doc here for isStore, etc.
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      admin: !!decoded.admin,     // custom claim
      isStore: !!decoded.isStore, // custom claim you set on the user
      mfaVerified: !!decoded.mfa, // optional claim you set after MFA
    };
    return next();
  } catch (err) {
    // Treat invalid token as unauthenticated; do not crash pipeline
    req.user = null;
    return next();
  }
};
