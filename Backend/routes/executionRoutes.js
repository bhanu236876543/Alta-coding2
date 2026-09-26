const express = require("express");
const protect = require("../middleware/authMiddleware");
const { runCode } = require("../controllers/executionController");

const router = express.Router();

router.post("/run", protect, runCode);

module.exports = router;
