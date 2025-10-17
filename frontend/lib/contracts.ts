// Replace after deployment
export const CONTRACT_ADDRESSES = {
  badge:
    process.env.NEXT_PUBLIC_BADGE_ADDRESS ||
    "0xBadgeAddress000000000000000000000000000000",
  campaign:
    process.env.NEXT_PUBLIC_CAMPAIGN_ADDRESS ||
    "0xCampaignAddress0000000000000000000000000",
};

export const CAMPAIGN_ABI = [
  "function donate(uint256 id) external payable",
  "function createCampaign(string ipfsProof, uint256 goal, uint8 mode, uint256 deadline) external",
];

export const BADGE_ABI = [
  "function mintBadge(address to) external returns (uint256)",
];
