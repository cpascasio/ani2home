// backend/utils/PasswordValidator.js
class PasswordValidator {
  static validate(password) {
    const errors = [];
    let isValid = true;

    // Requirement 2.1.6: Password length requirements
    if (password.length < 12) {
      errors.push("Password must be at least 12 characters long");
      isValid = false;
    }

    if (password.length > 128) {
      errors.push("Password must not exceed 128 characters");
      isValid = false;
    }

    // Requirement 2.1.5: Password complexity requirements
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
      isValid = false;
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
      isValid = false;
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
      isValid = false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
      isValid = false;
    }

    // Check for common weak patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push(
        "Password cannot contain three or more consecutive identical characters"
      );
      isValid = false;
    }

    // Check for keyboard patterns
    const keyboardPatterns = [
      "qwerty",
      "asdf",
      "zxcv",
      "1234",
      "abcd",
      "qwertyuiop",
      "asdfghjkl",
      "zxcvbnm",
    ];

    for (const pattern of keyboardPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        errors.push("Password cannot contain common keyboard patterns");
        isValid = false;
        break;
      }
    }

    // Check for common passwords
    const commonPasswords = [
      "password",
      "password123",
      "admin",
      "administrator",
      "welcome",
      "welcome123",
      "changeme",
      "default",
    ];

    for (const common of commonPasswords) {
      if (password.toLowerCase().includes(common.toLowerCase())) {
        errors.push("Password cannot contain common password patterns");
        isValid = false;
        break;
      }
    }

    return {
      isValid,
      errors,
      score: this.calculateStrength(password),
    };
  }

  static calculateStrength(password) {
    let score = 0;

    // Length scoring
    if (password.length >= 12) score += 20;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Complexity scoring
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.6) score += 10;

    return Math.min(100, score);
  }
}

module.exports = PasswordValidator;
