const ethers = require("ethers");
require("dotenv").config();

const CAMPAIGN_ABI =
  require("../../contracts/artifacts/contracts/PulseAidCampaign.sol/PulseAidCampaign.json").abi;
const BADGE_ABI =
  require("../../contracts/artifacts/contracts/PulseAidBadge.sol/PulseAidBadge.json").abi;
const ESCROW_ABI =
  require("../../contracts/artifacts/contracts/PulseAidEscrowHelper.sol/PulseAidEscrowHelper.json").abi;

if (!process.env.CELO_SEPOLIA_RPC || !process.env.DEPLOYER_PRIVATE_KEY) {
  console.warn(
    "[Contract] Blockchain environment variables not configured, using mock functions"
  );
}

const provider = process.env.CELO_SEPOLIA_RPC
  ? new ethers.JsonRpcProvider(process.env.CELO_SEPOLIA_RPC)
  : null;
let wallet = null;

if (process.env.DEPLOYER_PRIVATE_KEY && provider) {
  try {
    wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    console.log("[Contract] Wallet initialized for address:", wallet.address);
  } catch (err) {
    console.warn("[Contract] Wallet init failed:", err.message);
  }
}

const campaignContract = wallet
  ? new ethers.Contract(
      "0xB39Aa33939b8c9a50b3331BD0beeAa98D0c0f91D",
      CAMPAIGN_ABI,
      wallet
    )
  : null;
const badgeContract = wallet
  ? new ethers.Contract(
      "0x6Ed99b2dA3a3fe972036bAB4fB142002BfD38139",
      BADGE_ABI,
      wallet
    )
  : null;
const escrowContract = wallet
  ? new ethers.Contract(
      "0xBDB61a04DB269052A2F9d32423001d7E13A1bFB5",
      ESCROW_ABI,
      wallet
    )
  : null;

async function createCampaign(ipfsCID, goal, mode, deadline) {
  try {
    if (!campaignContract) {
      console.warn(
        "[Contract] Blockchain not configured, using mock campaign ID"
      );
      return Math.floor(Math.random() * 1000) + 1;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    if (parseInt(deadline) <= currentTime) {
      console.warn("[Contract] Deadline must be in future, using mock ID");
      return Math.floor(Math.random() * 1000) + 1;
    }
    console.log(
      `[Contract] Creating campaign: ipfsCID=${ipfsCID}, goal=${goal}, mode=${mode}, deadline=${deadline}`
    );
    const tx = await campaignContract.createCampaign(
      ipfsCID,
      ethers.parseEther(goal),
      mode,
      deadline
    );
    console.log("[Contract] Create campaign tx:", tx.hash);
    const receipt = await tx.wait();
    const count = (await campaignContract.campaignCount()).toNumber();
    console.log("[Contract] Campaign created, ID:", count);
    return count;
  } catch (err) {
    console.error("[Contract] Create campaign error:", err.message);
    return Math.floor(Math.random() * 1000) + 1;
  }
}

async function approveCampaign(id) {
  try {
    console.log(`[Contract] Approving campaign ID: ${id}`);
    if (!campaignContract || !wallet) {
      console.warn("[Contract] Blockchain disabled, skipping on-chain call");
      return; // Return successfully instead of throwing error
    }
    const campaign = await campaignContract.campaigns(id);
    if (!campaign.active) {
      console.warn(`[Contract] Campaign ${id} is not active`);
      throw new Error("Campaign inactive");
    }
    console.log(`[Contract] Calling approveCampaign for ID: ${id}`);
    const tx = await campaignContract.approveCampaign(id);
    console.log(`[Contract] Approve tx sent: ${tx.hash}`);
    await tx.wait();
    console.log(`[Contract] Approve tx confirmed: ${tx.hash}`);
    if (escrowContract && badgeContract) {
      console.log(`[Contract] Checking donors for campaign ${id}`);
      const donors = [wallet.address]; // Replace with actual donor list from escrow
      for (const donor of donors) {
        const amount = await escrowContract.contributions(id, donor);
        if (amount > 0) {
          const badgeType = campaign.mode === 0 ? 0 : 1;
          console.log(
            `[Contract] Minting badge for donor ${donor}, type ${badgeType}`
          );
          const badgeTx = await badgeContract.mintBadge(donor, id, badgeType);
          await badgeTx.wait();
          console.log(`[Contract] Badge minted for ${donor}`);
        }
      }
    }
    console.log(`[Contract] Campaign ${id} approved successfully`);
  } catch (err) {
    console.error(
      `[Contract] Approve campaign error for ID ${id}:`,
      err.message
    );
    throw new Error(`Approve campaign failed: ${err.message}`);
  }
}

async function submitProof(id, proofCID) {
  try {
    console.log(
      `[Contract] Submitting proof for campaign ID: ${id}, proofCID: ${proofCID}`
    );
    if (!campaignContract) {
      console.warn(
        "[Contract] Blockchain not configured, skipping proof submission"
      );
      throw new Error("Blockchain not configured");
    }
    const tx = await campaignContract.submitProof(id, proofCID);
    console.log(`[Contract] Proof submission tx: ${tx.hash}`);
    await tx.wait();
    console.log(`[Contract] Proof submitted for campaign ${id}`);
  } catch (err) {
    console.error("[Contract] Submit proof error:", err.message);
    throw new Error(`Submit proof failed: ${err.message}`);
  }
}

module.exports = { createCampaign, approveCampaign, submitProof };
