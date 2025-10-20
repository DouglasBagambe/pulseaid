import React from "react";

type Badge = { 
  tokenId: number; 
  campaignId?: number;
  badgeType?: number;
  label?: string;
};

export default function BadgeView({ badges }: { badges: Badge[] }) {
  const getBadgeColor = (badgeType?: number) => {
    if (badgeType === 0) return "from-[#FFD166] to-[#FF9E40]"; // Kindness - gold
    if (badgeType === 1) return "from-[#00C2A8] to-[#0F62FE]"; // Escrow - teal/blue
    return "from-gray-500 to-gray-700"; // Unknown
  };

  const getBadgeIcon = (badgeType?: number) => {
    if (badgeType === 0) return "💛"; // Kindness
    if (badgeType === 1) return "🛡️"; // Escrow
    return "🎖️"; // Unknown
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {badges.map((b) => (
        <div
          key={b.tokenId}
          className="bg-[#0E1726] rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300 border border-gray-800 hover:border-[#00C2A8]"
        >
          {/* Badge Icon */}
          <div className="relative mb-4">
            <div
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getBadgeColor(
                b.badgeType
              )} flex items-center justify-center text-4xl shadow-lg`}
            >
              {getBadgeIcon(b.badgeType)}
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-[#0B1020] rounded-full text-xs font-mono border border-gray-700">
              #{b.tokenId}
            </div>
          </div>

          {/* Badge Info */}
          <div className="text-center">
            <h3 className="font-semibold text-white mb-1">
              {b.label || "PulseAid Badge"}
            </h3>
            {b.campaignId !== undefined && (
              <p className="text-sm text-gray-400 mb-3">
                Campaign #{b.campaignId}
              </p>
            )}
            
            {/* Badge Type Label */}
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#0F62FE]/20 to-[#00C2A8]/20 text-xs">
              {b.badgeType === 0 ? "Kindness Hero" : 
               b.badgeType === 1 ? "Escrow Champion" : 
               "Supporter"}
            </div>
          </div>

          {/* Badge Details */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 text-center">
            <p>Earned for making a difference</p>
          </div>
        </div>
      ))}
    </div>
  );
}