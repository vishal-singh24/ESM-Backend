const express = require("express");
const { updateUser } = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/users/update/{empId}:
 *  patch:
 *    summary: Update user details
 *    description: Update user details by empId. Only admin can update user details.
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: empId
 *        in: path
 *        required: true
 *        description: Employee ID of the user to be updated
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string   
 *              password:
 *                type: string
 *              email:
 *                type: string
 *              mobileNo:
 *                type: string
 *                format: phone
 *                example: 9134567890
 *              image:
 *                type: string
 *                format: binary
 *    responses:
 *      200:
 *        description: User details updated successfully
 *      401:
 *        description: Unauthorized access
 *      403:
 *        description: Forbidden - Only admin can update user details
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal server error
 *     
 */

router.patch(
  "/update/:empId",
  authMiddleware(["admin"]),
  upload.single("image"),
  updateUser
);

module.exports = router;
