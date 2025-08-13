// backend/middleware/firebaseAuth.js
// Simple Firebase authentication check (like Firestore rules: request.auth != null)

const admin = require("firebase-admin");

const requireFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please authenticate",
        state: "error",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add the decoded token to the request for use in route handlers
    req.firebaseUser = decodedToken;

    next();
  } catch (error) {
    console.error("Firebase authentication error:", error);
    return res.status(401).json({
      message: "Invalid authentication token",
      state: "error",
    });
  }
};

module.exports = {
  requireFirebaseAuth,
};
