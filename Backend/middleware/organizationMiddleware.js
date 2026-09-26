const OrganizationMember = require("../models/OrganizationMember");
const organizationAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const organizationId = req.headers["x-organization-id"];

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    const membership = await OrganizationMember.findOne({
      user: req.user.userId,
      organization: organizationId,
    }).populate("organization");

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    req.organization = membership.organization;
    req.userRole = membership.role;

    next();
  } catch (error) {
    console.error("Organization access error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = organizationAccess;
