const express = require("express");
const protect = require("../middleware/authMiddleware");
const { runCode } = require("../controllers/executionController");
const rateLimit = require("express-rate-limit");

const runLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." }
});

const router = express.Router();

router.post("/run", protect, runLimiter, runCode);

module.exports = router;
