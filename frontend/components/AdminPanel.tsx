import React, { useEffect, useState } from "react";
import axios from "axios";

type Campaign = {
  _id: string;
  chainCampaignId: number;
  title: string;
  description?: string;
  goal: string;
  mode: number;
  status: string;
  ipfsCid?: string;
  aiVerification?: {
    score: number;
    fraud: boolean;
    reason: string;
  };
};

export default function AdminPanel() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.get(`${base}/api/campaigns`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  }

  async function act(c: Campaign, action: "approve" | "reject") {
    setProcessing(c._id);
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const token = process.env.NEXT_PUBLIC_ADMIN_JWT || "";
      
      await axios.post(
        `${base}/api/campaigns/${c._id}/${action}`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      alert(`Campaign ${action}d successfully!`);
      await loadCampaigns();
    } catch (err: any) {
      console.error(`Failed to ${action}:`, err);
      alert(`Failed to ${action}: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessing(null);
    }
  }

  const pendingCampaigns = items.filter(c => c.status === "pending");
  const approvedCampaigns = items.filter(c => c.status === "approved");
  const rejectedCampaigns = items.filter(c => c.status === "rejected");

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0E1726] rounded-xl p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-white">{pendingCampaigns.length}</div>
          <div className="text-sm text-gray-400">Pending Review</div>
        </div>
        <div className="bg-[#0E1726] rounded-xl p-4 border-l-4 border-[#00C2A8]">
          <div className="text-2xl font-bold text-white">{approvedCampaigns.length}</div>
          <div className="text-sm text-gray-400">Approved</div>
        </div>
        <div className="bg-[#0E1726] rounded-xl p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-white">{rejectedCampaigns.length}</div>
          <div className="text-sm text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Pending Campaigns */}
      {pendingCampaigns.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">
            Pending Campaigns ({pendingCampaigns.length})
          </h3>
          <div className="space-y-4">
            {pendingCampaigns.map((c) => (
              <CampaignCard
                key={c._id}
                campaign={c}
                onApprove={() => act(c, "approve")}
                onReject={() => act(c, "reject")}
                processing={processing === c._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Campaigns */}
      {approvedCampaigns.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">
            Approved Campaigns ({approvedCampaigns.length})
          </h3>
          <div className="space-y-4">
            {approvedCampaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No campaigns yet
        </div>
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  onApprove,
  onReject,
  processing,
}: {
  campaign: Campaign;
  onApprove?: () => void;
  onReject?: () => void;
  processing?: boolean;
}) {
  const modeLabel = campaign.mode === 0 ? "Kindness" : "Escrow";
  const statusColor =
    campaign.status === "approved"
      ? "text-[#00C2A8]"
      : campaign.status === "rejected"
      ? "text-red-500"
      : "text-yellow-500";

  return (
    <div className="bg-[#0E1726] rounded-xl p-6 border border-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-white font-semibold text-lg">{campaign.title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${statusColor}`}>
              {campaign.status}
            </span>
          </div>
          {campaign.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {campaign.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Goal: {campaign.goal} CELO</span>
            <span>•</span>
            <span>Mode: {modeLabel}</span>
            <span>•</span>
            <span>ID: #{campaign.chainCampaignId || "pending"}</span>
          </div>
        </div>
      </div>

      {/* AI Verification */}
      {campaign.aiVerification && (
        <div className="mb-4 p-3 rounded-lg bg-[#0F62FE]/10 border border-[#0F62FE]/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              🤖 AI Verification Score: {(campaign.aiVerification.score * 100).toFixed(0)}%
            </span>
            <span
              className={
                campaign.aiVerification.fraud
                  ? "text-red-400 font-semibold"
                  : "text-[#00C2A8] font-semibold"
              }
            >
              {campaign.aiVerification.fraud ? "⚠️ Fraud Detected" : "✅ Verified"}
            </span>
          </div>
          {campaign.aiVerification.reason && (
            <p className="text-xs text-gray-400 mt-1">{campaign.aiVerification.reason}</p>
          )}
        </div>
      )}

      {/* Proof Link */}
      {campaign.ipfsCid && (
        <div className="mb-4">
          <a
            href={`https://w3s.link/ipfs/${campaign.ipfsCid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#00C2A8] hover:underline flex items-center gap-2"
          >
            📄 View Proof Document
          </a>
        </div>
      )}

      {/* Action Buttons */}
      {onApprove && onReject && (
        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <button
            className="flex-1 px-4 py-3 bg-[#00C2A8] rounded-xl text-black font-semibold hover:bg-[#00D4B8] transition disabled:opacity-50"
            onClick={onApprove}
            disabled={processing}
          >
            {processing ? "Processing..." : "✅ Approve & Release"}
          </button>
          <button
            className="flex-1 px-4 py-3 bg-red-600/20 border border-red-600 rounded-xl text-red-400 font-semibold hover:bg-red-600/30 transition disabled:opacity-50"
            onClick={onReject}
            disabled={processing}
          >
            {processing ? "Processing..." : "❌ Reject"}
          </button>
        </div>
      )}
    </div>
  );
}