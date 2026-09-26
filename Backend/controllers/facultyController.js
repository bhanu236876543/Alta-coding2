const User = require("../models/User");
const Organization = require("../models/Organization");
const OrganizationMember = require("../models/OrganizationMember");
const bcrypt = require("bcryptjs");

const registerFaculty = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const organization = await Organization.findOne({
      slug: "alta",
    });

    if (!organization) {
      return res.status(500).json({
        success: false,
        message: "ALTA organization not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "faculty",
    });

    await OrganizationMember.create({
      user: user._id,
      organization: organization._id,
      role: "faculty",
    });

    res.status(201).json({
      success: true,
      message: "Faculty registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Faculty registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerFaculty,
};
