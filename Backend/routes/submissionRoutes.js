const express = require("express");

const protect = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, message: "Too many submissions, please try again later." }
});

const router = express.Router();

// Submit code for a question
router.post(
  "/question/:questionId",
  protect,
  submitLimiter,
  createSubmission
);

// Get logged-in user's submissions for a question
router.get(
  "/question/:questionId",
  protect,
  getMySubmissions
);

// Get one submission
router.get(
  "/:submissionId",
  protect,
  getSubmissionById
);

module.exports = router;