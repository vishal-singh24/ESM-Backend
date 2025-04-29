const User = require("../models/Users");
const bcrypt = require("bcrypt");
const { handleSingleImageUpload } = require("../utils/imageUploadHelper");
const { deleteImageFromCloudStorage } = require("../utils/cloudStorageHelper");
const sanitize = require("mongo-sanitize");

exports.updateUser = async (req, res) => {
  try {
    const { empId } = req.params;
    let updates = sanitize(req.body);

    // Hash password if updating
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Format mobile number if updating
    if (updates.mobileNo && !updates.mobileNo.startsWith("+91")) {
      updates.mobileNo = "+91" + updates.mobileNo;
    }

    // Handle image upload only if a new image is provided
    const imageUrl = await handleSingleImageUpload(req);
    if (imageUrl) {
      if (existingUser.image) {
        await deleteImageFromCloudStorage(existingUser.image);
      }
      updates.image = newImageUrl;
    }

    const updatedUser = await User.findOneAndUpdate(
      { empId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        mobileNo: updatedUser.mobileNo,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};
