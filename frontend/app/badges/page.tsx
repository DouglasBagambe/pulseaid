"use client";
import React, { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import BadgeView from "@/components/BadgeView";
import { CONTRACT_ADDRESSES, BADGE_ABI } from "@/lib/contracts";

interface Badge {
  tokenId: number;
  campaignId: number;
  badgeType: number;
  label?: string;
}

export default function BadgesPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadBadges();
    } else {
      setBadges([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function loadBadges() {
    if (!address || !publicClient) return;

    setLoading(true);
    try {
      // Use viem's publicClient to read contract
      const badgeCount = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.badge as `0x${string}`,
        abi: BADGE_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      // total tokens
      let totalTokens = 0n;
      try {
        totalTokens = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.badge as `0x${string}`,
          abi: BADGE_ABI,
          functionName: 'tokenCount',
        }) as bigint;
      } catch {
        // If contract doesn't expose tokenCount, try totalSupply
        try {
          totalTokens = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.badge as `0x${string}`,
            abi: BADGE_ABI,
            functionName: 'totalSupply',
          }) as bigint;
        } catch {
          totalTokens = 0n;
        }
      }

      if (badgeCount === 0n || totalTokens === 0n) {
        setBadges([]);
        setLoading(false);
        return;
      }

      const userBadges: Badge[] = [];

      // scan tokens - for production, use subgraph/indexer
      for (let i = 1; i <= Number(totalTokens); i++) {
        try {
          const owner = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.badge as `0x${string}`,
            abi: BADGE_ABI,
            functionName: 'ownerOf',
            args: [BigInt(i)],
          }) as string;

          if (owner && owner.toLowerCase() === address.toLowerCase()) {
            const campaignId = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.badge as `0x${string}`,
              abi: BADGE_ABI,
              functionName: 'campaignIds',
              args: [BigInt(i)],
            }) as bigint;

            const badgeType = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.badge as `0x${string}`,
              abi: BADGE_ABI,
              functionName: 'badgeTypes',
              args: [BigInt(i)],
            }) as bigint;

            userBadges.push({
              tokenId: i,
              campaignId: Number(campaignId),
              badgeType: Number(badgeType),
              label: Number(badgeType) === 0 ? "Kindness Hero" : "Escrow Champion",
            });

            if (userBadges.length >= Number(badgeCount)) break;
          }
        } catch {
          continue;
        }
      }

      setBadges(userBadges);
    } catch {
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/20 mb-4">
              <span className="text-2xl">🏆</span>
              <span className="text-sm font-medium text-[#35D07F]">Achievement System</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
              My Badges
            </h1>
            <p className="text-gray-400 text-lg">
              Earn NFT badges by donating to campaigns. Each badge is a testament to your impact.
            </p>
          </div>

          {!address ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-[#FCFF52]/20 rounded-3xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#35D07F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">Connect Your Wallet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Connect your Celo wallet to view your earned badges and track your impact
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🎖️</span>
                </div>
              </div>
              <p className="text-gray-400 mt-6">Loading your badges...</p>
            </div>
          ) : badges.length === 0 ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-[#FCFF52]/20 rounded-3xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎖️</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">No Badges Yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Start your journey by donating to campaigns and earn your first badge NFT!
                </p>
                <a
                  href="/campaigns"
                  className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300 transform hover:scale-105"
                >
                  Browse Campaigns
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Card */}
              <div className="relative group mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/30 to-[#FCFF52]/30 rounded-3xl blur-2xl" />
                <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent mb-2">
                        {badges.length}
                      </div>
                      <p className="text-gray-400 text-lg">Total Badges Earned</p>
                      <p className="text-sm text-gray-500 mt-1">
                        You&apos;re making a real difference! 🌟
                      </p>
                    </div>
                    <div className="text-6xl md:text-7xl">🏆</div>
                  </div>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white">Your Collection</h2>
                <BadgeView badges={badges} />
              </div>
            </>
          )}

          {/* Badge Types Info */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-white">Badge Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kindness Hero Badge */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FCFF52]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border-l-4 border-[#FCFF52] hover:border-[#FCFF52]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FCFF52] to-[#E5E84A] flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-2xl">💛</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2 text-[#FCFF52]">Kindness Hero</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Earned by donating to Pure Kindness campaigns where every contribution counts,
                        regardless of the goal. Your kindness creates ripples of hope.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCFF52]/10 border border-[#FCFF52]/20">
                        <span className="text-xs text-[#FCFF52] font-medium">Pure Kindness Mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Champion Badge */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border-l-4 border-[#35D07F] hover:border-[#35D07F]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#2AB56F] flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2 text-[#35D07F]">Escrow Champion</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Earned by helping goal-based campaigns reach their targets. Your support
                        ensures projects can succeed and funds are used responsibly.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/20">
                        <span className="text-xs text-[#35D07F] font-medium">Escrow Mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#35D07F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">About Badge NFTs</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  All badges are minted as NFTs on the Celo blockchain. They serve as permanent proof of your contributions
                  and can be viewed in your wallet or on blockchain explorers. Each badge is unique and tied to a specific campaign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}