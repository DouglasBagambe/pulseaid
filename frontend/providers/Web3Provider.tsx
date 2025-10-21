"use client";

// @ts-expect-error TypeScript cannot resolve types for CSS side-effect import; handled by bundler
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { 
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  trustWallet,
  rainbowWallet
} from "@rainbow-me/rainbowkit/wallets";
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

// Configure wallets with mobile-first approach
const connectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId: wcProjectId || "dummy", chains }),
      ...(wcProjectId ? [walletConnectWallet({ projectId: wcProjectId, chains })] : []),
      coinbaseWallet({ appName: "PulseAid", chains }),
      trustWallet({ projectId: wcProjectId || "dummy", chains }),
      rainbowWallet({ projectId: wcProjectId || "dummy", chains }),
    ],
  },
]);

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
      <RainbowKitProvider 
        chains={chains}
        modalSize="compact"
        showRecentTransactions={true}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
