/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Wagmi + RainbowKit Configuration
   Target: Ethereum Sepolia (CoFHE coprocessor live)
   ═══════════════════════════════════════════════════════════ */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "@/lib/constants";

export const wagmiConfig = getDefaultConfig({
  appName: "Umbra Protocol",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"
    ),
  },
  ssr: true,
});
