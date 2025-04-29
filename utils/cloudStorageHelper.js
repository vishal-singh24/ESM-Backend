const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GCLOUD_KEY_FILE,
});
const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

const uploadImageToCloudStorage = async (file, folder = "uploads") => {
  if (!file) throw new Error("No file provided");
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type. Only .jpg, .jpeg, and .png are allowed.");
  }

  const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
  const blob = bucket.file(`${folder}/${Date.now()}-${sanitizedFilename}`);
  const stream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
    public: true,
  });

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${process.env.GCLOUD_BUCKET_NAME}/${blob.name}`;
      resolve(publicUrl);
    });
    stream.on("error", reject);
    stream.end(file.buffer);
  });
};

const deleteImageFromCloudStorage = async (imageUrl) => {
  if (!imageUrl) return;
  const match = imageUrl.match(/https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)/);
  if (!match) return;
  const path = match[1];

  try {
    await bucket.file(path).delete();
    console.log(`Deleted image: ${path}`);
  } catch (error) {
    console.error("Error deleting image:", error.message);
  }
};

module.exports = { uploadImageToCloudStorage, deleteImageFromCloudStorage };
