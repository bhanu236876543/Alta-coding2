require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../models/User");
const Question = require("../models/Question");
const TestCase = require("../models/TestCase");

describe("Test Case Visibility Enforcement", () => {
  let studentToken;
  let facultyToken;
  let testQuestion;
  let sampleTestCase;
  let hiddenTestCase;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const facultyUser = await User.findOne({ role: "faculty" });
    const studentUser = await User.findOne({ role: "student" });

    if (!facultyUser || !studentUser) {
      throw new Error("Seed data missing: need faculty and student users");
    }

    facultyToken = jwt.sign(
      { userId: facultyUser._id.toString(), role: facultyUser.role },
      process.env.JWT_SECRET
    );

    studentToken = jwt.sign(
      { userId: studentUser._id.toString(), role: studentUser.role },
      process.env.JWT_SECRET
    );

    testQuestion = await Question.create({
      title: "Visibility Test Question",
      description: "Testing visibility",
      createdBy: facultyUser._id,
      status: "published"
    });

    sampleTestCase = await TestCase.create({
      question: testQuestion._id,
      input: "1",
      expectedOutput: "1",
      visibility: "sample"
    });

    hiddenTestCase = await TestCase.create({
      question: testQuestion._id,
      input: "2",
      expectedOutput: "2",
      visibility: "hidden"
    });
  });

  afterAll(async () => {
    if (testQuestion) {
      await Question.findByIdAndDelete(testQuestion._id);
      await TestCase.deleteMany({ question: testQuestion._id });
    }
    await mongoose.connection.close();
  });

  test("Faculty should see both sample and hidden test cases", async () => {
    const response = await request(app)
      .get(`/api/test-cases/question/${testQuestion._id}`)
      .set("Authorization", `Bearer ${facultyToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    
    const visibilities = response.body.map(tc => tc.visibility);
    expect(visibilities).toContain("sample");
    expect(visibilities).toContain("hidden");
  });

  test("Student should ONLY see sample test cases", async () => {
    const response = await request(app)
      .get(`/api/test-cases/question/${testQuestion._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    
    const visibilities = response.body.map(tc => tc.visibility);
    expect(visibilities).toContain("sample");
    expect(visibilities).not.toContain("hidden");
  });
});
