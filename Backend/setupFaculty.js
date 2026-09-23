require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const setupFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const email = "faculty@test.com";
    const password = "Faculty@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });

    if (user) {
      user.name = "Faculty Admin";
      user.password = hashedPassword;
      user.role = "faculty";

      await user.save();

      console.log("Faculty account updated successfully");
    } else {
      user = await User.create({
        name: "Faculty Admin",
        email,
        password: hashedPassword,
        role: "faculty",
      });

      console.log("Faculty account created successfully");
    }

    console.log("Email:", email);
    console.log("Password:", password);

    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

setupFaculty();