const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const {
  createCampaign,
  approveCampaign,
  submitProof,
} = require("./services/contract");
const { uploadToIPFS } = require("./services/ipfs");
const Campaign = require("./models/Campaign");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

// Check required environment variables
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Get all campaigns
app.get("/api/campaigns", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "Database temporarily unavailable",
      });
    }

    const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();

    res.json({ success: true, campaigns });
  } catch (err) {
    console.error("Get campaigns error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get pending campaigns (for admin)
app.get("/api/campaigns/pending", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "Database temporarily unavailable",
      });
    }

    const campaigns = await Campaign.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, campaigns });
  } catch (err) {
    console.error("Get pending campaigns error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get single campaign by ID
app.get("/api/campaigns/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "Database temporarily unavailable",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid campaign ID format",
      });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        error: "Campaign not found",
      });
    }

    res.json(campaign);
  } catch (err) {
    console.error("Get campaign error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create new campaign
app.post("/api/campaigns", upload.single("proof"), async (req, res) => {
  try {
    const { title, description, goal, mode, deadline, beneficiary } = req.body;

    // Validate required fields
    if (!title || !goal || !deadline || !beneficiary) {
      return res.status(400).json({
        error: "Missing required fields: title, goal, deadline, beneficiary",
      });
    }

    let ipfsCID = null;
    let proofUrl = null;

    // Handle file upload if provided
    if (req.file) {
      try {
        ipfsCID = await uploadToIPFS(req.file.path, { title, description });
        proofUrl = `https://ipfs.io/ipfs/${ipfsCID}`;
      } catch (ipfsError) {
        console.error("IPFS upload failed:", ipfsError);
      }
    }

    // Create campaign on blockchain
    const chainCampaignId = await createCampaign(
      ipfsCID || "",
      goal,
      mode,
      deadline
    );

    // Use beneficiary from request or a default value
    const beneficiaryAddress =
      beneficiary || "0x0000000000000000000000000000000000000000";

    // Save to MongoDB
    const newCampaign = new Campaign({
      chainCampaignId,
      ipfsCID: ipfsCID || "",
      status: "pending",
      title,
      description,
      goal: parseFloat(goal),
      raised: 0,
      mode: parseInt(mode),
      deadline: parseInt(deadline),
      beneficiary: beneficiaryAddress,
      proofUrl,
      proofs: ipfsCID ? [ipfsCID] : [],
    });

    const savedCampaign = await newCampaign.save();

    res.json({
      success: true,
      campaign: savedCampaign,
    });
  } catch (err) {
    console.error("Campaign creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Approve campaign
app.post("/api/campaigns/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid campaign ID format",
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Optional: Call AI verification service
    // const aiVerdict = await axios.post("http://localhost:5001/verify", {
    //   campaignId: id,
    // });
    // if (aiVerdict.data.fraud) {
    //   throw new Error("AI detected potential fraud");
    // }

    // Approve on blockchain
    await approveCampaign(campaign.chainCampaignId);

    // Mark as active to accept donations
    campaign.status = "active";
    await campaign.save();

    res.json({ success: true, campaign });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Reject campaign
app.post("/api/campaigns/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid campaign ID format",
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    campaign.status = "rejected";
    await campaign.save();

    res.json({ success: true, campaign });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Submit proof for campaign
app.post(
  "/api/campaigns/:id/proof",
  upload.single("proof"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid campaign ID format",
        });
      }

      const campaign = await Campaign.findById(id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No proof file provided" });
      }

      // Upload proof to IPFS
      const ipfsCID = await uploadToIPFS(req.file.path, {
        campaignId: id,
        timestamp: Date.now(),
      });

      // Submit proof to blockchain
      await submitProof(campaign.chainCampaignId, ipfsCID);

      // Update campaign with new proof
      campaign.proofs.push(ipfsCID);
      if (!campaign.proofUrl) {
        campaign.proofUrl = `https://ipfs.io/ipfs/${ipfsCID}`;
      }
      await campaign.save();

      res.json({
        success: true,
        ipfsCID,
        proofUrl: `https://ipfs.io/ipfs/${ipfsCID}`,
      });
    } catch (err) {
      console.error("Proof submission error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
