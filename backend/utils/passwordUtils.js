const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class PasswordManager {
  static async hashPassword(password) {
    // Generate a salt with 12 rounds (cryptographically strong)
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Additional pepper for extra security (optional)
  static addPepper(password) {
    const pepper = process.env.PASSWORD_PEPPER || "your-secret-pepper";
    return crypto.createHmac("sha256", pepper).update(password).digest("hex");
  }
}

module.exports = PasswordManager;
