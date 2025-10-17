const ethers = require('ethers');
require('dotenv').config();

const CAMPAIGN_ABI = require('../../contracts/artifacts/contracts/PulseAidCampaign.sol/PulseAidCampaign.json').abi;
const BADGE_ABI = require('../../contracts/artifacts/contracts/PulseAidBadge.sol/PulseAidBadge.json').abi;
const ESCROW_ABI = require('../../contracts/artifacts/contracts/PulseAidEscrowHelper.sol/PulseAidEscrowHelper.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.CELO_SEPOLIA_RPC);
let wallet;
try {
  wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
} catch (err) {
  throw new Error(`Wallet init failed: ${err.message}`);
}

const campaignContract = new ethers.Contract('0xe1085DB3c91cB5F0dad3bD22E7eA7ac57713BD7F', CAMPAIGN_ABI, wallet);
const badgeContract = new ethers.Contract('0x533b9B683DA95967151Ea5cEBF0EcA3BAFdE3665', BADGE_ABI, wallet);
const escrowContract = new ethers.Contract('0xcf2D0f99dd63b64F465E61df6B701Dd1ECB49c19', ESCROW_ABI, wallet);

async function createCampaign(ipfsCID, goal, mode, deadline) {
  try {
    const tx = await campaignContract.createCampaign(ipfsCID, ethers.utils.parseEther(goal), mode, deadline);
    const receipt = await tx.wait();
    return (await campaignContract.campaignCount()).toNumber();
  } catch (err) {
    throw new Error(`Create campaign failed: ${err.message}`);
  }
}

async function approveCampaign(id) {
  try {
    const tx = await campaignContract.approveCampaign(id);
    await tx.wait();
    // Mock donor list for demo (replace with escrowContract.getDonors if implemented)
    const donors = [wallet.address]; // Replace with actual donor fetch
    for (const donor of donors) {
      const amount = await escrowContract.contributions(id, donor);
      if (amount > 0) {
        const badgeType = (await campaignContract.campaigns(id)).mode === 0 ? 0 : 1;
        await badgeContract.mintBadge(donor, id, badgeType);
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