const mongoose = require("mongoose");
const TestCase = require("../models/TestCase");
const Question = require("../models/Question");

const allowedVisibility = ["sample", "hidden"];

// Check whether the logged-in user can manage the question
function canManageQuestion(question, user) {
  if (!question || !user) {
    return false;
  }

  // Admin can manage every question
  if (user.role === "admin") {
    return true;
  }

  // Faculty can manage only their own questions
  return (
    question.createdBy &&
    question.createdBy.toString() === user.userId
  );
}

// Common error handler
function handleError(res, error, defaultMessage) {
  console.error(error);

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      message: "Invalid test case data",
    });
  }

  return res.status(500).json({
    message: defaultMessage,
  });
}

// Get test cases for a question
const getTestCases = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const isStaff =
      req.user.role === "faculty" ||
      req.user.role === "admin";

    const filter = {
      question: questionId,
    };

    // Students should only receive sample test cases
    if (!isStaff) {
      filter.visibility = "sample";
    }

    const testCases = await TestCase.find(filter).sort({
      order: 1,
      createdAt: 1,
    });

    // Return only safe fields to students
    if (!isStaff) {
      const safeTestCases = testCases.map((testCase) => ({
        _id: testCase._id,
        question: testCase.question,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        visibility: testCase.visibility,
        order: testCase.order,
      }));

      return res.json(safeTestCases);
    }

    return res.json(testCases);
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to fetch test cases"
    );
  }
};

// Create a test case
const createTestCase = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      input,
      expectedOutput,
      visibility,
      order,
      explanation,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    if (
      typeof input !== "string" ||
      input.trim() === ""
    ) {
      return res.status(400).json({
        message: "Input is required and must be a non-empty string",
      });
    }

    if (
      typeof expectedOutput !== "string" ||
      expectedOutput.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Expected output is required and must be a non-empty string",
      });
    }

    if (
      visibility !== undefined &&
      !allowedVisibility.includes(visibility)
    ) {
      return res.status(400).json({
        message: "Visibility must be either sample or hidden",
      });
    }

    const finalOrder = order === undefined ? 0 : order;

    if (
      !Number.isInteger(finalOrder) ||
      finalOrder < 0
    ) {
      return res.status(400).json({
        message: "Order must be a non-negative integer",
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (!canManageQuestion(question, req.user)) {
      return res.status(403).json({
        message:
          "You are not allowed to add test cases to this question",
      });
    }

    const testCase = await TestCase.create({
      question: questionId,
      input,
      expectedOutput,
      visibility:
        visibility === undefined ? "sample" : visibility,
      order: finalOrder,
      explanation:
        explanation === undefined ? "" : explanation,
    });

    return res.status(201).json({
      message: "Test case created successfully",
      testCase,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to create test case"
    );
  }
};

// Update a test case
const updateTestCase = async (req, res) => {
  try {
    const { testCaseId } = req.params;
    const {
      input,
      expectedOutput,
      visibility,
      order,
      explanation,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testCaseId)) {
      return res.status(400).json({
        message: "Invalid test case ID",
      });
    }

    const testCase = await TestCase.findById(testCaseId);

    if (!testCase) {
      return res.status(404).json({
        message: "Test case not found",
      });
    }

    const question = await Question.findById(testCase.question);

    if (!question) {
      return res.status(404).json({
        message: "Related question not found",
      });
    }

    if (!canManageQuestion(question, req.user)) {
      return res.status(403).json({
        message:
          "You are not allowed to update this test case",
      });
    }

    if (input !== undefined) {
      if (
        typeof input !== "string" ||
        input.trim() === ""
      ) {
        return res.status(400).json({
          message: "Input must be a non-empty string",
        });
      }

      testCase.input = input;
    }

    if (expectedOutput !== undefined) {
      if (
        typeof expectedOutput !== "string" ||
        expectedOutput.trim() === ""
      ) {
        return res.status(400).json({
          message:
            "Expected output must be a non-empty string",
        });
      }

      testCase.expectedOutput = expectedOutput;
    }

    if (visibility !== undefined) {
      if (!allowedVisibility.includes(visibility)) {
        return res.status(400).json({
          message: "Visibility must be either sample or hidden",
        });
      }

      testCase.visibility = visibility;
    }

    if (order !== undefined) {
      if (
        !Number.isInteger(order) ||
        order < 0
      ) {
        return res.status(400).json({
          message: "Order must be a non-negative integer",
        });
      }

      testCase.order = order;
    }

    if (explanation !== undefined) {
      if (typeof explanation !== "string") {
        return res.status(400).json({
          message: "Explanation must be a string",
        });
      }

      testCase.explanation = explanation;
    }

    await testCase.save();

    return res.json({
      message: "Test case updated successfully",
      testCase,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to update test case"
    );
  }
};

// Delete a test case
const deleteTestCase = async (req, res) => {
  try {
    const { testCaseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testCaseId)) {
      return res.status(400).json({
        message: "Invalid test case ID",
      });
    }

    const testCase = await TestCase.findById(testCaseId);

    if (!testCase) {
      return res.status(404).json({
        message: "Test case not found",
      });
    }

    const question = await Question.findById(testCase.question);

    if (!question) {
      return res.status(404).json({
        message: "Related question not found",
      });
    }

    if (!canManageQuestion(question, req.user)) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this test case",
      });
    }

    await TestCase.findByIdAndDelete(testCaseId);

    return res.json({
      message: "Test case deleted successfully",
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to delete test case"
    );
  }
};

module.exports = {
  getTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
};