const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URI || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null
});

const submissionQueue = new Queue("submission-execution", { connection });

module.exports = { submissionQueue, connection };
