"use client";

// @ts-expect-error TypeScript cannot resolve types for CSS side-effect import; handled by bundler
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

// Utility function to add Celo Sepolia network to MetaMask
export const addCeloSepoliaNetwork = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xAA044C", // 11142220 in hex
            chainName: "Celo Sepolia",
            nativeCurrency: {
              name: "CELO",
              symbol: "CELO",
              decimals: 18,
            },
            rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org"],
            blockExplorerUrls: ["https://celo-sepolia.blockscout.com"],
          },
        ],
      });
    } catch (error) {
      console.error("Failed to add Celo Sepolia network:", error);
    }
  }
};

const celoSepolia = {
  id: 11142220,
  name: "Celo Sepolia",
  network: "celo-sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
    public: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Explorer",
      url: "https://celo-sepolia.blockscout.com",
    },
  },
  testnet: true,
} as const;

const {
  chains,
  publicClient: wagmiPublicClient,
  webSocketPublicClient,
} = configureChains(
  [celoSepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === celoSepolia.id) {
          return { http: chain.rpcUrls.default.http[0] };
        }
        return null;
      },
    }),
  ]
);

// Configure wallets with proper Celo support
const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

let connectors;
if (wcProjectId) {
  // Full wallet list (includes WalletConnect-powered options)
  const conf = getDefaultWallets({
    appName: "PulseAid",
    projectId: wcProjectId,
    chains,
  });
  connectors = conf.connectors;
} else {
  // Safe fallback: only Injected wallet without WalletConnect features
  console.warn(
    "WalletConnect projectId missing: set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable wallet listings. Falling back to Injected wallet only."
  );
  connectors = connectorsForWallets([
    {
      groupName: "Recommended",
      wallets: [injectedWallet({ chains })],
    },
  ]);
}

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient: wagmiPublicClient,
  webSocketPublicClient,
});

export default function Web3Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
}
