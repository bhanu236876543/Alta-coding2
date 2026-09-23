const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const facultyRoutes = require("./routes/facultyRoutes");
const adminRoutes = require("./routes/adminRoutes");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const testCaseRoutes = require("./routes/testCaseRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Faculty and admin routes
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);

// Database
if (require.main === module) {
  connectDB();
}

// Basic routes
app.get("/", (req, res) => {
  res.send("CodeForge AI Backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server and API are working",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Question routes
app.use("/api/questions", questionRoutes);

// Test-case routes
app.use("/api/test-cases", testCaseRoutes);

// Submission routes
app.use("/api/submissions", submissionRoutes);

// Server
const PORT = process.env.PORT || 5001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;