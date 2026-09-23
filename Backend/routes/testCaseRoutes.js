const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
} = require("../controllers/testCaseController");

const router = express.Router();

// Get test cases for a question
// Students receive only sample test cases
// Faculty/admin receive sample and hidden test cases
router.get(
  "/question/:questionId",
  protect,
  getTestCases
);

// Create a test case
router.post(
  "/question/:questionId",
  protect,
  allowRoles("faculty", "admin"),
  createTestCase
);

// Update a test case
router.put(
  "/:testCaseId",
  protect,
  allowRoles("faculty", "admin"),
  updateTestCase
);

// Delete a test case
router.delete(
  "/:testCaseId",
  protect,
  allowRoles("faculty", "admin"),
  deleteTestCase
);

module.exports = router;