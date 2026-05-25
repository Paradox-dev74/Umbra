"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { UmbraLogo } from "@/components/ui/UmbraLogo";

type WalletProvidersComponent = typeof import("./WalletProviders").WalletProviders;

export function Providers({ children }: { children: ReactNode }) {
  const [WalletProviders, setWalletProviders] = useState<WalletProvidersComponent | null>(null);

  useEffect(() => {
    void import("./WalletProviders").then((mod) => {
      setWalletProviders(() => mod.WalletProviders);
    });
  }, []);

  if (!WalletProviders) {
    return (
      <div className="relative min-h-screen bg-umbra-bg text-white flex flex-col items-center justify-center overflow-hidden">
        <MeshBackground intensity="strong" hex />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <UmbraLogo size={48} />
          </motion.div>
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-white/90">Initializing Umbra</p>
            <p className="text-xs text-umbra-muted">Loading CoFHE · Wallet · Privacy layer</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-umbra-cyan"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return <WalletProviders>{children}</WalletProviders>;
}
