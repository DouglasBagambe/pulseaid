export const CONTRACT_ADDRESSES = {
  campaign: process.env.NEXT_PUBLIC_CAMPAIGN_ADDRESS,
  badge: process.env.NEXT_PUBLIC_BADGE_ADDRESS,
  escrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
};

export const CAMPAIGN_ABI = require('../contract_abi/PulseAidCampaign.json').abi;
export const BADGE_ABI = require('../contract_abi/PulseAidBadge.json').abi;
export const ESCROW_HELPER_ABI = require('../contract_abi/PulseAidEscrowHelper.json').abi;

// Campaign modes
export enum CampaignMode {
  KINDNESS = 0,
  ESCROW = 1
}

// Badge types
export enum BadgeType {
  KINDNESS = 0,
  ESCROW_HERO = 1
}

// Helper to format CELO amounts
export const formatCELO = (wei: string | bigint): string => {
  try {
    const value = typeof wei === 'string' ? BigInt(wei) : wei;
    return (Number(value) / 1e18).toFixed(4);
  } catch {
    return '0.0000';
  }
};

// Helper to parse CELO to wei
export const parseCELO = (amount: string): bigint => {
  return BigInt(Math.floor(parseFloat(amount) * 1e18));
};