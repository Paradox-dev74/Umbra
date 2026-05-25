/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Wagmi + RainbowKit Configuration
   Target: Ethereum Sepolia (CoFHE coprocessor live)
   Lazy init avoids WalletConnect/indexedDB during SSR.
   ═══════════════════════════════════════════════════════════ */

import type { Config } from "wagmi";

let wagmiConfig: Config | undefined;

export function getWagmiConfig(): Config {
  if (wagmiConfig) return wagmiConfig;

  if (typeof window === "undefined") {
    throw new Error("getWagmiConfig() must only be called in the browser");
  }

  const { getDefaultConfig } = require("@rainbow-me/rainbowkit") as typeof import("@rainbow-me/rainbowkit");
  const { http } = require("wagmi") as typeof import("wagmi");
  const { sepolia } = require("@/lib/constants") as typeof import("@/lib/constants");

  wagmiConfig = getDefaultConfig({
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

  return wagmiConfig;
}
