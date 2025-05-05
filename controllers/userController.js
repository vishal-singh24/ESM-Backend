const User = require("../models/Users");
const bcrypt = require("bcrypt");
const { handleSingleImageUpload } = require("../utils/imageUploadHelper");
const { deleteImageFromCloudStorage } = require("../utils/cloudStorageHelper");
const sanitize = require("mongo-sanitize");

exports.updateUser = async (req, res) => {
  try {
    const { empId } = req.params;
    let updates = sanitize(req.body);

    if (updates.image === 'null') {
      updates.image = null;
    }


    // Hash password if updating
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Format mobile number if updating
    if (updates.mobileNo && !updates.mobileNo.startsWith("+91")) {
      updates.mobileNo = "+91" + updates.mobileNo;
    }

    const existingUser = await User.findOne({ empId });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Handle image upload only if a new image is provided
    let imageShouldBeRemoved = updates.image === null;
    const newImageUrl = await handleSingleImageUpload(req);
    

    if ((imageShouldBeRemoved || newImageUrl) && existingUser.image) {
      await deleteImageFromCloudStorage(existingUser.image);
    }

    // Set final image value
    if (imageShouldBeRemoved) {
      updates.image = null;
    } else if (newImageUrl) {
      updates.image = newImageUrl;
    }

    const updatedUser = await User.findOneAndUpdate(
      { empId },
      { $set: updates },
      { new: true, runValidators: true }
    );

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
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
