const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");

dotenv.config();

const { uploadFileToIPFS } = require("./services/ipfs");
const contract = require("./services/contract");
const Campaign = require("./models/Campaign");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/pulseaid";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// DB connect
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

// File upload (memory)
const upload = multer({ storage: multer.memoryStorage() });

// Simple admin auth
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Health
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

// List campaigns
app.get("/campaigns", async (req, res) => {
  const items = await Campaign.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

// Create campaign
app.post("/createCampaign", upload.single("proof"), async (req, res) => {
  try {
    const { title, description, goal, mode, deadline, ownerAddress } = req.body;
    if (!title || !goal || typeof mode === "undefined" || !deadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let ipfsCid = null;
    if (req.file) {
      ipfsCid = await uploadFileToIPFS(req.file);
    }

    // Create on-chain (or stub)
    const createResult = await contract.createCampaignOnChain(
      ipfsCid || "",
      Number(goal),
      Number(mode),
      Number(deadline)
    );

    const campaign = await Campaign.create({
      title,
      description,
      goal: Number(goal),
      mode: Number(mode),
      deadline: Number(deadline),
      ipfsProof: ipfsCid,
      status: "PENDING",
      ownerAddress: ownerAddress || null,
      contractCampaignId: createResult.campaignId,
    });

    res.json({ ok: true, campaign });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

// Submit additional proof
app.post("/submitProof", upload.single("proof"), async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (!campaignId)
      return res.status(400).json({ error: "Missing campaignId" });
    if (!req.file) return res.status(400).json({ error: "Missing proof file" });

    const ipfsCid = await uploadFileToIPFS(req.file);
    const camp = await Campaign.findById(campaignId);
    if (!camp) return res.status(404).json({ error: "Campaign not found" });
    camp.proofs.push(ipfsCid);
    await camp.save();
    res.json({ ok: true, ipfsCid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to submit proof" });
  }
});

// Approve/Reject (admin)
app.post("/approveCampaign", requireAdmin, async (req, res) => {
  try {
    const { campaignId, action, recipient } = req.body; // action: 'approve' | 'reject'
    if (!campaignId || !action)
      return res.status(400).json({ error: "Missing fields" });
    const camp = await Campaign.findById(campaignId);
    if (!camp) return res.status(404).json({ error: "Campaign not found" });

    if (action === "approve") {
      await contract.releaseFundsOnChain(camp.contractCampaignId);
      camp.status = "APPROVED";
    } else if (action === "reject") {
      const recipientAddr = recipient || camp.ownerAddress || null;
      await contract.refundOnChain(camp.contractCampaignId, recipientAddr);
      camp.status = "REJECTED";
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await camp.save();
    res.json({ ok: true, campaign: camp });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to process approval" });
  }
});

// Mint donor badge (admin)
app.post("/mintBadge", requireAdmin, async (req, res) => {
  try {
    const { toAddress } = req.body;
    if (!toAddress) return res.status(400).json({ error: "Missing toAddress" });
    const result = await contract.mintBadge(toAddress);
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to mint badge" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
