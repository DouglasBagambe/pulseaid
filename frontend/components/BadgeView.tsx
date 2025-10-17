import React from "react";

type Badge = { tokenId: number; label?: string };

export default function BadgeView({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((b) => (
        <div
          key={b.tokenId}
          className="bg-[#0E1726] rounded-full aspect-square flex items-center justify-center text-white"
        >
          #{b.tokenId}
        </div>
      ))}
    </div>
  );
}
