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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Add new Admin or Employee  
 *     description: Add a new user (Admin or Employee) with an image.
 *     tags: [Admin,]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - empId
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 x-hintText: "e.g., user123" 
 *                 
 *               email:
 *                 type: string
 *                 example: Name 
 *                 format: email
 *               empId:
 *                 type: string
 *               password:
 *                 type: string
 *               mobileNo:
 *                 type: string
 *                 format: phone
 *                 example: 1234567890
 *               role:
 *                 type: string
 *                 enum: [admin, employee]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Name,EmpId, Password and Role are required fields or Invalid Role
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/auth/login-employee:
 *   post:
 *     summary: Employee Login
 *     tags: [Employee]
 *       
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empId
 *               - password
 *             properties:
 *               empId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: EmployeeId and Password required
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 *       
 */
router.post("/login-employee", loginEmployee);

/**
 * @swagger
 * /api/auth/login-admin:
 *   post:
 *     summary: Admin Login
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - empId
 *               - password
 *             properties:
 *               empId:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:  
 *         description: Email and Password required
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 *      
 */
router.post("/login-admin", loginAdmin);


// router.post("/resetPassword", authMiddleware(["admin"]), resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user details
 *     tags: [Admin,Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/me", authMiddleware(["employee", "admin"]), getCurrentUser);

module.exports = router;
