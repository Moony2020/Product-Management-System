/**
 * Entry point for the Product Management System backend server.
 * Configures middleware, routes, and database connections.
 */
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const categoryRoutes = require("./routes/categories"); // Import category routes
const productRoutes = require("./routes/products"); // Import product routes

const app = express();
const PORT = 3000;

// Middleware to enable CORS (Cross-Origin Resource Sharing).
app.use(cors());
// Middleware to parse incoming JSON requests.
app.use(express.json());
// Serve static files from the "public" folder.
app.use(express.static(path.join(__dirname, "Frontend")));

/**
 * Middleware to set Content-Security-Policy headers.
 * Ensures images are loaded only from the server.
 *
 * @param {Object} req - Incoming request object.
 * @param {Object} res - Outgoing response object.
 * @param {Function} next - Callback to proceed to the next middleware.
 */
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' http://localhost:3000"
  );
  next();
});

/**
 * Middleware to log incoming requests.
 *
 * @param {Object} req - Incoming request object.
 * @param {Object} res - Outgoing response object.
 * @param {Function} next - Callback to proceed to the next middleware.
 */
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

// MongoDB connection URI.
// const dbURI = process.env.MONGO_URI;
// Connect to MongoDB Atlas.
// Logs success or error messages based on connection status.

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    // Start the server only after the database is connected
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => console.log("Error connecting to MongoDB:", error));

/**
 * Use routes for category management.
 * Route prefix: /v1/categories
 */
app.use("/v1/categories", categoryRoutes);

/**
 * Use routes for product management.
 * Route prefix: /v1/products
 */
app.use("/v1/products", productRoutes);

/**
 * Root route for the homepage.
 * Responds with a welcome message.
 *
 * @param {Object} req - Incoming request object.
 * @param {Object} res - Outgoing response object.
 */
app.get("/", (req, res) => {
  res.send("Welcome to the Product Management System!");
});
