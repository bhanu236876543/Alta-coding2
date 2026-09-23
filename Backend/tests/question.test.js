require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../models/User");
const Question = require("../models/Question");
const QuestionVersion = require("../models/QuestionVersion");

describe("Question Publishing Snapshot", () => {
  let facultyToken;
  let testQuestion;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    const facultyUser = await User.findOne({ role: "faculty" });
    if (!facultyUser) {
      throw new Error("Seed data missing: no faculty user found");
    }

    facultyToken = jwt.sign(
      { userId: facultyUser._id.toString(), role: facultyUser.role },
      process.env.JWT_SECRET
    );

    // Create a draft question to publish later
    testQuestion = await Question.create({
      title: "Test Publish Question",
      description: "Description",
      difficulty: "easy",
      createdBy: facultyUser._id,
      status: "draft"
    });
  });

  afterAll(async () => {
    // Clean up
    if (testQuestion) {
      await Question.findByIdAndDelete(testQuestion._id);
      await QuestionVersion.deleteMany({ question: testQuestion._id });
    }
    await mongoose.connection.close();
  });

  test("Publishing a question should create a QuestionVersion snapshot", async () => {
    const response = await request(app)
      .post(`/api/questions/${testQuestion._id}/publish`)
      .set("Authorization", `Bearer ${facultyToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.question.status).toBe("published");

    // Verify snapshot was created
    const versionCount = await QuestionVersion.countDocuments({ question: testQuestion._id });
    expect(versionCount).toBe(1);

    const snapshot = await QuestionVersion.findOne({ question: testQuestion._id });
    expect(snapshot.title).toBe(testQuestion.title);
    expect(snapshot.version).toBe(1);
  });
});
