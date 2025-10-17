const { Web3Storage, File } = require("web3.storage");

function getClient() {
  const token = process.env.WEB3STORAGE_API_KEY;
  if (!token) {
    throw new Error("WEB3STORAGE_API_KEY missing");
  }
  return new Web3Storage({ token });
}

async function uploadFileToIPFS(file) {
  const client = getClient();
  const f = new File([file.buffer], file.originalname, { type: file.mimetype });
  const cid = await client.put([f], { wrapWithDirectory: false });
  return `ipfs://${cid}`;
}

module.exports = { uploadFileToIPFS };
