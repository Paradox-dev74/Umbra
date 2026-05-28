"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import {
  getPrivaraClient,
  executeInsurancePayout,
  pollEscrowStatus,
  type SettlementProgress,
} from "@/lib/privara";
import type { SettlementRequest, SettlementResult } from "@/lib/types";

interface PrivaraState {
  isSettling: boolean;
  error: string | null;
  lastSettlement: (SettlementResult & { escrowId?: bigint; escrowIdBytes32?: `0x${string}` }) | null;
  progress: SettlementProgress | null;
}

export function usePrivara() {
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<PrivaraState>({
    isSettling: false,
    error: null,
    lastSettlement: null,
    progress: null,
  });

  const onProgress = useCallback((progress: SettlementProgress) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const settlePolicy = useCallback(
    async (
      request: SettlementRequest
    ): Promise<SettlementResult & { escrowId: bigint; escrowIdBytes32: `0x${string}` }> => {
      setState((prev) => ({ ...prev, isSettling: true, error: null, progress: { stage: "idle" } }));
      try {
        const client = await getPrivaraClient({ walletClient: walletClient ?? undefined, onProgress });
        const result = await executeInsurancePayout(client, request, onProgress);
        setState((prev) => ({
          ...prev,
          isSettling: false,
          lastSettlement: result,
          progress: { stage: "complete", ...result },
        }));
        return result;
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Settlement failed";
        setState((prev) => ({
          ...prev,
          isSettling: false,
          error: message,
          progress: { stage: "failed", error: message },
        }));
        throw e;
      }
    },
    [walletClient, onProgress]
  );

  const checkEscrow = useCallback(
    async (escrowId: bigint) => {
      const client = await getPrivaraClient({ walletClient: walletClient ?? undefined });
      return pollEscrowStatus(client, escrowId);
    },
    [walletClient]
  );

  return { ...state, settlePolicy, checkEscrow };
}
