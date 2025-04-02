const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storageType = process.env.STORAGE_TYPE || "local";
let upload;

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error("Only .jpg, .jpeg, and .png files are allowed"), false);
    }
  };

if (storageType === "local") {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
      cb(null, `${Date.now()}-${sanitizedFilename}`);
    },
  });

  upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

} else if (storageType === "gcs") {
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
  });
}

module.exports = upload;
