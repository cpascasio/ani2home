const SecurityLogger = require("../utils/SecurityLogger");

// Generic error messages (Requirement 2.4.2)
const GENERIC_ERRORS = {
  400: "Bad Request - The request could not be processed",
  401: "Unauthorized - Authentication required",
  403: "Forbidden - Access denied",
  404: "Not Found - The requested resource was not found",
  429: "Too Many Requests - Rate limit exceeded",
  500: "Internal Server Error - An unexpected error occurred",
  503: "Service Unavailable - Server temporarily unavailable",
};

// Main error handler (Requirement 2.4.1)
const errorHandler = async (err, req, res, next) => {
  // Log the error without exposing details
  const errorId = require("crypto").randomBytes(8).toString("hex");

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Log error details (internal only)
  await SecurityLogger.logSecurityEvent("APPLICATION_ERROR", {
    userId: req.user?.uid || req.session?.userId || null,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    endpoint: req.originalUrl,
    method: req.method,
    severity: statusCode >= 500 ? "high" : "medium",
    description: `Application error: ${err.message}`,
    metadata: {
      errorId,
      statusCode,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });

  // Generic response (no debugging info)
  const response = {
    error: true,
    message: GENERIC_ERRORS[statusCode] || GENERIC_ERRORS[500],
    errorId, // For support purposes
    timestamp: new Date().toISOString(),
  };

  // Add additional info for development only
  if (process.env.NODE_ENV === "development") {
    response.devInfo = {
      originalMessage: err.message,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
};

// 404 handler
const notFoundHandler = async (req, res) => {
  await SecurityLogger.logSecurityEvent("RESOURCE_NOT_FOUND", {
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    endpoint: req.originalUrl,
    method: req.method,
    description: "Attempted access to non-existent resource",
  });

  res.status(404).json({
    error: true,
    message: GENERIC_ERRORS[404],
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler, notFoundHandler };
