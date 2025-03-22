const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!(await bcrypt.compare(oldPassword, user.password))) {
    return res.status(400).json({ message: "Incorrect old password" });
  }
  user.password = newPassword;
  await user.save();
  return res.json({ message: "Password changes successfully" });
};

exports.resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password reset successfully" });
};


