const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { uploadImage } = require("../utils/uploadHelper");

exports.registerUser = async (req, res) => {
  try {
    const { name, empId, password, email, mobileNo, role } = req.body;
    if (!name || !empId || !password || !role) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    if (!["admin", "employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid Role" });
    }

    const existingUser = await User.findOne({ empId });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    let imageUrl = await uploadImage(req);

    //const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      empId,
      password,
      email,
      mobileNo,
      role,
      image: imageUrl,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginEmployee = async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) {
    return res
      .status(400)
      .json({ message: "Employee ID and Password required" });
  }
  try {
    const user = await User.findOne({ empId });
    if (
      !user ||
      user.role !== "employee" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) {
    return res.status(400).json({ message: "empId and Password required" });
  }
  try {
    const user = await User.findOne({ empId });
    if (
      !user ||
      user.role !== "admin" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1d in miliseconds
    });
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// exports.resetPassword = async (req, res) => {
//   const { empId, newPassword } = req.body;
//   try {
//     if (!empId || !newPassword) {
//       return res
//         .status(400)
//         .json({ message: "empId and NewPassword are required" });
//     }
//     const user = await User.findOne({ empId });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.password = newPassword;
//     await user.save();
//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password -_id -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.updateUser = async (req, res) => {
//   try {
//     const { empId } = req.params;
//     let updates = req.body;

//     if (updates.password) {
//       updates.password = await bcrypt.hash(updates.password, 10);
//     }

//     if (updates.mobileNo && !updates.mobileNo.startsWith("+91")) {
//       updates.mobileNo = "+91" + updates.mobileNo;
//     }

//     // Handle image upload based on storage type
//     if (req.file) {
//       //--------------to be removed when using only gcs----------------------------------//
//       if (storageType === "local") {
//         updates.image = `${req.protocol}://${req.get("host")}/uploads/${
//           req.file.filename
//         }`;
//       }
//       // else if (storageType === "s3") {
//       //   updates.image = await uploadToS3(req.file);
//       // }
//       else if (storageType === "gcs") {
//         updates.image = await gcsUpload(req.file);
//       }
//     }

//     const updatedUser = await User.findOneAndUpdate(
//       { empId },
//       { $set: updates },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "User updated successfully", user: updatedUser });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };
