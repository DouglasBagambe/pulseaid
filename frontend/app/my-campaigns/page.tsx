"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import Link from "next/link";

interface Campaign {
  _id: string;
  chainCampaignId: number;
  title: string;
  description?: string;
  goal: number;
  raised?: number;
  deadline: number;
  beneficiary: string;
  status: string;
  mode: number;
  ipfsCid?: string;
  createdAt?: string;
}

export default function MyCampaignsPage() {
  const { address } = useAccount();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadMyCampaigns();
    } else {
      setCampaigns([]);
      setLoading(false);
    }
  }, [address]);

  async function loadMyCampaigns() {
    if (!address) return;
    
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.get(`${base}/api/campaigns`);
      const allCampaigns = res.data?.campaigns || [];
      
      // Filter campaigns where beneficiary matches connected wallet
      const myCampaigns = allCampaigns.filter(
        (c: Campaign) => c.beneficiary?.toLowerCase() === address.toLowerCase()
      );
      
      setCampaigns(myCampaigns);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  const formatCELO = (amount: number) => {
    return (amount / 1e18).toFixed(4);
  };

  const getProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/20 mb-4">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium text-[#35D07F]">My Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
              My Campaigns
            </h1>
            <p className="text-gray-400 text-lg">
              Track and manage all your campaigns in one place
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
                  Connect your Celo wallet to view your campaigns
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <p className="text-gray-400 mt-6">Loading your campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-[#FCFF52]/20 rounded-3xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">No Campaigns Yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  You haven&apos;t created any campaigns yet. Start making a difference today!
                </p>
                <Link
                  href="/create"
                  className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300 transform hover:scale-105"
                >
                  Create Campaign
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-transparent rounded-2xl blur-xl" />
                  <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="text-4xl font-bold text-[#35D07F] mb-2">{campaigns.length}</div>
                    <p className="text-gray-400">Total Campaigns</p>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FCFF52]/20 to-transparent rounded-2xl blur-xl" />
                  <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="text-4xl font-bold text-[#FCFF52] mb-2">
                      {campaigns.filter(c => c.status === "approved").length}
                    </div>
                    <p className="text-gray-400">Active</p>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-2xl blur-xl" />
                  <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="text-4xl font-bold text-yellow-500 mb-2">
                      {campaigns.filter(c => c.status === "pending").length}
                    </div>
                    <p className="text-gray-400">Pending</p>
                  </div>
                </div>
              </div>

              {/* Campaigns Grid */}
              <div className="space-y-6">
                {campaigns.map((campaign) => (
                  <div key={campaign._id} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/10 to-[#FCFF52]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#35D07F]/30 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{campaign.title}</h3>
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              campaign.status === "approved" 
                                ? "bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30"
                                : campaign.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-500 border border-red-500/30"
                            }`}>
                              {campaign.status}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
                              {campaign.mode === 0 ? "💛 Kindness" : "🛡️ Escrow"}
                            </span>
                          </div>
                          {campaign.description && (
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-semibold">
                            {formatCELO(campaign.raised || 0)} / {formatCELO(campaign.goal)} CELO
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#35D07F] to-[#FCFF52] transition-all duration-500"
                            style={{ width: `${getProgress(campaign.raised || 0, campaign.goal)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>{getProgress(campaign.raised || 0, campaign.goal).toFixed(1)}% funded</span>
                          <span>ID: #{campaign.chainCampaignId || "pending"}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/campaign/${campaign.chainCampaignId}`}
                          className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold text-center hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300"
                        >
                          View Details
                        </Link>
                        {campaign.ipfsCid && (
                          <a
                            href={`https://w3s.link/ipfs/${campaign.ipfsCid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all duration-300"
                          >
                            📄 Proof
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
