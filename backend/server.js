const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Import debugging function

// Import database configuration
const { db, initializeDatabase } = require("./config/database-adapter");
const { authenticateToken } = require("./middleware/auth");
const { setupSocketHandlers } = require("./socket/handlers");

const app = express();

// Add route debugging BEFORE registering any routes
console.log("🔧 Setting up route debugging...");


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialize database
console.log("🔧 Initializing database...");
try {
  initializeDatabase();
  console.log("✅ Database initialized successfully");
} catch (error) {
  console.error("❌ Database initialization failed:", error.message);
  process.exit(1);
}

// Health check endpoint (before other routes)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Import and register routes with individual error handling
console.log("📋 Registering routes...");

// Register each route with try-catch
const routeConfigs = [
  { path: "/api/auth", file: "./routes/auth", middleware: [] },
  {
    path: "/api/medications",
    file: "./routes/medications",
    middleware: [authenticateToken],
  },
  {
    path: "/api/caretaker",
    file: "./routes/caretaker",
    middleware: [authenticateToken],
  },
  {
    path: "/api/analytics",
    file: "./routes/analytics",
    middleware: [authenticateToken],
  },
  {
    path: "/api/uploads",
    file: "./routes/uploads",
    middleware: [authenticateToken],
  },
  {
    path: "/api/dashboard",
    file: "./routes/dashboard",
    middleware: [authenticateToken],
  },
];

routeConfigs.forEach(({ path, file, middleware }) => {
  try {
    console.log(`📁 Loading route: ${file}`);
    const router = require(file);

    if (middleware.length > 0) {
      app.use(path, ...middleware, router);
    } else {
      app.use(path, router);
    }

    console.log(`✅ Route registered: ${path}`);
  } catch (error) {
    console.error(`❌ Error loading route ${file}:`, error.message);
    console.error(`   Stack: ${error.stack}`);
    process.exit(1);
  }
});

// Print all registered routes for debugging
// app.printRoutes();

// API documentation endpoint - FIXED duplicate parameter names
app.get("/api", (req, res) => {
  res.json({
    name: "Medication Management System API",
    version: "1.0.0",
    description:
      "Backend API for managing medications and patient-caretaker relationships",
    endpoints: {
      auth: {
        "POST /api/auth/login": "Login with username or email",
        "POST /api/auth/signup": "Create new account",
      },
      medications: {
        "GET /api/medications": "Get user medications",
        "POST /api/medications": "Add new medication",
        "PUT /api/medications/:medicationId": "Update medication",
        "DELETE /api/medications/:medicationId": "Delete medication",
        "POST /api/medications/:medicationId/mark-taken":
          "Mark medication as taken",
        "GET /api/medications/:medicationId/logs": "Get medication logs",
      },
      dashboard: {
        "GET /api/dashboard/stats": "Get dashboard statistics",
      },
      caretaker: {
        "GET /api/caretaker/patients": "Get caretaker's patients",
        "POST /api/caretaker/patients": "Add patient to caretaker",
        "GET /api/caretaker/patients/:patientId/medications":
          "Get patient medications",
        "POST /api/caretaker/patients/:patientId/medications/:medicationId/mark-taken":
          "Mark patient medication as taken",
      },
      analytics: {
        "GET /api/analytics/adherence": "Get adherence analytics",
      },
      uploads: {
        "POST /api/uploads/medication-photo": "Upload medication photo",
        "GET /api/uploads/medication-photos/:medicationLogId":
          "Get medication photos",
      },
    },
    websocket: {
      events: [
        "medication_added",
        "medication_updated",
        "medication_deleted",
        "medication_taken",
        "patient_medication_added",
        "patient_medication_taken",
      ],
    },
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../build");

  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.join(buildPath, "index.html"));
    });
  } else {
    console.log("⚠️ Build directory not found, serving API only");
  }
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err.stack);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large" });
  }

  // Default error response
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.path,
    method: req.method,
  });
});

// Setup WebSocket handlers
console.log("🔌 Setting up WebSocket handlers...");
try {
  setupSocketHandlers(io);
  console.log("✅ WebSocket handlers initialized");
} catch (error) {
  console.error("❌ WebSocket setup failed:", error.message);
}

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log("🔌 HTTP server closed");

    // Close database connection
    if (db && db.close) {
      db.close();
      console.log("🗄️ Database connection closed");
    }

    // Close socket connections
    io.close(() => {
      console.log("🔌 WebSocket server closed");
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      "❌ Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// Start the server
server.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 Medication Management System Backend");
  console.log("=".repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `🎯 Frontend URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
    );
  }

  console.log("=".repeat(50));
  console.log("✅ Server is ready to accept connections!");
  console.log("=".repeat(50) + "\n");
});

// Export for testing
module.exports = { app, server, io };
