const mongoose = require("mongoose");
const { execFile } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const Submission = require("../models/Submission");
const Question = require("../models/Question");
const TestCase = require("../models/TestCase");

const allowedLanguages = [
  "javascript",
  "python",
  "java",
  "cpp",
];

const EXECUTION_TIMEOUT = 5000;

// Execute a program with a timeout
function executeProgram(command, args, input, timeout = EXECUTION_TIMEOUT) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();

    const child = execFile(
      command,
      args,
      {
        input,
        timeout,
        maxBuffer: 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const endTime = process.hrtime.bigint();

        const executionTime =
          Number(endTime - startTime) / 1_000_000;

        if (error) {
          if (error.killed || error.code === "ETIMEDOUT") {
            return resolve({
              success: false,
              status: "time_limit_exceeded",
              stdout: stdout || "",
              stderr: stderr || "",
              executionTime,
              errorMessage: "Execution time limit exceeded",
            });
          }

          return resolve({
            success: false,
            status: "runtime_error",
            stdout: stdout || "",
            stderr: stderr || "",
            executionTime,
            errorMessage:
              stderr || error.message || "Program execution failed",
          });
        }

        resolve({
          success: true,
          status: "accepted",
          stdout: stdout || "",
          stderr: stderr || "",
          executionTime,
          errorMessage: "",
        });
      }
    );

    child.stdin.write(input || "");
    child.stdin.end();
  });
}

// Normalize output before comparison
function normalizeOutput(output) {
  return String(output || "")
    .trim()
    .split(/\s+/)
    .join(" ");
}

// Execute submitted code for one test case
async function executeTestCase(code, language, testCase) {
  const tempDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "codeforge-")
  );

  const fileId = crypto.randomUUID();

  try {
    if (language === "python") {
      const filePath = path.join(tempDirectory, `${fileId}.py`);

      await fs.writeFile(filePath, code, "utf8");

      return await executeProgram(
        "python3",
        [filePath],
        testCase.input
      );
    }

    if (language === "javascript") {
      const filePath = path.join(tempDirectory, `${fileId}.js`);

      await fs.writeFile(filePath, code, "utf8");

      return await executeProgram(
        "node",
        [filePath],
        testCase.input
      );
    }

    return {
      success: false,
      status: "failed",
      stdout: "",
      stderr: "",
      executionTime: 0,
      errorMessage:
        `Execution for ${language} is not implemented yet`,
    };
  } finally {
    await fs.rm(tempDirectory, {
      recursive: true,
      force: true,
    });
  }
}

// Create a new code submission and evaluate it
const createSubmission = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { code, language } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    if (
      typeof code !== "string" ||
      code.trim() === ""
    ) {
      return res.status(400).json({
        message: "Code is required",
      });
    }

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({
        message:
          "Language must be javascript, python, java, or cpp",
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (question.status !== "published") {
      return res.status(400).json({
        message:
          "Submissions are allowed only for published questions",
      });
    }

    const testCases = await TestCase.find({
      question: questionId,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    if (testCases.length === 0) {
      return res.status(400).json({
        message:
          "No test cases found for this question",
      });
    }

    const submission = await Submission.create({
      question: questionId,
      user: req.user.userId,
      code,
      language,
      status: "running",
      totalTestCases: testCases.length,
    });

    let passedTestCases = 0;
    let finalStatus = "accepted";
    let finalResult = "Accepted";
    let errorMessage = "";
    let totalExecutionTime = 0;

    for (const testCase of testCases) {
      const execution = await executeTestCase(
        code,
        language,
        testCase
      );

      totalExecutionTime += execution.executionTime;

      if (!execution.success) {
        finalStatus = execution.status;
        finalResult =
          execution.status === "time_limit_exceeded"
            ? "Time Limit Exceeded"
            : "Runtime Error";

        errorMessage = execution.errorMessage;
        break;
      }

      const actualOutput = normalizeOutput(
        execution.stdout
      );

      const expectedOutput = normalizeOutput(
        testCase.expectedOutput
      );

      if (actualOutput === expectedOutput) {
        passedTestCases++;
      } else {
        finalStatus = "wrong_answer";
        finalResult = "Wrong Answer";
        break;
      }
    }

    if (
      finalStatus === "accepted" &&
      passedTestCases !== testCases.length
    ) {
      finalStatus = "wrong_answer";
      finalResult = "Wrong Answer";
    }

    submission.status = finalStatus;
    submission.result = finalResult;
    submission.passedTestCases = passedTestCases;
    submission.totalTestCases = testCases.length;
    submission.executionTime = Math.round(
      totalExecutionTime
    );
    submission.errorMessage = errorMessage;

    await submission.save();

    return res.status(201).json({
      message: "Submission evaluated successfully",
      submission: {
        ...submission.toObject(),
        code: undefined,
      },
    });
  } catch (error) {
    console.error("Create submission error:", error);

    return res.status(500).json({
      message: "Failed to create and evaluate submission",
      error: error.message,
    });
  }
};

// Get the logged-in user's submissions for a question
const getMySubmissions = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
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

    return res.status(500).json({
      message: "Failed to fetch submissions",
    });
  }
};

// Get one submission belonging to the logged-in user
const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({
        message: "Invalid submission ID",
      });
    }

    const submission = await Submission.findOne({
      _id: submissionId,
      user: req.user.userId,
    }).select("-code");

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    return res.status(200).json(submission);
  } catch (error) {
    console.error("Get submission error:", error);

    return res.status(500).json({
      message: "Failed to fetch submission",
    });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
};