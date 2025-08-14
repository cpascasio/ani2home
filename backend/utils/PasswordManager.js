// backend/utils/PasswordManager.js
const bcrypt = require("bcrypt");

class PasswordManager {
  static async hashPassword(password) {
    const saltRounds = 12; // Strong salt rounds
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = PasswordManager;
