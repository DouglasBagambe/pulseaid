const fs = require('fs');
const { FilebaseClient } = require('@filebase/client');
require('dotenv').config();

const filebase = new FilebaseClient({
  accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID,
  secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY,
  bucket: process.env.FILEBASE_BUCKET
});

async function uploadToIPFS(filePath, metadata) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileResult = await filebase.store({
      content: fileContent,
      key: 'proof.jpg',
      contentType: 'image/jpeg'
    });
    const metaResult = await filebase.store({
      content: JSON.stringify({ metadata }),
      key: 'metadata.json',
      contentType: 'application/json'
    });
    return fileResult.cid;
  } catch (err) {
    throw new Error(`Filebase upload failed: ${err.message}`);
  }
}

module.exports = { uploadToIPFS };