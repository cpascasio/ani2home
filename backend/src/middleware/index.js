const admin = require("../config/firebase-config");

class Middleware{
    async decodeToken(req, res, next) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = await admin.auth().verifyIdToken(token);
            console.log("GET TOKEN")
            console.log(decoded);
            if (!decoded) {
                return res.status(401).json({ message: "You are not authorized to access this route" });
            }
            req.user = decoded;
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "You are not authorized to access this route" });
        }
    }
}

module.exports = new Middleware();