"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xe1085DB3c91cB5F0dad3bD22E7eA7ac57713BD7F";

interface Campaign {
  _id: string;
  chainCampaignId: number;
  title: string;
  description?: string;
  goal: string;
  raised?: string;
  mode: number;
  status: string;
  deadline: number;
  beneficiary?: string;
  proofUrl?: string;
  createdAt: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState("0.1");
  const [timeLeft, setTimeLeft] = useState("");

  const loadCampaign = React.useCallback(async () => {
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.get(`${base}/api/campaigns/${params.id}`);
      setCampaign(res.data);
    } catch (err) {
      console.error("Failed to load campaign:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const updateTimeLeft = React.useCallback(() => {
    if (!campaign) return;
    
    const now = Math.floor(Date.now() / 1000);
    const deadline = campaign.deadline;
    const diff = deadline - now;

    if (diff <= 0) {
      setTimeLeft("Expired");
      return;
    }

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
  }, [campaign]);

  useEffect(() => {
    if (campaign) {
      const interval = setInterval(() => {
        updateTimeLeft();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [campaign, updateTimeLeft]);

  async function handleDonate() {
    if (!address || !walletClient || !campaign) {
      alert("Please connect your wallet first");
      return;
    }

    if (parseFloat(donationAmount) <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    setDonating(true);
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        publicClient?.transport.url || "https://alfajores-forno.celo-testnet.org"
      );

      const signer = walletClient as unknown as ethers.Signer;
      const CROWDFUNDING_ABI = [
        "function donate(uint256 campaignId) payable"
      ];
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CROWDFUNDING_ABI,
        provider
      );

      const contractWithSigner = contract.connect(signer);
      const valueInWei = ethers.utils.parseEther(donationAmount);

      const tx = await contractWithSigner.donate(campaign.chainCampaignId, {
        value: valueInWei,
      });

      alert("Transaction submitted! Waiting for confirmation...");
      await tx.wait();

      alert("Donation successful! 🎉");
      loadCampaign();
    } catch (err: unknown) {
      console.error("Donation failed:", err);
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Donation failed: ${message}`);
    } finally {
      setDonating(false);
    }
  }

  // Helper function to format address
  const formatAddress = (addr?: string) => {
    if (!addr || addr.length < 18) return "Not available";
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <p className="text-gray-400 mb-6">This campaign doesn&#39;t exist or has been removed.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min(
    (parseFloat(campaign.raised || "0") / parseFloat(campaign.goal)) * 100,
    100
  );

  const isExpired = campaign.deadline < Math.floor(Date.now() / 1000);
  const statusColor = 
    campaign.status === "active" ? "text-[#35D07F]" :
    campaign.status === "approved" ? "text-[#FCFF52]" :
    campaign.status === "pending" ? "text-gray-400" :
    "text-red-400";

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#35D07F]/10 via-[#0B1020] to-[#FCFF52]/10 border-b border-white/10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#35D07F]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FCFF52]/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-12">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Campaigns
          </button>

          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                campaign.mode === 0 
                  ? "bg-[#FCFF52]/10 border border-[#FCFF52]/20 text-[#FCFF52]"
                  : "bg-[#35D07F]/10 border border-[#35D07F]/20 text-[#35D07F]"
              }`}>
                {campaign.mode === 0 ? "💛 Pure Kindness" : "🛡️ Escrow Mode"}
              </span>
              <span className={`px-4 py-1 rounded-full text-sm font-medium bg-white/5 border border-white/10 capitalize ${statusColor}`}>
                {campaign.status}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
              {campaign.title}
            </h1>

            {campaign.description && (
              <p className="text-lg text-gray-300 leading-relaxed">
                {campaign.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-[#FCFF52]/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Raised</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
                      {parseFloat(campaign.raised || "0").toFixed(2)} CELO
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Goal</p>
                    <p className="text-2xl font-semibold text-white">
                      {parseFloat(campaign.goal).toFixed(2)} CELO
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-4">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#35D07F] to-[#FCFF52] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {progressPercentage.toFixed(1)}% funded
                  </span>
                  <span className="text-gray-400">
                    {isExpired ? "⏰ Expired" : `⏱️ ${timeLeft} left`}
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/10 to-[#FCFF52]/10 rounded-3xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-white">Campaign Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Beneficiary</p>
                    <p className="text-white font-mono text-sm break-all">
                      {formatAddress(campaign.beneficiary)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Campaign ID</p>
                    <p className="text-white font-mono text-sm">
                      #{campaign.chainCampaignId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Created</p>
                    <p className="text-white text-sm">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Deadline</p>
                    <p className="text-white text-sm">
                      {new Date(campaign.deadline * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {campaign.proofUrl && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-3">Proof Document</p>
                    <a
                      href={campaign.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#35D07F] hover:bg-white/10 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Proof on IPFS
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Type Info */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/10 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    campaign.mode === 0
                      ? "bg-gradient-to-br from-[#FCFF52] to-[#E5E84A]"
                      : "bg-gradient-to-br from-[#35D07F] to-[#2AB56F]"
                  }`}>
                    <span className="text-2xl">{campaign.mode === 0 ? "💛" : "🛡️"}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      campaign.mode === 0 ? "text-[#FCFF52]" : "text-[#35D07F]"
                    }`}>
                      {campaign.mode === 0 ? "Pure Kindness Campaign" : "Escrow Campaign"}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {campaign.mode === 0
                        ? "All donations go directly to the beneficiary, regardless of whether the goal is reached. Every contribution makes an immediate impact."
                        : "Donations are held in escrow. If the goal is reached by the deadline, funds are released. Otherwise, donors receive automatic refunds."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#35D07F]/30 to-[#FCFF52]/30 rounded-3xl blur-2xl" />
                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-6 text-white">Make a Donation</h3>

                  {!address ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#35D07F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        Connect your wallet to donate
                      </p>
                    </div>
                  ) : campaign.status !== "active" ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⏸️</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        This campaign is not accepting donations yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">
                          Amount (CELO)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white"
                          placeholder="0.1"
                        />
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {["0.5", "1", "5"].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setDonationAmount(amount)}
                            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-[#35D07F]/30 transition-all duration-300"
                          >
                            {amount} CELO
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleDonate}
                        disabled={donating || isExpired}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                      >
                        {donating ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </span>
                        ) : isExpired ? "Campaign Expired" : "Donate Now"}
                      </button>

                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-[#35D07F] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Your donation will be recorded on the Celo blockchain and you&#39;ll receive a badge NFT!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}