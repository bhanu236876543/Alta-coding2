const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const { registerFaculty } = require("../controllers/facultyController");

const router = express.Router();

// Temporary faculty registration endpoint
router.post("/register", registerFaculty);

// Faculty dashboard
router.get("/dashboard", protect, allowRoles("faculty"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Faculty Dashboard",
  });
});

module.exports = router;
