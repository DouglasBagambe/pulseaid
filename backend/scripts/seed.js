const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Campaign = require("../models/Campaign");

dotenv.config();

async function run() {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/pulseaid";
  await mongoose.connect(MONGODB_URI);

  await Campaign.deleteMany({});

  const now = Math.floor(Date.now() / 1000);
  const items = await Campaign.insertMany([
    {
      title: "Kindness Fund for School Meals",
      description: "Provide daily meals to kids for a month",
      goal: 5,
      mode: 0,
      deadline: now + 7 * 24 * 3600,
      ipfsProof: null,
      status: "PENDING",
      ownerAddress: null,
      contractCampaignId: Math.floor(Math.random() * 100000),
    },
    {
      title: "Escrow for Medical Bills",
      description: "Raise funds for surgery, release on approval",
      goal: 10,
      mode: 1,
      deadline: now + 14 * 24 * 3600,
      ipfsProof: null,
      status: "PENDING",
      ownerAddress: null,
      contractCampaignId: Math.floor(Math.random() * 100000),
    },
  ]);

  console.log(
    "Seeded campaigns:",
    items.map((i) => i.title)
  );
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
