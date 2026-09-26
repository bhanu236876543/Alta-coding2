const { Worker } = require("bullmq");
const { connection } = require("./queueService");
const { executeCode } = require("./executionService");
const Submission = require("../models/Submission");
const TestCase = require("../models/TestCase");
const SubmissionTestResult = require("../models/SubmissionTestResult");

const submissionWorker = new Worker("submission-execution", async job => {
  const { submissionId, questionId, code, language } = job.data;
  
  const submission = await Submission.findById(submissionId);
  if (!submission) return;
  
  submission.status = "running";
  await submission.save();

  try {
    const testCases = await TestCase.find({ question: questionId }).sort({ order: 1, createdAt: 1 });
    
    if (testCases.length === 0) {
      submission.status = "failed";
      submission.result = "No Test Cases";
      await submission.save();
      return;
    }

    let passedTestCases = 0;
    let finalStatus = "accepted";
    let finalResult = "Accepted";
    let errorMessage = "";
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;

    for (const testCase of testCases) {
      const result = await executeCode({ language, code, input: testCase.input });
      
      const timeMs = parseFloat(result.time || 0) * 1000;
      const memoryKb = parseInt(result.memory || 0);
      totalExecutionTime += timeMs;
      maxMemoryUsed = Math.max(maxMemoryUsed, memoryKb);

      const statusId = result.statusId;
      let testCaseStatus = "failed";
      let testCaseOutput = result.stdout || result.stderr || result.compileOutput || "";
      
      if (statusId === 3) {
        // Accepted by judge0
        const actualOutput = String(result.stdout || "").trim().split(/\s+/).join(" ");
        const expectedOutput = String(testCase.expectedOutput || "").trim().split(/\s+/).join(" ");
        
        if (actualOutput === expectedOutput) {
          passedTestCases++;
          testCaseStatus = "accepted";
        } else {
          finalStatus = "wrong_answer";
          finalResult = "Wrong Answer";
          testCaseStatus = "wrong_answer";
          break; // Stop evaluating on first failure
        }
      } else {
        // Error from Judge0
        if (statusId === 4) { finalStatus = "wrong_answer"; finalResult = "Wrong Answer"; testCaseStatus = "wrong_answer"; }
        else if (statusId === 5) { finalStatus = "time_limit_exceeded"; finalResult = "Time Limit Exceeded"; testCaseStatus = "time_limit_exceeded"; }
        else if (statusId === 6) { finalStatus = "compilation_error"; finalResult = "Compilation Error"; errorMessage = result.compileOutput; testCaseStatus = "compilation_error"; }
        else if (statusId >= 7 && statusId <= 12) { finalStatus = "runtime_error"; finalResult = "Runtime Error"; errorMessage = result.stderr; testCaseStatus = "runtime_error"; }
        else { finalStatus = "failed"; finalResult = result.statusDescription; }
        
        await SubmissionTestResult.create({
          submission: submissionId,
          testCase: testCase._id,
          status: testCaseStatus,
          executionTime: timeMs,
          memoryUsed: memoryKb,
          output: testCaseOutput
        });
        
        break;
      }
      
      await SubmissionTestResult.create({
        submission: submissionId,
        testCase: testCase._id,
        status: testCaseStatus,
        executionTime: timeMs,
        memoryUsed: memoryKb,
        output: testCaseOutput
      });
    }
    
    if (finalStatus === "accepted" && passedTestCases !== testCases.length) {
      finalStatus = "wrong_answer";
      finalResult = "Wrong Answer";
    }

    submission.status = finalStatus;
    submission.result = finalResult;
    submission.passedTestCases = passedTestCases;
    submission.totalTestCases = testCases.length;
    submission.executionTime = Math.round(totalExecutionTime);
    submission.memoryUsed = maxMemoryUsed;
    submission.errorMessage = errorMessage;
    await submission.save();

  } catch (error) {
    console.error("Worker processing error:", error);
    submission.status = "failed";
    submission.result = "Internal Server Error";
    submission.errorMessage = error.message;
    await submission.save();
  }
}, { connection });

submissionWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

module.exports = { submissionWorker };
