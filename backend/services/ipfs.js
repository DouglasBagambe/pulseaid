const fs = require("fs");
const { FilebaseClient } = require("@filebase/client");
require("dotenv").config();

let filebase = null;

// Initialize Filebase client only if environment variables are available
if (
  process.env.FILEBASE_ACCESS_KEY_ID &&
  process.env.FILEBASE_SECRET_ACCESS_KEY &&
  process.env.FILEBASE_BUCKET
) {
  try {
    filebase = new FilebaseClient({
  accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID,
  secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY,
      bucket: process.env.FILEBASE_BUCKET,
});
  } catch (err) {
    console.warn("Filebase client initialization failed:", err.message);
  }
}

async function uploadToIPFS(filePath, metadata) {
  try {
    // If Filebase is not available, return a mock CID
    if (!filebase) {
      console.warn("Filebase not configured, using mock CID");
      return "mock-cid-" + Date.now();
    }

    const fileContent = fs.readFileSync(filePath);
    const fileResult = await filebase.store({
      content: fileContent,
      key: "proof.jpg",
      contentType: "image/jpeg",
    });
    const metaResult = await filebase.store({
      content: JSON.stringify({ metadata }),
      key: "metadata.json",
      contentType: "application/json",
    });
    return fileResult.cid;
  } catch (err) {
    console.warn("Filebase upload failed, using mock CID:", err.message);
    return "mock-cid-" + Date.now();
  }
}

module.exports = { uploadToIPFS };
