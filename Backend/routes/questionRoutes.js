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

// Faculty and admin can create questions
router.post("/", protect, allowRoles("faculty", "admin"), createQuestion);

// Faculty and admin can update questions
// The controller checks ownership or admin access
router.put("/:id", protect, allowRoles("faculty", "admin"), updateQuestion);

// Faculty and admin can delete questions
// The controller checks ownership or admin access
router.delete("/:id", protect, allowRoles("faculty", "admin"), deleteQuestion);

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
