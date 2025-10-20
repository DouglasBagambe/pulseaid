"use client";
import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { addCeloSepoliaNetwork } from "@/providers/Web3Provider";

export default function WalletConnector() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-2 bg-gradient-to-r from-[#35D07F] to-[#FCFF52] text-black font-semibold rounded-xl hover:from-[#2BB86F] hover:to-[#E6F52E] transition-all duration-300 transform hover:scale-105"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-300"
                  >
                    Wrong network
                  </button>
                );
              }

              if (chain.id !== 11142220) {
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await addCeloSepoliaNetwork();
                        } catch (error) {
                          console.error("Failed to switch network:", error);
                        }
                      }}
                      type="button"
                      className="px-3 py-2 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-600 transition-all duration-300 text-sm"
                    >
                      Switch to Celo Sepolia
                    </button>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="px-4 py-2 bg-gradient-to-r from-[#35D07F] to-[#FCFF52] text-black font-semibold rounded-xl hover:from-[#2BB86F] hover:to-[#E6F52E] transition-all duration-300"
                    >
                      {account.displayName}
                    </button>
                  </div>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-[#35D07F] to-[#FCFF52] text-black font-semibold rounded-xl hover:from-[#2BB86F] hover:to-[#E6F52E] transition-all duration-300"
                >
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
