const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, empId, password, email, mobileNo, role } = req.body;
  if (!name || !empId || !password || !role) {
    return res.status(400).json({ message: "All Fields are required" });
  }

  if (!["admin", "employee"].includes(role)) {
    return res.status(400).json({ message: "Invalid Role" });
  }
  try {
    const existingUser = await User.findOne({ empId});
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    //const hashedPassword = bcrypt.hash(password, 10);
    const newUser = User({ name, empId, password, email, mobileNo, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.loginEmployee = async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) {
    return res.status(400).json({ message: "Employee ID and Password required" });
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
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) {
    return res.status(400).json({ message: "empId and Password required" });
  }
  try {
    const user = await User.findOne({ empId });
    if (
      !user ||
      user.role !== "admin" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { empId, newPassword } = req.body;
  try {
    if (!empId || !newPassword) {
      return res
        .status(400)
        .json({ message: "empId and NewPassword are required" });
    }
    const user = await User.findOne({ empId });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password -_id -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
