const { ethers } = require("ethers");

// Dummy addresses; replace after deployment
const DUMMY_BADGE_ADDRESS =
  process.env.BADGE_ADDRESS || "0xBadgeAddress000000000000000000000000000000";
const DUMMY_CAMPAIGN_ADDRESS =
  process.env.CAMPAIGN_ADDRESS || "0xCampaignAddress0000000000000000000000000";

// Minimal ABIs (fill in with real ABIs after compile)
const CAMPAIGN_ABI = [
  "function createCampaign(string ipfsProof, uint256 goal, uint8 mode, uint256 deadline) external",
  "function releaseFunds(uint256 id) external",
  "function refund(uint256 id, address recipient) external",
];

const BADGE_ABI = ["function mintBadge(address to) external returns (uint256)"];

function getProviderAndWallet() {
  const url =
    process.env.ALFAJORES_RPC || "https://alfajores-forno.celo-testnet.org";
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  const provider = new ethers.providers.JsonRpcProvider(url);
  const wallet = key
    ? new ethers.Wallet(key, provider)
    : ethers.Wallet.createRandom().connect(provider);
  return { provider, wallet };
}

async function createCampaignOnChain(ipfsCid, goal, mode, deadline) {
  // For hackathon, we can simulate an id until contracts are deployed
  try {
    const { wallet } = getProviderAndWallet();
    const contract = new ethers.Contract(
      DUMMY_CAMPAIGN_ADDRESS,
      CAMPAIGN_ABI,
      wallet
    );
    const tx = await contract.createCampaign(ipfsCid, goal, mode, deadline);
    await tx.wait();
    // In a real implementation, fetch campaignCount to get id
    return { txHash: tx.hash, campaignId: Date.now() % 100000 }; // mock id
  } catch (e) {
    // Fallback: purely mock id when address is dummy
    return { txHash: null, campaignId: Math.floor(Math.random() * 100000) };
  }
}

async function releaseFundsOnChain(campaignId) {
  try {
    const { wallet } = getProviderAndWallet();
    const contract = new ethers.Contract(
      DUMMY_CAMPAIGN_ADDRESS,
      CAMPAIGN_ABI,
      wallet
    );
    const tx = await contract.releaseFunds(campaignId);
    await tx.wait();
    return { txHash: tx.hash };
  } catch (e) {
    return { txHash: null };
  }
}

async function refundOnChain(campaignId, recipient) {
  try {
    const { wallet } = getProviderAndWallet();
    const contract = new ethers.Contract(
      DUMMY_CAMPAIGN_ADDRESS,
      CAMPAIGN_ABI,
      wallet
    );
    const tx = await contract.refund(campaignId, recipient || wallet.address);
    await tx.wait();
    return { txHash: tx.hash };
  } catch (e) {
    return { txHash: null };
  }
}

async function mintBadge(toAddress) {
  try {
    const { wallet } = getProviderAndWallet();
    const badge = new ethers.Contract(DUMMY_BADGE_ADDRESS, BADGE_ABI, wallet);
    const tx = await badge.mintBadge(toAddress);
    const receipt = await tx.wait();
    // naive parse: last event log index as tokenId unsupported without ABI; mock
    return { txHash: tx.hash, tokenId: Date.now() % 100000 };
  } catch (e) {
    return { txHash: null, tokenId: null };
  }
}

module.exports = {
  createCampaignOnChain,
  releaseFundsOnChain,
  refundOnChain,
  mintBadge,
};
