const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      enum: ["javascript", "python", "java", "cpp"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "accepted",
        "wrong_answer",
        "runtime_error",
        "compilation_error",
        "time_limit_exceeded",
        "failed",
      ],
      default: "pending",
    },

    result: {
      type: String,
      default: "",
    },

    passedTestCases: {
      type: Number,
      default: 0,
    },

    totalTestCases: {
      type: Number,
      default: 0,
    },

    executionTime: {
      type: Number,
      default: 0,
    },

    memoryUsed: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ user: 1, question: 1 });
submissionSchema.index({ question: 1, createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);