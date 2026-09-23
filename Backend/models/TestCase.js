const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    input: {
      type: String,
      required: true,
      trim: true,
    },

    expectedOutput: {
      type: String,
      required: true,
      trim: true,
    },

    visibility: {
      type: String,
      enum: ["sample", "hidden"],
      default: "sample",
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    explanation: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TestCase", testCaseSchema);
