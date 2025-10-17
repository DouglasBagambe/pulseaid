"use client";
import React from "react";
import BadgeView from "@/components/BadgeView";

export default function BadgesPage() {
  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Badges</h2>
      <BadgeView badges={[{ tokenId: 1 }, { tokenId: 2 }]} />
    </div>
  );
}
