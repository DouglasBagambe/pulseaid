const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  // Blockchain campaign ID
  chainCampaignId: { type: Number, required: true },
  
  // IPFS content identifier
  ipfsCID: String,
  
  // Campaign status
  status: { 
    type: String, 
    enum: ["pending", "active", "approved", "completed", "rejected"],
    default: "pending" 
  },
  
  // Campaign details
  title: { type: String, required: true },
  description: String,
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  
  // Campaign mode (0 = Pure Kindness, 1 = Escrow)
  mode: { type: Number, required: true, enum: [0, 1] },
  
  // Unix timestamp deadline
  deadline: { type: Number, required: true },
  
  // Beneficiary wallet address
  beneficiary: { type: String, required: true },
  
  // Proof document URL (IPFS)
  proofUrl: String,
  
  // Array of additional proof IPFS CIDs
  proofs: [String],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for common queries
campaignSchema.index({ chainCampaignId: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });

// Update the updatedAt timestamp on save
campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Campaign", campaignSchema);