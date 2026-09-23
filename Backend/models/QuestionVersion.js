const mongoose = require("mongoose");

const questionVersionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    version: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    topics: {
      type: [String],
      default: [],
    },

    constraints: {
      type: String,
      default: "",
    },

    inputFormat: {
      type: String,
      default: "",
    },

    outputFormat: {
      type: String,
      default: "",
    },

    sampleInput: {
      type: String,
      default: "",
    },

    sampleOutput: {
      type: String,
      default: "",
    },

    explanation: {
      type: String,
      default: "",
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

questionVersionSchema.index(
  { question: 1, version: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "QuestionVersion",
  questionVersionSchema
);