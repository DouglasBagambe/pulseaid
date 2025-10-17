const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  chainId: Number,
  ipfsCID: String,
  status: { type: String, default: 'PENDING' },
  proofs: [String], // Array of IPFS CIDs
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);