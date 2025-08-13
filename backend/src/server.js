const express = require("express");
const cors = require("cors"); // Import CORS module
const middleware = require("./middleware"); // Import middleware
const userRouters = require("./controllers/users"); // Import the user routes
const productRoutes = require("./controllers/products"); // Import the product routes
const cartRoutes = require("./controllers/cart"); // Import the product routes
const orderRoutes = require("./controllers/order"); // Import the order routes
const orderDetailsRoutes = require("./controllers/orderDetails"); // Import the order routes
const webhooksRoutes = require("./controllers/webhooks"); // Import the product routes
const lalamoveRoutes = require("./controllers/lalamove"); // Import the product routes
const firestoreDesignRoutes = require("./controllers/extractFirestoreDesign"); // Import the Firestore design routes
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const adminLogsRouter = require("./controllers/adminLogs");
const logger = require("./config/logger");

// ADD THESE NEW IMPORTS
const authRoutes = require("./controllers/authRoutes"); // New auth routes
const helmet = require("helmet"); // Security headers
const rateLimit = require("express-rate-limit"); // Rate limiting

// Middleware
const {
  authenticateUser,
  requireStore,
  requireAdmin,
} = require("./middleware/auth");
const {
  selectiveAuth,
  selectiveAuthForStore,
} = require("./middleware/selectiveAuth");

require("dotenv").config();

const app = express();
app.disable("x-powered-by");

// Add security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Configure based on your frontend needs
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Your React app URL
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ============================================
// RATE LIMITING
// ============================================

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter (more permissive)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
});

const port = process.env.PORT || 3000;

// Create an API router
const apiRouter = express.Router();

// Apply general rate limiting to all API routes
apiRouter.use(apiLimiter);

// PUBLIC ROUTES (No authentication required)
// Authentication routes with stricter rate limiting
apiRouter.use("/auth", authLimiter, authRoutes);

// Public webhook endpoints (from payment providers, etc.)
apiRouter.use("/webhooks", webhooksRoutes);

apiRouter.use("/lalamove", lalamoveRoutes);

apiRouter.use("/auth/register", authLimiter);
apiRouter.use("/auth/check-lockout", authLimiter);

// MIXED ACCESS ROUTES (GET = public, POST/PUT/DELETE = protected)
apiRouter.use("/users", selectiveAuth, userRouters);
apiRouter.use("/products", selectiveAuthForStore, productRoutes);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// User management routes

// Shopping cart (for buyers)
apiRouter.use("/cart", authenticateUser, cartRoutes);

// Order management
apiRouter.use("/orders", authenticateUser, orderRoutes);
apiRouter.use("/order-details", authenticateUser, orderDetailsRoutes);

// Admin routes
apiRouter.use("/firestore", authenticateUser, firestoreDesignRoutes);
apiRouter.use("/admin", authenticateUser, requireAdmin, adminLogsRouter);

// Mount the API router to the app
app.use("/api", apiRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      users: "/api/users/*",
      products: "/api/products/*",
      cart: "/api/cart/*",
      orders: "/api/orders/*",
    },
  });
});

// ============================================
// ADMIN ROUTES (Add this new section)
// ============================================

// ============================================
// ERROR HANDLING (Upgraded)
// ============================================

// 404 handler - now with logging
app.use(notFoundHandler);

// Global error handler - now with comprehensive logging
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(port, () => {
  // Use the comprehensive logger
  logger.info("Server started", {
    port,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });

  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Security features enabled:");
  console.log("- Rate limiting: ✓");
  console.log("- Security headers: ✓");
  console.log("- CORS configured: ✓");
  console.log("- Authentication middleware: ✓");
  console.log("- Comprehensive logging: ✓"); // 🆕 Add this line
});
