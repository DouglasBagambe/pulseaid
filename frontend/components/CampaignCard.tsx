import React from "react";

type Props = {
  id: string;
  title: string;
  description?: string;
  goal: number;
  raised?: number;
  onDonate?: (id: string) => void;
};

export default function CampaignCard({
  id,
  title,
  description,
  goal,
  raised = 0,
  onDonate,
}: Props) {
  const pct = Math.min(100, Math.round((raised / Math.max(goal, 1)) * 100));
  return (
    <div className="bg-[#0E1726] rounded-xl p-4 shadow-sm">
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm line-clamp-3 mb-3">{description}</p>
      <div className="w-full bg-gray-700 h-2 rounded mb-2">
        <div
          className="h-2 rounded bg-[#00C2A8]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
        <span>
          Raised: {raised} / {goal} CELO
        </span>
        <span>{pct}%</span>
      </div>
      {onDonate && (
        <button
          className="px-4 py-2 rounded-2xl bg-[#00C2A8] text-black"
          onClick={() => onDonate(id)}
        >
          Donate
        </button>
      )}
    </div>
  );
}
