const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const { initializeDatabase } = require("./config/database");
const { authenticateToken } = require("./middleware/auth");
const { setupSocketHandlers } = require("./socket/handlers");

const app = express();
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
app.use(helmet());
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
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialize database
initializeDatabase();

// Import and use routes
try {
  const authRoutes = require("./routes/auth");
  const medicationRoutes = require("./routes/medications");
  const caretakerRoutes = require("./routes/caretaker");
  const analyticsRoutes = require("./routes/analytics");
  const uploadRoutes = require("./routes/uploads");
  const dashboardRoutes = require("./routes/dashboard");

  // Register routes
  app.use("/api/auth", authRoutes);
  app.use("/api/medications", authenticateToken, medicationRoutes);
  app.use("/api/caretaker", authenticateToken, caretakerRoutes);
  app.use("/api/analytics", authenticateToken, analyticsRoutes);
  app.use("/api/uploads", authenticateToken, uploadRoutes);
  app.use("/api/dashboard", authenticateToken, dashboardRoutes);

  console.log("Routes registered successfully");
} catch (error) {
  console.error("Error registering routes:", error);
  process.exit(1);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Setup socket handlers
setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = { app, server };
