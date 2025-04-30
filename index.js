require("dotenv").config();
const express = require("express");
const connectDB = require("./config/dbconfig");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const { swaggerUI, swaggerSpec } = require("./swagger");
const multer = require("multer");
const upload = multer();

// Import route modules
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");


// Configure port
const PORT = process.env.PORT || 8080;

// Connect to database
connectDB();

// Enhanced CORS configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["set-cookie"],
};

// Security middleware
app.use(helmet()); // Add basic security headers
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(upload.any());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));



// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);


app.use("/", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  // Don't crash the server, but log the error
});

module.exports = app; // Export for testing purposes
