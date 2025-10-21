import React, { useState } from "react";

type Props = {
  id: string;
  title: string;
  description?: string;
  goal: number;
  raised?: number;
  deadline?: number;
  mode?: number;
  status?: string;
  onDonate?: (id: string, amount: string) => void;
  onClick?: (id: string) => void;
};

export default function CampaignCard({
  id,
  title,
  description,
  goal,
  raised = 0,
  deadline,
  mode = 0,
  status = "active",
  onDonate,
  onClick,
}: Props) {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState("");
  
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const isEscrow = mode === 1;
  const canDonate = status === "active";
  
  // Calculate days remaining
  const daysRemaining = deadline 
    ? Math.max(0, Math.floor((deadline - Date.now() / 1000) / 86400))
    : null;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if donate button or modal was clicked
    if ((e.target as HTMLElement).closest('.donate-button') || 
        (e.target as HTMLElement).closest('.donate-modal')) {
      return;
    }
    onClick?.(id);
  };

  const handleDonateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDonate) return;
    setShowDonateModal(true);
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (donateAmount && parseFloat(donateAmount) > 0) {
      onDonate?.(id, donateAmount);
      setShowDonateModal(false);
      setDonateAmount("");
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="relative group cursor-pointer"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#35D07F]/0 via-[#FCFF52]/0 to-[#35D07F]/0 group-hover:from-[#35D07F]/20 group-hover:via-[#FCFF52]/10 group-hover:to-[#35D07F]/20 rounded-2xl blur-xl transition-all duration-500" />
      
      {/* Main card */}
      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 group-hover:border-[#35D07F]/30 rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-2xl flex flex-col min-h-[400px]">
        {/* Status & Mode badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${
            isEscrow 
              ? "bg-[#35D07F]/20 border border-[#35D07F]/40 text-[#35D07F]" 
              : "bg-[#FCFF52]/20 border border-[#FCFF52]/40 text-[#FCFF52]"
          }`}>
            {isEscrow ? "🛡️ Escrow" : "💛 Kindness"}
          </span>
          {status === "pending" && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md bg-orange-500/20 border border-orange-500/40 text-orange-300">
              ⏳ Pending
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6 pt-16 flex flex-col flex-1">
          {/* Title - Fixed height */}
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-[#FCFF52] transition-colors duration-300">
            {title}
          </h3>
          
          {/* Description - Fixed height */}
          <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed min-h-[2.5rem]">
            {description || "No description provided"}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400 font-medium">Progress</span>
              <span className="text-white font-bold">{pct}%</span>
            </div>
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#35D07F] via-[#FCFF52]/50 to-[#35D07F] animate-pulse"
                style={{ width: `${pct}%`, transition: 'width 0.5s ease-out' }}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Raised</div>
              <div className="text-lg font-bold text-[#35D07F]">
                {raised.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">CELO</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Goal</div>
              <div className="text-lg font-bold text-white">
                {goal.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">CELO</div>
            </div>
          </div>

          {/* Footer */}
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
            
            {onDonate && (
              <button
                onClick={handleDonateClick}
                disabled={!canDonate}
                className={`donate-button ml-auto px-6 py-2.5 rounded-xl font-bold transition-all duration-300 transform ${
                  canDonate
                    ? "bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black hover:shadow-lg hover:shadow-[#35D07F]/50 hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-white/5 border border-white/10 text-gray-500 blur-sm cursor-not-allowed"
                }`}
                title={!canDonate ? "Campaign not active yet" : ""}
              >
                Donate Now
              </button>
            )}
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#35D07F] via-[#FCFF52] to-[#35D07F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>

      {/* Donation Modal */}
      {showDonateModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 donate-modal"
          onClick={(e) => {
            e.stopPropagation();
            setShowDonateModal(false);
          }}
        >
          <div 
            className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Donate to Campaign</h3>
            <p className="text-gray-400 mb-6">{title}</p>
            
            <form onSubmit={handleDonateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (CELO)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#35D07F] transition-all"
                  placeholder="0.1"
                  autoFocus
                  required
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {["0.5", "1", "5"].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDonateAmount(amount)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-[#35D07F]/30 transition-all"
                  >
                    {amount} CELO
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDonateModal(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-bold hover:shadow-lg hover:shadow-[#35D07F]/50 transition-all"
                >
                  Donate Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}