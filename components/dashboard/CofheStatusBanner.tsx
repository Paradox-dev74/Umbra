/* ═══════════════════════════════════════════════════════════
   CoFHE connection status banner for dashboard
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useAccount, useChainId } from "wagmi";
import { useFhenix } from "@/hooks/useFhenix";
import { sepolia } from "@/lib/constants";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CofheStatusBanner({ className }: { className?: string }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { clientReady, isConnecting, error } = useFhenix();

  const wrongNetwork = isConnected && chainId !== sepolia.id;

  if (!isConnected) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02]",
          className
        )}
      >
        <Shield className="w-4 h-4 text-umbra-muted shrink-0" />
        <p className="text-sm text-umbra-muted">
          Connect your wallet on <span className="text-white">Ethereum Sepolia</span> to enable CoFHE encryption and sealed decryption.
        </p>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border border-umbra-warning/30 bg-umbra-warning/5",
          className
        )}
      >
        <AlertTriangle className="w-4 h-4 text-umbra-warning shrink-0" />
        <p className="text-sm text-umbra-warning">
          Switch to Ethereum Sepolia — CoFHE coprocessor is live on Sepolia only.
        </p>
      </div>
    );
  }

  if (isConnecting || !clientReady) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border border-umbra-blue/20 bg-umbra-blue/5",
          className
        )}
      >
        <Loader2 className="w-4 h-4 text-umbra-blue animate-spin shrink-0" />
        <p className="text-sm text-umbra-blue">
          Connecting to CoFHE Threshold Network…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/5",
          className
        )}
      >
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        <p className="text-sm text-red-400">CoFHE error: {error}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border border-umbra-success/20 bg-umbra-success/5",
        className
      )}
    >
      <Shield className="w-4 h-4 text-umbra-success shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-umbra-success font-medium">CoFHE Ready</p>
        <p className="text-xs text-umbra-muted truncate">
          FHE encrypt · homomorphic compare · sealed decrypt via @cofhe/sdk
        </p>
      </div>
      <span className="w-2 h-2 rounded-full bg-umbra-success animate-pulse shrink-0" />
    </div>
  );
}
