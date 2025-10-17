const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const { createCampaign, approveCampaign, submitProof } = require('./services/contract'); // Adjust as needed
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/campaigns', upload.single('proof'), async (req, res) => {
  try {
    const { goal, mode, deadline, story } = req.body;
    const ipfsCID = await uploadToIPFS(req.file.path, story); // From services/ipfs.js
    const campaignId = await createCampaign(ipfsCID, goal, mode, deadline); // From services/contract.js
    // Save to Mongo
    const newCampaign = new Campaign({ chainId: campaignId, ipfsCID, status: 'PENDING' });
    await newCampaign.save();
    res.json({ success: true, campaignId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/campaigns/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    // Call AI mock (from ai/ service)
    const aiVerdict = await axios.post('http://localhost:5001/verify', { campaignId: id });
    if (aiVerdict.data.fraud) throw new Error('AI detected fraud');
    await approveCampaign(id); // Calls releaseFunds + mintBadge
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add other endpoints: /submitProof (similar to create), /pending (Mongo query), /refund

app.listen(4000, () => console.log('Backend on port 4000'));