const winston = require("winston");
const path = require("path");

// Create logs directory if it doesn't exist
const fs = require("fs");
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
    });
  })
);

// Create logger instance
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    // Development console output (no sensitive info)
    new winston.transports.Console({
      level: process.env.NODE_ENV === "production" ? "error" : "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Security events log (immutable, write-only)
    new winston.transports.File({
      filename: path.join(logDir, "security.log"),
      level: "info",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
    }),

    // Error log (for system errors)
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),

    // Authentication log (separate for audit)
    new winston.transports.File({
      filename: path.join(logDir, "auth.log"),
      level: "info",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
  ],
});

// Prevent log tampering in production
if (process.env.NODE_ENV === "production") {
  logger.transports.forEach((transport) => {
    if (transport.filename) {
      // Make log files read-only after writing
      transport.on("logged", () => {
        try {
          fs.chmodSync(transport.filename, 0o444); // Read-only
        } catch (error) {
          // Ignore permission errors
        }
      });
    }
  });
}

module.exports = logger;
