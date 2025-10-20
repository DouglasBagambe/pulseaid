"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  _id: string;
  chainId: number;
  chainCampaignId?: number;
  title: string;
  description?: string;
  goal: number;
  raised?: number;
  mode: number;
  status: string;
  deadline?: number;
  createdAt?: string;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "progress", label: "Highest Progress" },
  { value: "goal", label: "Highest Goal" },
  { value: "raised", label: "Most Raised" },
  { value: "deadline", label: "Ending Soon" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Status", icon: "🌐" },
  { value: "active", label: "Active", icon: "✅" },
  { value: "pending", label: "Pending", icon: "⏳" },
  { value: "completed", label: "Completed", icon: "🎉" },
];

const MODE_FILTERS = [
  { value: "all", label: "All Types", icon: "🔍" },
  { value: "0", label: "Kindness", icon: "💛" },
  { value: "1", label: "Escrow", icon: "🛡️" },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${base}/api/campaigns`);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
      } else {
        setCampaigns([]);
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
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
      case "deadline":
        result.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline - b.deadline;
        });
        break;
    }

    return result;
  }, [campaigns, search, statusFilter, modeFilter, sortBy]);

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "active").length;
    const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised || 0), 0);
    const avgProgress =
      campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + ((c.raised || 0) / c.goal) * 100, 0) / campaigns.length
        : 0;
    return { active, totalRaised, avgProgress };
  }, [campaigns]);

  function handleDonate(id: string) {
    console.log("Donate to:", id);
  }

  function handleCardClick(id: string) {
    router.push(`/campaign/${id}`);
  }

  return (
    <div className="min-h-screen text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCFF52]/5 via-[#35D07F]/5 to-[#0B1020]" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#35D07F]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FCFF52]/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FCFF52] via-[#35D07F] to-[#FCFF52] bg-clip-text text-transparent">
              Explore Campaigns
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Discover meaningful causes and make a difference with transparent, blockchain-powered donations
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-[#35D07F] mb-1">{stats.active}</div>
                <div className="text-xs text-gray-400">Active Now</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-[#FCFF52] mb-1">{stats.totalRaised.toFixed(0)}</div>
                <div className="text-xs text-gray-400">Total Raised (CELO)</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white mb-1">{stats.avgProgress.toFixed(0)}%</div>
                <div className="text-xs text-gray-400">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-40 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="relative mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns by title, description, or ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white placeholder-gray-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                  {f.icon} {f.label}
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
                  {f.icon} {f.label}
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

            <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "grid" ? "bg-white/10 text-[#35D07F]" : "text-gray-400 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === "list" ? "bg-white/10 text-[#35D07F]" : "text-gray-400 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing <span className="text-white font-semibold">{filteredAndSorted.length}</span> of{" "}
            <span className="text-white font-semibold">{campaigns.length}</span> campaigns
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading campaigns...</p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No campaigns found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setModeFilter("all");
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
          }>
            {filteredAndSorted.map((campaign) => {
              const pct = Math.min(100, ((campaign.raised || 0) / campaign.goal) * 100);
              const isEscrow = campaign.mode === 1;
              const daysRemaining = campaign.deadline 
                ? Math.max(0, Math.floor((campaign.deadline - Date.now() / 1000) / 86400))
                : null;

              return (
                <div
                  key={campaign._id}
                  onClick={() => handleCardClick(campaign._id)}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#35D07F]/0 via-[#FCFF52]/0 to-[#35D07F]/0 group-hover:from-[#35D07F]/20 group-hover:via-[#FCFF52]/10 group-hover:to-[#35D07F]/20 rounded-2xl blur-xl transition-all duration-500" />
                  
                  <div className="relative bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-[#35D07F]/30 rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:scale-[1.02]">
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${
                        isEscrow 
                          ? "bg-[#35D07F]/20 border border-[#35D07F]/40 text-[#35D07F]" 
                          : "bg-[#FCFF52]/20 border border-[#FCFF52]/40 text-[#FCFF52]"
                      }`}>
                        {isEscrow ? "🛡️ Escrow" : "💛 Kindness"}
                      </span>
                      {campaign.status === "pending" && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md bg-orange-500/20 border border-orange-500/40 text-orange-300">
                          ⏳ Pending
                        </span>
                      )}
                    </div>

                    <div className="p-6 pt-16">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#FCFF52] transition-colors duration-300">
                        {campaign.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {campaign.description || "No description provided"}
                      </p>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400 font-medium">Progress</span>
                          <span className="text-white font-bold">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-[#35D07F] via-[#FCFF52]/50 to-[#35D07F]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Raised</div>
                          <div className="text-lg font-bold text-[#35D07F]">{(campaign.raised || 0).toFixed(2)}</div>
                          <div className="text-xs text-gray-500">CELO</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Goal</div>
                          <div className="text-lg font-bold text-white">{campaign.goal.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">CELO</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        {daysRemaining !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={daysRemaining < 7 ? "text-red-400 font-semibold" : "text-gray-400"}>
                              {daysRemaining === 0 ? "Last day!" : `${daysRemaining} days left`}
                            </span>
                          </div>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDonate(campaign._id);
                          }}
                          className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-bold hover:shadow-lg hover:shadow-[#35D07F]/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                          Donate Now
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#35D07F] via-[#FCFF52] to-[#35D07F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#35D07F]/20 via-[#FCFF52]/20 to-[#35D07F]/20 blur-3xl" />
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
              Ready to Make a Difference?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Start your own campaign or support existing causes. Every contribution is tracked transparently on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/create"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-bold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300 transform hover:scale-105"
              >
                Create Campaign
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm text-white font-bold hover:bg-white/10 transition-all duration-300 border border-white/10"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}