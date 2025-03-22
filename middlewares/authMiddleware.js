const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const authMiddleware = (role) => async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, process.JWT_SECRET);
    req.user = await User.findById(decode.id);

    if (!req.user || (role && req.user.role != role)) {
      return res.status(403).json({ message: "Acess denied" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports=authMiddleware;
