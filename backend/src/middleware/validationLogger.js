const Joi = require("joi");
const SecurityLogger = require("../utils/SecurityLogger");

// Enhanced validation middleware that logs failures
const validateWithLogging = (schema, target = "body") => {
  return async (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[target], {
        abortEarly: false, // Get all validation errors
        stripUnknown: true, // Remove unknown fields
      });

      if (error) {
        // Log each validation failure (Requirement 2.4.5)
        for (const detail of error.details) {
          await SecurityLogger.logValidationFailure({
            userId: req.user?.uid || req.session?.userId || null,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            endpoint: req.originalUrl,
            method: req.method,
            fieldName: detail.path.join("."),
            rule: detail.type,
            error: detail.message,
            sanitizedValue: "[INVALID_INPUT_REDACTED]",
          });
        }

        // Return generic error message
        return res.status(400).json({
          error: true,
          message: "Invalid input data provided",
          fields: error.details.map((detail) => detail.path.join(".")),
          timestamp: new Date().toISOString(),
        });
      }

      // Set validated data
      req[target] = value;
      next();
    } catch (validationError) {
      await SecurityLogger.logSecurityEvent("VALIDATION_SYSTEM_ERROR", {
        userId: req.user?.uid || req.session?.userId || null,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        endpoint: req.originalUrl,
        severity: "high",
        description: "Validation system error",
        metadata: { error: validationError.message },
      });

      res.status(500).json({
        error: true,
        message: GENERIC_ERRORS[500],
        timestamp: new Date().toISOString(),
      });
    }
  };
};

module.exports = { validateWithLogging };
