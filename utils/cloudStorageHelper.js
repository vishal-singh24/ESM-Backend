
const { Storage } = require('@google-cloud/storage');

const bucketName = process.env.GCLOUD_BUCKET_NAME;
const projectId = process.env.GCLOUD_PROJECT_ID;
const keyFilename = process.env.GCLOUD_KEY_FILE;

if (!bucketName) {
  throw new Error("GCLOUD_BUCKET_NAME environment variable is not set.");
}
if (!projectId) {
  throw new Error("GCLOUD_PROJECT_ID environment variable is not set.");
}
if (!keyFilename) {
  throw new Error("GCLOUD_KEY_FILE environment variable is not set.");
}

const storage = new Storage({
  projectId,
  keyFilename
});
const bucket = storage.bucket(bucketName);

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
  });

  return new Promise((resolve, reject) => {
    stream.on("finish",async() => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(new Error("Failed to make image public: " + err.message));
      }
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
