const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  publishQuestion,
  unpublishQuestion,
} = require("../controllers/questionController");

const router = express.Router();

// Get all questions
router.get("/", protect, getQuestions);

// Get one question
router.get("/:id", protect, getQuestionById);

// Create a question
router.post(
  "/",
  protect,
  allowRoles("faculty", "admin"),
  createQuestion
);

// Update a question
router.put(
  "/:id",
  protect,
  allowRoles("faculty", "admin"),
  updateQuestion
);

// Delete a question
router.delete(
  "/:id",
  protect,
  allowRoles("faculty", "admin"),
  deleteQuestion
);

// Publish a question
router.post(
  "/:id/publish",
  protect,
  allowRoles("faculty", "admin"),
  publishQuestion
);

// Unpublish a question
router.post(
  "/:id/unpublish",
  protect,
  allowRoles("faculty", "admin"),
  unpublishQuestion
);

module.exports = router;
