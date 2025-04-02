const express = require("express");
const {
  registerUser,
  loginAdmin,
  loginEmployee,
  resetPassword,
  getCurrentUser,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();
router.post(
  "/register",
  authMiddleware(["admin"]),
  upload.single("image"),
  registerUser
);
router.post("/login-employee", loginEmployee);
router.post("/login-admin", loginAdmin);
// router.post("/resetPassword", authMiddleware(["admin"]), resetPassword);
router.get("/me", authMiddleware(["employee", "admin"]), getCurrentUser);

module.exports = router;
