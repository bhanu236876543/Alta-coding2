const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Question = require("../models/Question");
const TestCase = require("../models/TestCase");
const { submissionQueue } = require("../services/queueService");

const allowedLanguages = ["javascript", "python", "java", "cpp"];

// Create a new code submission and enqueue it
const createSubmission = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { code, language } = req.body;
    
    // Idempotency key to prevent duplicate-click double processing
    const idempotencyKey = req.headers["x-idempotency-key"];

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    if (typeof code !== "string" || code.trim() === "") {
      return res.status(400).json({ message: "Code is required" });
    }

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({ message: "Language must be javascript, python, java, or cpp" });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.status !== "published") {
      return res.status(400).json({ message: "Submissions are allowed only for published questions" });
    }
    
    const testCasesCount = await TestCase.countDocuments({ question: questionId });
    if (testCasesCount === 0) {
      return res.status(400).json({ message: "No test cases found for this question" });
    }

    const submission = await Submission.create({
      question: questionId,
      user: req.user.userId,
      code,
      language,
      status: "pending",
      totalTestCases: testCasesCount,
    });

    const jobOptions = {};
    if (idempotencyKey) {
      jobOptions.jobId = idempotencyKey;
    }

    await submissionQueue.add(
      "execute-submission", 
      { submissionId: submission._id, questionId, code, language },
      jobOptions
    );

    return res.status(201).json({
      message: "Submission queued successfully",
      submission: {
        ...submission.toObject(),
        code: undefined,
      },
    });
  } catch (error) {
    console.error("Create submission error:", error);
    return res.status(500).json({
      message: "Failed to queue submission",
      error: error.message,
    });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }

    const submissions = await Submission.find({
      question: questionId,
      user: req.user.userId,
    })
      .select("-code")
      .sort({ createdAt: -1 });

    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    return res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }

    const submission = await Submission.findOne({
      _id: submissionId,
      user: req.user.userId,
    }).select("-code");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.status(200).json(submission);
  } catch (error) {
    console.error("Get submission error:", error);
    return res.status(500).json({ message: "Failed to fetch submission" });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
};