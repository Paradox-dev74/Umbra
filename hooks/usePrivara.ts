/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Privara Settlement Hook
   Uses wagmi walletClient → walletClientToSigner for ReineiraSDK
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { getPrivaraClient, executeInsurancePayout } from "@/lib/privara";
import type { SettlementRequest, SettlementResult } from "@/lib/types";

interface PrivaraState {
  isSettling: boolean;
  error: string | null;
  lastSettlement: SettlementResult | null;
}

export function usePrivara() {
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<PrivaraState>({
    isSettling: false,
    error: null,
    lastSettlement: null,
  });

  const settlePolicy = useCallback(
    async (request: SettlementRequest): Promise<SettlementResult> => {
      setState((prev) => ({ ...prev, isSettling: true, error: null }));
      try {
        const client = await getPrivaraClient({ walletClient: walletClient ?? undefined });
        const result = await executeInsurancePayout(client, request);
        setState((prev) => ({
          ...prev,
          isSettling: false,
          lastSettlement: result,
        }));
        return result;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Settlement failed";
        setState((prev) => ({
          ...prev,
          isSettling: false,
          error: message,
        }));
        throw e;
      }
    },
    [walletClient]
  );

  return { ...state, settlePolicy };
}

