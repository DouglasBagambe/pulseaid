"use client";
import React, { useState } from "react";
import DonateModal from "@/components/DonateModal";

export default function CampaignDetailPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
      <button
        className="px-4 py-2 rounded-2xl bg-[#00C2A8] text-black"
        onClick={() => setOpen(true)}
      >
        Donate
      </button>
      <DonateModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </div>
  );
}
