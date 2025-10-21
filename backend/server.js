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

    // Validate deadline is in the future
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseInt(deadline) <= currentTime) {
      return res.status(400).json({
        error: "Deadline must be in the future",
      });
    }

    // Validate beneficiary address
    if (!/^0x[a-fA-F0-9]{40}$/.test(beneficiary)) {
      return res.status(400).json({
        error: "Invalid beneficiary address format",
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
        // Continue without IPFS if it fails
      }
    }

    // ✅ Create campaign on blockchain FIRST - this will throw if it fails
    let chainCampaignId;
    try {
      chainCampaignId = await createCampaign(
        ipfsCID || "",
        goal,
        mode,
        deadline
      );
      console.log(`[Backend] Blockchain campaign created with ID: ${chainCampaignId}`);
    } catch (blockchainError) {
      console.error("[Backend] Blockchain campaign creation failed:", blockchainError.message);
      return res.status(500).json({
        error: "Failed to create campaign on blockchain",
        details: blockchainError.message,
        hint: "Please ensure your .env file has CELO_SEPOLIA_RPC and DEPLOYER_PRIVATE_KEY configured correctly",
      });
    }

    // ✅ Only save to MongoDB if blockchain creation succeeded
    const newCampaign = new Campaign({
      chainCampaignId,
      ipfsCID: ipfsCID || "",
      status: "pending", // Admin must approve before it becomes "active"
      title,
      description,
      goal: parseFloat(goal),
      raised: 0,
      mode: parseInt(mode),
      deadline: parseInt(deadline),
      beneficiary,
      proofUrl,
      proofs: ipfsCID ? [ipfsCID] : [],
    });

    const savedCampaign = await newCampaign.save();
    console.log(`[Backend] Campaign saved to database:`, savedCampaign._id);

    res.json({
      success: true,
      campaign: savedCampaign,
      message: "Campaign created successfully and awaiting admin approval",
    });
  } catch (err) {
    console.error("Campaign creation error:", err);
    
    // Provide helpful error messages
    if (err.message.includes("Blockchain not configured")) {
      return res.status(503).json({
        error: "Service temporarily unavailable",
        details: "Blockchain integration is not configured. Please contact support.",
      });
    }
    
    res.status(500).json({ 
      error: "Failed to create campaign",
      details: err.message 
    });
  }
});

// Approve campaign
app.post("/api/campaigns/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[Backend] Approve request for campaign ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid campaign ID format",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "Database temporarily unavailable",
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    console.log("[Backend] Campaign found:", {
      _id: campaign._id,
      chainCampaignId: campaign.chainCampaignId,
      status: campaign.status,
      title: campaign.title
    });

    // Check if campaign is already approved/active
    if (campaign.status === "active") {
      return res.status(400).json({
        error: "Campaign is already approved and active",
      });
    }

    // ✅ CRITICAL: Don't approve mock campaigns
    if (campaign.chainCampaignId > 1000) {
      return res.status(400).json({
        error: "Cannot approve this campaign - it was created before blockchain integration was properly configured",
        hint: "Please create a new campaign to test the system",
      });
    }

    // ✅ CRITICAL: Approve on blockchain FIRST, fail if it doesn't work
    try {
      console.log(`[Backend] Calling blockchain approveCampaign for chain ID: ${campaign.chainCampaignId}`);
      await approveCampaign(campaign.chainCampaignId);
      console.log("[Backend] Blockchain approval successful!");
    } catch (blockchainError) {
      console.error("[Backend] Blockchain approval FAILED:", blockchainError.message);
      
      // ❌ DON'T update database if blockchain fails
      return res.status(500).json({
        error: "Failed to approve campaign on blockchain",
        details: blockchainError.message,
        hint: "Check that CELO_SEPOLIA_RPC and DEPLOYER_PRIVATE_KEY are set correctly in .env",
      });
    }

    // ✅ Only update database if blockchain approval succeeded
    campaign.status = "active";
    await campaign.save();
    
    console.log("[Backend] Campaign approved and marked as active:", campaign._id);
    
    res.json({ 
      success: true, 
      campaign,
      message: "Campaign approved successfully on blockchain and database"
    });
  } catch (err) {
    console.error("[Backend] Approve endpoint error:", err);
    res.status(500).json({ 
      error: "Failed to approve campaign",
      details: err.message 
    });
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

// Update campaign raised amount (called after successful donation)
app.post("/api/campaigns/:id/update-raised", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid campaign ID format",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "Database temporarily unavailable",
      });
    }

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({
        error: "Valid amount is required",
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Update raised amount
    campaign.raised = (campaign.raised || 0) + parseFloat(amount);
    await campaign.save();

    res.json({
      success: true,
      campaign,
    });
  } catch (err) {
    console.error("Update raised amount error:", err);
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
