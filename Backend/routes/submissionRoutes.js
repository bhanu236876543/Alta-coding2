const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");

const router = express.Router();

// Submit code for a question
router.post(
  "/question/:questionId",
  protect,
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