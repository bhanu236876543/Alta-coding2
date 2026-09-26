const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization; // token nikalne ke kaam aata hai jo headers se milta hai

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token required.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user information in request.
    req.user = decoded;

    // Continue to the route
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = protect;