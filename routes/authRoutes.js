// const express = require("express");
// const {
//   registerUser,
//   loginAdmin,
//   loginEmployee,
//   resetPassword,
//   getCurrentUser,
// } = require("../controllers/authController");
// const authMiddleware = require("../middlewares/authMiddleware");
// const upload = require("../middlewares/uploadMiddleware");

// const router = express.Router();
// router.post(
//   "/register",
//   authMiddleware(["admin"]),
//   upload.single("image"),
//   registerUser
// );
// router.get('/admins', verifyToken, isAdmin, async (req, res) => {
//   try {
//     const admins = await User.find({ role: 'admin' }).select('-password');
//     res.status(200).json(admins);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// router.post("/login-employee", loginEmployee);
// router.post("/login-admin", loginAdmin);
// // router.post("/resetPassword", authMiddleware(["admin"]), resetPassword);
// router.get("/me", authMiddleware(["employee", "admin"]), getCurrentUser);

// module.exports = router;
const express = require("express");
const {
  registerUser,
  loginAdmin,
  loginEmployee,
  resetPassword,
  getCurrentUser,
} = require("../controllers/authController");
const {
  authMiddleware,
  verifyToken,
  isAdmin,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const User = require("../models/Users");

const router = express.Router();

router.post(
  "/register",
  authMiddleware(["admin"]),
  upload.single("image"),
  registerUser
);

router.get("/admins", verifyToken, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login-employee", loginEmployee);
router.post("/login-admin", loginAdmin);
router.get("/me", authMiddleware(["employee", "admin"]), getCurrentUser);

module.exports = router;
