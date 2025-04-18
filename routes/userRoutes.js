const express = require("express");
const { updateUser } = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.patch(
  "/update/:empId",
  authMiddleware(["admin"]),
  upload.single("image"),
  updateUser
);

module.exports = router;
