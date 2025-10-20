const ethers = require("ethers");
require("dotenv").config();

const CAMPAIGN_ABI =
  require("../../contracts/artifacts/contracts/PulseAidCampaign.sol/PulseAidCampaign.json").abi;
const BADGE_ABI =
  require("../../contracts/artifacts/contracts/PulseAidBadge.sol/PulseAidBadge.json").abi;
const ESCROW_ABI =
  require("../../contracts/artifacts/contracts/PulseAidEscrowHelper.sol/PulseAidEscrowHelper.json").abi;

// Check for required environment variables
if (!process.env.CELO_SEPOLIA_RPC || !process.env.DEPLOYER_PRIVATE_KEY) {
  console.warn(
    "Blockchain environment variables not configured, using mock functions"
  );
}

const provider = process.env.CELO_SEPOLIA_RPC
  ? new ethers.JsonRpcProvider(process.env.CELO_SEPOLIA_RPC)
  : null;
let wallet = null;

if (process.env.DEPLOYER_PRIVATE_KEY && provider) {
  try {
    wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  } catch (err) {
    console.warn("Wallet init failed:", err.message);
  }
}

// Initialize contracts only if wallet is available
const campaignContract = wallet
  ? new ethers.Contract(
      "0xe1085DB3c91cB5F0dad3bD22E7eA7ac57713BD7F",
      CAMPAIGN_ABI,
      wallet
    )
  : null;
const badgeContract = wallet
  ? new ethers.Contract(
      "0x533b9B683DA95967151Ea5cEBF0EcA3BAFdE3665",
      BADGE_ABI,
      wallet
    )
  : null;
const escrowContract = wallet
  ? new ethers.Contract(
      "0xcf2D0f99dd63b64F465E61df6B701Dd1ECB49c19",
      ESCROW_ABI,
      wallet
    )
  : null;

async function createCampaign(ipfsCID, goal, mode, deadline) {
  try {
    // If blockchain is not configured, return a mock campaign ID
    if (!campaignContract) {
      console.warn("Blockchain not configured, using mock campaign ID");
      return Math.floor(Math.random() * 1000) + 1;
    }

    // Validate deadline is in the future
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseInt(deadline) <= currentTime) {
      console.warn("Deadline must be in the future, using mock ID");
      return Math.floor(Math.random() * 1000) + 1;
    }

    const tx = await campaignContract.createCampaign(
      ipfsCID,
      ethers.parseEther(goal),
      mode,
      deadline
    );
    const receipt = await tx.wait();
    return (await campaignContract.campaignCount()).toNumber();
  } catch (err) {
    console.warn("Create campaign failed, using mock ID:", err.message);
    return Math.floor(Math.random() * 1000) + 1;
  }
}

async function approveCampaign(id) {
  try {
    // If blockchain not configured, no-op to avoid backend 500
    if (!campaignContract || !wallet) {
      console.warn(
        "approveCampaign: blockchain disabled, skipping on-chain call"
      );
      return;
    }

    const tx = await campaignContract.approveCampaign(id);
    await tx.wait();
    // Optional: badge minting only if helper contracts are available
    if (escrowContract && badgeContract) {
      const donors = [wallet.address];
      for (const donor of donors) {
        const amount = await escrowContract.contributions(id, donor);
        if (amount > 0) {
          const campaign = await campaignContract.campaigns(id);
          const badgeType = campaign.mode === 0 ? 0 : 1;
          await badgeContract.mintBadge(donor, id, badgeType);
        }
      }
    }
  } catch (err) {
    throw new Error(`Approve campaign failed: ${err.message}`);
  }
}

async function submitProof(id, proofCID) {
  try {
    const tx = await campaignContract.submitProof(id, proofCID);
    await tx.wait();
  } catch (err) {
    throw new Error(`Submit proof failed: ${err.message}`);
  }
}

module.exports = { createCampaign, approveCampaign, submitProof };
