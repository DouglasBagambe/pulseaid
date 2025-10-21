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

async function approveCampaign(id) {
  // ✅ CRITICAL: Don't approve if blockchain isn't configured
  if (!campaignContract || !wallet) {
    throw new Error(
      "Blockchain not configured. Cannot approve campaigns without blockchain access."
    );
  }

  try {
    console.log(`[Contract] Approving campaign ID: ${id}`);

    // Check if campaign exists on blockchain
    const campaign = await campaignContract.campaigns(id);
    if (!campaign.active) {
      throw new Error(`Campaign ${id} is not active on blockchain`);
    }

    console.log(`[Contract] Calling approveCampaign for ID: ${id}`);
    const tx = await campaignContract.approveCampaign(id);
    console.log(`[Contract] Approve tx sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`[Contract] Approve tx confirmed: ${receipt.hash}`);

    // Mint badges for donors
    if (escrowContract && badgeContract) {
      console.log(`[Contract] Checking donors for campaign ${id}`);
      // Note: You'll need to implement a way to get the actual donor list
      // This is a placeholder - you should get donors from events or escrow contract
      const donors = []; // TODO: Implement getDonors function
      
      for (const donor of donors) {
        try {
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
        } catch (badgeErr) {
          console.error(`[Contract] Failed to mint badge for ${donor}:`, badgeErr.message);
          // Continue with other donors even if one fails
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