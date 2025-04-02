const User = require("../models/Users");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../utils/uploadHelper");

exports.updateUser = async (req, res) => {
  try {
    const { empId } = req.params;
    let updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (updates.mobileNo && !updates.mobileNo.startsWith("+91")) {
      updates.mobileNo = "+91" + updates.mobileNo;
    }

    updates.image = await uploadImage(req);

    const updatedUser = await User.findOneAndUpdate(
      { empId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
