const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const authMiddleware = (role) => async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id);

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role && req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
