/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Wagmi + RainbowKit Configuration
   ═══════════════════════════════════════════════════════════ */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { FHENIX_HELIUM_CHAIN } from "@/lib/constants";

export const wagmiConfig = getDefaultConfig({
  appName: "Umbra Protocol",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID",
  chains: [FHENIX_HELIUM_CHAIN],
  transports: {
    [FHENIX_HELIUM_CHAIN.id]: http(FHENIX_HELIUM_CHAIN.rpcUrls.default.http[0]),
  },
  ssr: true,
});
