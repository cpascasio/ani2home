const authorize = require("./authorize"); // ✅ Import your authorize function
const { admin } = require("../config/firebase-config");

class Middleware {
  async decodeToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Missing Authorization token" });
      }

      const decoded = await admin.auth().verifyIdToken(token);
      if (!decoded) {
        return res
          .status(401)
          .json({ message: "You are not authorized to access this route" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      return res
        .status(401)
        .json({ message: "You are not authorized to access this route" });
    }
  }
}

// ✅ Export both decodeToken and authorize
module.exports = {
  decodeToken: new Middleware().decodeToken,
  authorize,
};
