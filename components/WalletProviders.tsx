/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Client-only wallet + CoFHE providers
   Loaded dynamically after mount (browser APIs required).
   ═══════════════════════════════════════════════════════════ */

"use client";

import { ReactNode, useState } from "react";
import { WagmiProvider, usePublicClient, useWalletClient } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CofheProvider, createCofheConfig, useCofheAutoConnect } from "@cofhe/react";
import { chains } from "@cofhe/sdk/chains";
import { getWagmiConfig } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "sonner";

const cofheConfig = createCofheConfig({
  supportedChains: Object.values(chains),
});

function CofheAutoConnector() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  useCofheAutoConnect({ walletClient: walletClient ?? undefined, publicClient });
  return null;
}

export function WalletProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      })
  );
  const [wagmiConfig] = useState(() => getWagmiConfig());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CofheProvider config={cofheConfig}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#22D3EE",
              accentColorForeground: "#010409",
              borderRadius: "medium",
              overlayBlur: "small",
            })}
            modalSize="compact"
          >
            <CofheAutoConnector />
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#060B14",
                  border: "1px solid rgba(34,211,238,0.15)",
                  color: "#fff",
                },
              }}
            />
            {children}
          </RainbowKitProvider>
        </CofheProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
