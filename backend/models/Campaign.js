const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    goal: { type: Number, required: true },
    mode: { type: Number, required: true }, // 0 kindness, 1 escrow
    deadline: { type: Number, required: true }, // unix seconds
    ipfsProof: { type: String },
    proofs: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    ownerAddress: { type: String },
    contractCampaignId: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", CampaignSchema);
