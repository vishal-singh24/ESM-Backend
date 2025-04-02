const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storageType = process.env.STORAGE_TYPE || "local";
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

const gcsUpload = async (file) => {
  return new Promise((resolve, reject) => {
    const storage = new Storage({
      projectId: process.env.GCLOUD_PROJECT_ID,
      keyFilename: process.env.GCLOUD_KEY_FILE,
    });
    const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    const blob = bucket.file(`user_images/${Date.now()}-${sanitizedFilename}`);
    const stream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      public: true,
    });

    stream.on("finish", () => {
      resolve(
        `https://storage.googleapis.com/${process.env.GCLOUD_BUCKET_NAME}/${blob.name}`
      );
    });

    stream.on("error", reject);
    stream.end(file.buffer);
  });
};

const uploadImage = async (req) => {
  if (!req.file) return null;
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw new Error(
      "Invalid file type. Only .jpg, .jpeg, and .png are allowed."
    );
  }

  if (storageType === "local") {
    return `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  } else if (storageType === "gcs") {
    return await gcsUpload(req.file);
  }
};

module.exports = { uploadImage };
