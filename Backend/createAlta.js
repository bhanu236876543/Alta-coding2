
// Program to create the organisation since without under any organisation no student should allow to be created

require("dotenv").config();

const mongoose = require("mongoose");
const Organization = require("./models/Organization");

const createAlta = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingOrganization = await Organization.findOne({
      slug: "alta",
    });

    if (existingOrganization) {
      console.log("ALTA organization already exists");
      process.exit(0);
    }

    const organization = await Organization.create({
      name: "ALTA",
      slug: "alta",
    });

    console.log("ALTA organization created successfully");
    console.log("Organization ID:", organization._id);

    process.exit(0);
  } catch (error) {
    console.error("Error creating ALTA:", error.message);
    process.exit(1);
  }
};

createAlta();
