require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const organizationAccess = require("../middleware/organizationMiddleware");

const User = require("../models/User");
const Organization = require("../models/Organization");
const OrganizationMember = require("../models/OrganizationMember");

describe("Organization Access Control", () => {
  let user;
  let alta;
  let testOrg;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    user = await User.create({
      name: "Test Student",
      email: "test.org.student@example.com",
      password: "password123",
      role: "student"
    });

    alta = await Organization.create({
      name: "Alta",
      slug: "alta-test",
      type: "university",
      createdBy: user._id
    });

    testOrg = await Organization.create({
      name: "Test Org",
      slug: "test-org-test",
      type: "bootcamp",
      createdBy: user._id
    });

    await OrganizationMember.create({
      organization: alta._id,
      user: user._id,
      role: "student"
    });
  });

  afterAll(async () => {
    if (user) await User.findByIdAndDelete(user._id);
    if (alta) await Organization.findByIdAndDelete(alta._id);
    if (testOrg) await Organization.findByIdAndDelete(testOrg._id);
    if (user) await OrganizationMember.deleteMany({ user: user._id });
    await mongoose.connection.close();
  });

  const createMockResponse = () => {
    const res = {
      statusCode: 200,
      body: null,

      status(code) {
        this.statusCode = code;
        return this;
      },

      json(data) {
        this.body = data;
        return this;
      },
    };

    return res;
  };

  test("User should access their own organization", async () => {
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: "student",
      },
      process.env.JWT_SECRET,
    );

    const req = {
      user: {
        userId: user._id.toString(),
        role: "student",
      },
      headers: {
        "x-organization-id": alta._id.toString(),
        authorization: `Bearer ${token}`,
      },
    };

    const res = createMockResponse();

    let nextCalled = false;

    await organizationAccess(req, res, () => {
      nextCalled = true;
    });

    expect(res.statusCode).toBe(200);
    expect(nextCalled).toBe(true);
    expect(req.organization.name).toBe(alta.name);
    expect(req.userRole).toBe("student");
  });

  test("User should NOT access another organization", async () => {
    const req = {
      user: {
        userId: user._id.toString(),
        role: "student",
      },
      headers: {
        "x-organization-id": testOrg._id.toString(),
      },
    };

    const res = createMockResponse();

    let nextCalled = false;

    await organizationAccess(req, res, () => {
      nextCalled = true;
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("User does not belong to this organization");
    expect(nextCalled).toBe(false);
  });
});
