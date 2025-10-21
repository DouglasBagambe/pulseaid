const ethers = require("ethers");
require("dotenv").config();

const CAMPAIGN_ABI =
  require("../../contracts/artifacts/contracts/PulseAidCampaign.sol/PulseAidCampaign.json").abi;
const BADGE_ABI =
  require("../../contracts/artifacts/contracts/PulseAidBadge.sol/PulseAidBadge.json").abi;
const ESCROW_ABI =
  require("../../contracts/artifacts/contracts/PulseAidEscrowHelper.sol/PulseAidEscrowHelper.json").abi;

if (!process.env.CELO_SEPOLIA_RPC || !process.env.DEPLOYER_PRIVATE_KEY) {
  console.error(
    "[Contract] CRITICAL: Blockchain environment variables not configured!"
  );
  console.error("[Contract] Required: CELO_SEPOLIA_RPC, DEPLOYER_PRIVATE_KEY");
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
    console.error("[Contract] Wallet init failed:", err.message);
  }
}

const campaignContract = wallet
  ? new ethers.Contract(
      "0xe753A3b1696622FAEE37f9b9EA5EAC774e196BE0",
      CAMPAIGN_ABI,
      wallet
    )
  : null;
const badgeContract = wallet
  ? new ethers.Contract(
      "0xCB7982672fDBA957d91BD9144bEF247e2B6078D8",
      BADGE_ABI,
      wallet
    )
  : null;
const escrowContract = wallet
  ? new ethers.Contract(
      "0x294DA90f0996f6C9F3d49115303e322144F7397d",
      ESCROW_ABI,
      wallet
    )
  : null;

async function createCampaign(ipfsCID, goal, mode, deadline) {
  // ✅ CRITICAL: Don't create campaigns if blockchain isn't configured
  if (!campaignContract) {
    throw new Error(
      "Blockchain not configured. Please set CELO_SEPOLIA_RPC and DEPLOYER_PRIVATE_KEY in .env"
    );
  }

  // ✅ Validate deadline before calling blockchain
  const currentTime = Math.floor(Date.now() / 1000);
  if (parseInt(deadline) <= currentTime) {
    throw new Error("Deadline must be in the future");
  }

  try {
    console.log(
      `[Contract] Creating campaign: ipfsCID=${ipfsCID}, goal=${goal}, mode=${mode}, deadline=${deadline}`
    );

    const tx = await campaignContract.createCampaign(
      ipfsCID,
      ethers.parseEther(goal.toString()),
      mode,
      deadline
    );

    console.log("[Contract] Create campaign tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("[Contract] Transaction confirmed:", receipt.hash);

    // ✅ Get the actual campaign count from blockchain
    const count = await campaignContract.campaignCount();
    const campaignId = Number(count);
    
    console.log("[Contract] Campaign created with ID:", campaignId);
    return campaignId;
  } catch (err) {
    console.error("[Contract] Create campaign error:", err);
    
    // ✅ Provide detailed error messages
    if (err.message.includes("Deadline must be in future")) {
      throw new Error("Campaign deadline must be in the future");
    } else if (err.message.includes("insufficient funds")) {
      throw new Error("Insufficient funds to create campaign");
    } else if (err.message.includes("user rejected")) {
      throw new Error("Transaction was rejected");
    }
    
    throw new Error(`Failed to create campaign on blockchain: ${err.message}`);
  }
}

// NOTE: approveCampaign is now handled in the frontend with MetaMask
// This function is kept for reference but should not be called
// The backend /api/campaigns/:id/approve endpoint only updates the database
async function approveCampaign(id) {
  console.warn(
    `[Contract] approveCampaign called for ID ${id} - this should be handled in frontend with MetaMask`
  );
  throw new Error(
    "Campaign approval should be done through frontend with MetaMask, not backend"
  );
}

async function submitProof(id, proofCID) {
  if (!campaignContract) {
    throw new Error("Blockchain not configured. Cannot submit proof.");
  }

  try {
    console.log(
      `[Contract] Submitting proof for campaign ID: ${id}, proofCID: ${proofCID}`
    );
    
    const tx = await campaignContract.submitProof(id, proofCID);
    console.log(`[Contract] Proof submission tx: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`[Contract] Proof submitted successfully:`, receipt.hash);
  } catch (err) {
    console.error("[Contract] Submit proof error:", err.message);
    throw new Error(`Submit proof failed: ${err.message}`);
  }
}

module.exports = { createCampaign, approveCampaign, submitProof };