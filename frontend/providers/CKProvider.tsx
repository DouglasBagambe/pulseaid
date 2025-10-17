"use client";
import React from "react";
import { ContractKitProvider, Alfajores } from "@celo-tools/use-contractkit";
import "@celo-tools/use-contractkit/lib/styles.css";

export default function CKProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContractKitProvider
      dapp={{ name: "PulseAid", description: "Web3 crowdfunding" }}
      network={Alfajores}
      connectModal={{}}
    >
      {children}
    </ContractKitProvider>
  );
}
