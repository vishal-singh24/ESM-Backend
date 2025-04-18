const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadImage } = require("../utils/uploadHelper");
const rateLimit = require("express-rate-limit");
const sanitize = require("mongo-sanitize");

// Admin-specific security enhancements
exports.registerUser = async (req, res) => {
  try {
    // Sanitize inputs to prevent NoSQL injection
    const cleanBody = sanitize(req.body);
    const { name, empId, password, email, mobileNo, role } = cleanBody;

    // Input validation
    if (!name || !password || !role || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["admin", "employee"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Additional validation for admin registration
    if (role === "admin") {
      if (!req.user || req.user.role !== "admin") {
        console.warn(`Unauthorized admin creation attempt from IP: ${req.ip}`);
        return res.status(403).json({
          success: false,
          message: "Admin privileges required",
        });
      }
    }

    const existingUser = await User.findOne({
      $or: [{ empId }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password with stronger salt rounds for admin
    const saltRounds = role === "admin" ? 12 : 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let imageUrl = await uploadImage(req);

    // Format mobile number for Indian format
    let formattedMobileNo = mobileNo;
    if (mobileNo && !mobileNo.startsWith("+91")) {
      formattedMobileNo = "+91" + mobileNo;
    }

    const newUser = new User({
      name: name.trim(),
      empId,
      password: hashedPassword,
      email: email.toLowerCase(),
      mobileNo: formattedMobileNo,
      role,
      image: imageUrl,
    });

    await newUser.save();

    // Log registration with different levels for admin/employee
    console.log(
      `New ${role} registered: ${email} by ${req.user?.email || "system"}`
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });

    // Add proper error response
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Enhanced admin login with security features
exports.loginAdmin = async (req, res) => {
  const { empId, password } = sanitize(req.body);

  if (!empId || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    const user = await User.findOne({
      empId: { $regex: new RegExp(`^${empId}$`, "i") },
      role: "admin",
    });

    if (!user) {
      console.warn(
        `Failed admin login attempt for: ${empId} from IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Failed password attempt for admin: ${empId}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Secure cookie settings
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || "localhost",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Keep existing employee login unchanged
exports.loginEmployee = async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) {
    return res
      .status(400)
      .json({ message: "Employee ID and Password required" });
  }
  try {
    const user = await User.findOne({ empId });
    if (
      !user ||
      user.role !== "employee" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Enhanced getCurrentUser with admin checks
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password -_id -__v");

    if (!user) {
      console.warn(`User not found for ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Additional security logging for admin access
    if (user.role === "admin") {
      console.log(`Admin access: ${user.email} accessed profile`);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin-specific rate limiter
exports.adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for admin endpoint: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});
