"use client";
import { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

const CONTRACT_ADDRESS = "0xe753A3b1696622FAEE37f9b9EA5EAC774e196BE0";

type Campaign = {
  _id: string;
  chainCampaignId: number;
  title: string;
  description?: string;
  goal: number;
  raised?: number;
  mode: number; // 0 kindness, 1 escrow
  status: "pending" | "active" | "approved" | "completed" | "rejected";
  deadline: number;
  beneficiary?: string;
  proofUrl?: string;
  createdAt?: string;
};

const TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "rejected", label: "Rejected" },
  { key: "completed", label: "Completed" },
];

export default function AdminPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  function getErrorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
      const axErr = err as AxiosError<{ error?: string; message?: string }>;
      return (
        axErr.response?.data?.error ||
        axErr.response?.data?.message ||
        axErr.message ||
        fallback
      );
    }
    if (err instanceof Error) return err.message;
    return fallback;
  }

  async function load() {
    try {
      setLoading(true);
      const base =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.get(`${base}/api/campaigns`);
      const data = res.data?.campaigns || [];
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const tabOk = tab === "all" ? true : c.status === tab;
      const qOk = !q
        ? true
        : c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          String(c.chainCampaignId).includes(q);
      return tabOk && qOk;
    });
  }, [campaigns, tab, search]);

  async function approve(id: string) {
    if (!address || !walletClient || !publicClient) {
      alert("Please connect your wallet first to approve campaigns");
      return;
    }

    try {
      setActionLoadingId(id);
      
      // Find the campaign to get its chainCampaignId
      const campaign = campaigns.find(c => c._id === id);
      if (!campaign) {
        throw new Error("Campaign not found");
      }

      const CAMPAIGN_ABI = [
        {
          name: "approveCampaign",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "id", type: "uint256" }],
          outputs: [],
        },
        {
          name: "campaigns",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "id", type: "uint256" }],
          outputs: [
            { name: "beneficiary", type: "address" },
            { name: "ipfsMetadata", type: "string" },
            { name: "goal", type: "uint256" },
            { name: "raised", type: "uint256" },
            { name: "deadline", type: "uint256" },
            { name: "mode", type: "uint8" },
            { name: "active", type: "bool" },
            { name: "approved", type: "bool" },
          ],
        },
        {
          name: "owner",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "address" }],
        },
      ] as const;

      // Check current state on blockchain
      const campaignData = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CAMPAIGN_ABI,
        functionName: "campaigns",
        args: [BigInt(campaign.chainCampaignId)],
      });

      // Check if already approved
      if (campaignData[7]) { // approved field
        alert("This campaign is already approved on the blockchain");
        return;
      }

      // Call blockchain approveCampaign with MetaMask
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CAMPAIGN_ABI,
        functionName: "approveCampaign",
        args: [BigInt(campaign.chainCampaignId)],
      });

      alert("Approval transaction submitted! Waiting for confirmation...");

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60000,
      });


      if (receipt.status !== "success") {
        throw new Error("Blockchain approval transaction failed");
      }

      // Now update the database
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.post(`${base}/api/campaigns/${id}/approve`);
      const updated: Campaign = res.data?.campaign;
      setCampaigns((prev) => prev.map((c) => (c._id === id ? updated : c)));
      
      alert("Campaign approved successfully on blockchain and database! ✅");
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e, "Approve failed");
      
      let message = errorMessage;
      if (errorMessage.includes("User rejected")) {
        message = "Transaction was cancelled by user";
      } else if (errorMessage.includes("Already approved")) {
        message = "Campaign is already approved";
      } else if (errorMessage.includes("Campaign expired")) {
        message = "Cannot approve expired campaign";
      }
      
      alert(`Approve failed: ${message}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function reject(id: string) {
    const reason = prompt("Please provide a reason for rejection (this will be sent to the campaign creator):");
    
    if (!reason || reason.trim() === "") {
      alert("Rejection reason is required");
      return;
    }
    
    try {
      setActionLoadingId(id);
      const base =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.post(`${base}/api/campaigns/${id}/reject`, {
        reason: reason.trim()
      });
      const updated: Campaign = res.data?.campaign;
      setCampaigns((prev) => prev.map((c) => (c._id === id ? updated : c)));
      alert("Campaign rejected and email notification sent to creator");
    } catch (e: unknown) {
      const errorMessage = getErrorMessage(e, "Reject failed");
      alert(`Reject failed: ${errorMessage}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#35D07F]/10 via-[#0B1020] to-[#FCFF52]/10 border-b border-white/10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#35D07F]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FCFF52]/10 rounded-full blur-3xl" />
        <div className="relative container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-400 mt-2">
            Review, approve or reject campaigns
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-6">
          <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 w-full md:w-auto overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  tab === t.key
                    ? "bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description or ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/10 to-[#FCFF52]/10 rounded-3xl blur-xl" />
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 md:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Loading campaigns...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🫥</span>
                </div>
                <p className="text-gray-400">No campaigns match your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((c) => {
                  const isEscrow = c.mode === 1;
                  const progress = Math.min(
                    ((c.raised || 0) / c.goal) * 100,
                    100
                  );
                  const expired = c.deadline < Math.floor(Date.now() / 1000);
                  return (
                    <div key={c._id} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 rounded-2xl blur-2xl" />
                      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isEscrow
                                ? "bg-[#35D07F]/10 border border-[#35D07F]/20 text-[#35D07F]"
                                : "bg-[#FCFF52]/10 border border-[#FCFF52]/20 text-[#FCFF52]"
                            }`}
                          >
                            {isEscrow ? "🛡️ Escrow" : "💛 Kindness"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize bg-white/5 border border-white/10 ${
                              c.status === "active"
                                ? "text-[#35D07F]"
                                : c.status === "pending"
                                ? "text-gray-400"
                                : c.status === "rejected"
                                ? "text-red-400"
                                : "text-[#FCFF52]"
                            }`}
                          >
                            {c.status}
                          </span>
                          {expired && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-400">
                              Expired
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white line-clamp-2">
                            {c.title}
                          </h3>
                          {c.description && (
                            <p className="text-sm text-gray-400 line-clamp-3 mt-1">
                              {c.description}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">Raised</span>
                            <span className="text-white font-medium">
                              {(c.raised || 0).toFixed(2)} / {c.goal.toFixed(2)}{" "}
                              CELO
                            </span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#35D07F] to-[#FCFF52]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 flex items-center justify-between">
                          <span>ID #{c.chainCampaignId}</span>
                          <span>
                            {new Date(
                              c.createdAt
                                ? new Date(c.createdAt).getTime()
                                : Date.now()
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          {c.status === "pending" && (
                            <>
                              <button
                                onClick={() => approve(c._id)}
                                disabled={actionLoadingId === c._id}
                                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300 disabled:opacity-50"
                              >
                                {actionLoadingId === c._id
                                  ? "Approving..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() => reject(c._id)}
                                disabled={actionLoadingId === c._id}
                                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
                              >
                                {actionLoadingId === c._id
                                  ? "Rejecting..."
                                  : "Reject"}
                              </button>
                            </>
                          )}

                          {c.status === "active" && (
                            <span className="text-xs text-[#35D07F] px-3 py-2 rounded-xl bg-[#35D07F]/10 border border-[#35D07F]/20 font-medium">
                              Accepting Donations
                            </span>
                          )}
                          {c.status === "rejected" && (
                            <span className="text-xs text-red-400 px-3 py-2 rounded-xl bg-red-400/10 border border-red-400/20 font-medium">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
