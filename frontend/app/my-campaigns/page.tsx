"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import CampaignCard from "@/components/CampaignCard";

interface Campaign {
  _id: string;
  chainCampaignId?: number;
  title: string;
  description?: string;
  goal: number;
  raised?: number;
  deadline?: number;
  beneficiary: string;
  status: string;
  mode: number;
  ipfsCid?: string;
  createdAt?: string;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "progress", label: "Highest Progress" },
  { value: "goal", label: "Highest Goal" },
  { value: "raised", label: "Most Raised" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

const MODE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "0", label: "Kindness" },
  { value: "1", label: "Escrow" },
];

export default function MyCampaignsPage() {
  const { address } = useAccount();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

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
      const data = res.data;
      
      if (data.success && Array.isArray(data.campaigns)) {
        const myCampaigns = data.campaigns.filter(
          (c: Campaign) => c.beneficiary?.toLowerCase() === address.toLowerCase()
        );
        setCampaigns(myCampaigns);
      } else {
        setCampaigns([]);
      }
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...campaigns];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          String(c.chainCampaignId || "").includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (modeFilter !== "all") {
      result = result.filter((c) => c.mode === parseInt(modeFilter));
    }

    switch (sortBy) {
      case "recent":
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "oldest":
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "progress":
        result.sort((a, b) => {
          const pctA = ((a.raised || 0) / a.goal) * 100;
          const pctB = ((b.raised || 0) / b.goal) * 100;
          return pctB - pctA;
        });
        break;
      case "goal":
        result.sort((a, b) => b.goal - a.goal);
        break;
      case "raised":
        result.sort((a, b) => (b.raised || 0) - (a.raised || 0));
        break;
    }

    return result;
  }, [campaigns, search, statusFilter, modeFilter, sortBy]);

  function handleCardClick(id: string) {
    router.push(`/campaign/${id}`);
  }

  function handleDonate(id: string) {
    router.push(`/campaign/${id}`);
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/20 mb-4">
              <span className="text-sm font-medium text-[#35D07F]">Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
              My Campaigns
            </h1>
            <p className="text-gray-400 text-lg">
              View and manage all campaigns you've created
            </p>
          </div>

          {!address ? (
            <div className="text-center py-20">
              <p className="text-gray-400">Connect your wallet to view your campaigns</p>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 mt-6">Loading...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-6">No campaigns yet</p>
              <button
                onClick={() => router.push("/create")}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <>
              {/* Search and Filters - EXACT COPY from campaigns */}
              <div className="sticky top-24 z-40 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10 -mx-4 px-4 py-4 mb-8">
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search campaigns by title, description, or ID..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white placeholder-gray-500"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                          statusFilter === f.value
                            ? "bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
                    {MODE_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setModeFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                          modeFilter === f.value
                            ? "bg-gradient-to-r from-[#FCFF52] to-[#E5E84A] text-black"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1" />

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:border-[#35D07F] transition-all cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0B1020]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campaigns Grid */}
              {filteredAndSorted.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-2xl font-semibold mb-3 text-white">No campaigns found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setModeFilter("all");
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSorted.map((campaign) => (
                    <CampaignCard
                      key={campaign._id}
                      id={campaign._id}
                      title={campaign.title}
                      description={campaign.description}
                      goal={campaign.goal}
                      raised={campaign.raised || 0}
                      deadline={campaign.deadline}
                      mode={campaign.mode}
                      status={campaign.status}
                      onDonate={handleDonate}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
