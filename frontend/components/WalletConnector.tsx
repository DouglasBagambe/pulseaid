import React from "react";
import { useContractKit } from "@celo-tools/use-contractkit";

export default function WalletConnector() {
  const { address, connect, destroy } = useContractKit();

  if (!address) {
    return (
      <button
        className="px-6 py-3 rounded-2xl bg-blue-600 text-white"
        onClick={connect}
      >
        Connect Wallet
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-300">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <button
        className="px-3 py-2 rounded-xl bg-gray-700 text-white"
        onClick={destroy}
      >
        Disconnect
      </button>
    </div>
  );
}
