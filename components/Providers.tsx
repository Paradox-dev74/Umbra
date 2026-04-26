/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Root Providers
   Wagmi + RainbowKit + React Query + CoFHE (Fhenix FHE)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { ReactNode, useState } from "react";
import { WagmiProvider, usePublicClient, useWalletClient } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { CofheProvider, createCofheConfig, useCofheAutoConnect } from "@cofhe/react";
import { chains } from "@cofhe/sdk/chains";

import "@rainbow-me/rainbowkit/styles.css";

// CoFHE config — Ethereum Sepolia supported
// chains is a keyed object; createCofheConfig needs an array
const cofheConfig = createCofheConfig({
  supportedChains: Object.values(chains),
});

/** Sits inside WagmiProvider so it can read wallet/public clients */
function CofheAutoConnector() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  useCofheAutoConnect({ walletClient: walletClient ?? undefined, publicClient });
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CofheProvider config={cofheConfig}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#3B82F6",
              accentColorForeground: "white",
              borderRadius: "medium",
              overlayBlur: "small",
            })}
            modalSize="compact"
          >
            <CofheAutoConnector />
            {children}
          </RainbowKitProvider>
        </CofheProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
