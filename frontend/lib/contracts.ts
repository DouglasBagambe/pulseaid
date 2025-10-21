import CampaignArtifact from '../contract_abi/PulseAidCampaign.json';
import BadgeArtifact from '../contract_abi/PulseAidBadge.json';
import EscrowHelperArtifact from '../contract_abi/PulseAidEscrowHelper.json';

export const CONTRACT_ADDRESSES = {
  campaign: process.env.NEXT_PUBLIC_CAMPAIGN_ADDRESS,
  badge: process.env.NEXT_PUBLIC_BADGE_ADDRESS,
  escrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS,
};

// Type assertion to access abi property
type ContractArtifact = { abi: any };

export const CAMPAIGN_ABI = (CampaignArtifact as ContractArtifact).abi;
export const BADGE_ABI = (BadgeArtifact as ContractArtifact).abi;
export const ESCROW_HELPER_ABI = (EscrowHelperArtifact as ContractArtifact).abi;

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