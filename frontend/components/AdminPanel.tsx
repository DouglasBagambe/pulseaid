import React, { useEffect, useState } from "react";
import axios from "axios";

type Campaign = any;

export default function AdminPanel() {
  const [items, setItems] = useState<Campaign[]>([]);

  useEffect(() => {
    (async () => {
      const base =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await axios.get(`${base}/campaigns`);
      setItems(res.data || []);
    })();
  }, []);

  async function act(c: any, action: "approve" | "reject") {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    const token = process.env.NEXT_PUBLIC_ADMIN_JWT || "";
    await axios.post(
      `${base}/approveCampaign`,
      { campaignId: c._id, action },
      {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      }
    );
    const res = await axios.get(`${base}/campaigns`);
    setItems(res.data || []);
  }

  return (
    <div className="space-y-3">
      {items.map((c: any) => (
        <div key={c._id} className="bg-[#0E1726] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">{c.title}</div>
              <div className="text-gray-400 text-sm">
                goal: {c.goal} CELO • mode: {c.mode}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 bg-[#00C2A8] rounded-xl text-black"
                onClick={() => act(c, "approve")}
              >
                Approve
              </button>
              <button
                className="px-3 py-2 bg-red-600 rounded-xl text-white"
                onClick={() => act(c, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
