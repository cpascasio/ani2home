class PasswordValidator {
  static validate(password) {
    const errors = [];

    // Requirement 2.1.6: Length requirements
    if (password.length < 12) {
      errors.push("Password must be at least 12 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must not exceed 128 characters");
    }

    // Requirement 2.1.5: Complexity requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase)
      errors.push("Password must contain at least one uppercase letter");
    if (!hasLowerCase)
      errors.push("Password must contain at least one lowercase letter");
    if (!hasNumbers) errors.push("Password must contain at least one number");
    if (!hasSpecialChar)
      errors.push("Password must contain at least one special character");

    // Check for common patterns
    const commonPatterns = [/12345/, /password/i, /qwerty/i, /abc123/i];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push("Password contains common patterns that are not allowed");
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = PasswordValidator;
