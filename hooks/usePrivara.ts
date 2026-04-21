/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Privara Settlement Hook
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback } from "react";
import { getPrivaraClient, executeInsurancePayout } from "@/lib/privara";
import type { SettlementRequest, SettlementResult } from "@/lib/types";

interface PrivaraState {
  isSettling: boolean;
  error: string | null;
  lastSettlement: SettlementResult | null;
}

export function usePrivara() {
  const [state, setState] = useState<PrivaraState>({
    isSettling: false,
    error: null,
    lastSettlement: null,
  });

  const settlePolicy = useCallback(
    async (request: SettlementRequest): Promise<SettlementResult> => {
      setState((prev) => ({ ...prev, isSettling: true, error: null }));
      try {
        const client = await getPrivaraClient({
          apiKey: process.env.NEXT_PUBLIC_PRIVARA_API_KEY ?? "",
          network: "testnet",
        });
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
    []
  );

  return { ...state, settlePolicy };
}
