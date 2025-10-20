"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CampaignCard from "@/components/CampaignCard";
import { useRouter } from "next/navigation";

interface Campaign {
  _id: string;
  chainId: number;
  title: string;
  description?: string;
  goal: number;
  raised?: number;
  mode: number;
  status: string;
  ipfsCID?: string;
  deadline?: number;
  createdAt?: string;
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const base =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.get(`${base}/api/campaigns`);
      const data = res.data;
      console.log("Backend response:", data); // Debug log

      // Handle the correct response structure
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
      } else {
        console.warn("Unexpected response structure:", data);
        setCampaigns([]);
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  function handleDonate(id: string) {
    router.push(`/campaign/${id}`);
  }

  function handleCardClick(id: string) {
    router.push(`/campaign/${id}`);
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with Animated Gradient */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCFF52]/5 via-[#35D07F]/5 to-[#0B1020]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#35D07F]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FCFF52]/10 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse" />
              <span className="text-sm font-medium text-[#35D07F]">
                Powered by Celo
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#FCFF52] via-[#35D07F] to-[#FCFF52] bg-clip-text text-transparent animate-gradient">
                Onchain Hope
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transparent crowdfunding for real human crises. Every donation
              tracked on-chain with AI-powered fraud detection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/create"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300 transform hover:scale-105"
              >
                Create Campaign
              </a>
              <a
                href="/campaigns"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm text-white font-semibold hover:bg-white/10 transition-all duration-300 border border-white/10"
              >
                Explore Campaigns
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Glass Morphism */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#35D07F]/30 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-[#35D07F] mb-2">
                {campaigns.length}
              </div>
              <div className="text-gray-400 text-sm">Active Campaigns</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FCFF52]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#FCFF52]/30 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-[#FCFF52] mb-2">
                100%
              </div>
              <div className="text-gray-400 text-sm">On-Chain Transparency</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 via-[#FCFF52]/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#35D07F]/30 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent mb-2">
                AI
              </div>
              <div className="text-gray-400 text-sm">Fraud Detection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#35D07F]/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#2AB56F] flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Secure & Transparent
            </h3>
            <p className="text-gray-400 text-sm">
              Every transaction recorded on Celo blockchain for complete
              transparency
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FCFF52]/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCFF52] to-[#E5E84A] flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              Lightning Fast
            </h3>
            <p className="text-gray-400 text-sm">
              Mobile-optimized for instant donations on Celo&apos;s fast network
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#35D07F]/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#FCFF52] flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              AI Verified
            </h3>
            <p className="text-gray-400 text-sm">
              Advanced fraud detection to ensure authentic campaigns only
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Active Campaigns
          </h2>
          <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-[#35D07F]/50 to-transparent rounded-full" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to create a campaign and make an impact
            </p>
            <a
              href="/create"
              className="inline-block px-8 py-3 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300"
            >
              Create Campaign
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(campaigns) &&
              campaigns.map((c) => (
                <CampaignCard
                  key={c._id}
                  id={c._id}
                  title={c.title}
                  description={c.description}
                  goal={c.goal}
                  raised={c.raised || 0}
                  deadline={c.deadline}
                  mode={c.mode}
                  status={c.status}
                  onDonate={handleDonate}
                  onClick={handleCardClick}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
