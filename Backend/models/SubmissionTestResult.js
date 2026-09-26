const mongoose = require("mongoose");

const submissionTestResultSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    testCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestCase",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memoryUsed: {
      type: Number,
      default: 0,
    },
    output: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

submissionTestResultSchema.index({ submission: 1, testCase: 1 });

module.exports = mongoose.model("SubmissionTestResult", submissionTestResultSchema);
