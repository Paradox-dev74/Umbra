/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Smart Contract Interaction Hook
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback } from "react";
import { UMBRA_CONTRACT_ADDRESS, DEMO_POLICIES } from "@/lib/constants";
import type { Policy, RiskCategory } from "@/lib/types";
import { sleep } from "@/lib/utils";

interface ContractState {
  isLoading: boolean;
  isWriting: boolean;
  error: string | null;
}

export function useUmbraContract() {
  const [state, setState] = useState<ContractState>({
    isLoading: false,
    isWriting: false,
    error: null,
  });

  const getPolicies = useCallback(async (): Promise<typeof DEMO_POLICIES> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await sleep(800);
      setState((prev) => ({ ...prev, isLoading: false }));
      return DEMO_POLICIES;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch policies";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw e;
    }
  }, []);

  const getPolicy = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await sleep(600);
      const policy = DEMO_POLICIES.find((p) => Number(p.id) === id);
      setState((prev) => ({ ...prev, isLoading: false }));
      return policy ?? null;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch policy";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw e;
    }
  }, []);

  const createPolicy = useCallback(
    async (params: {
      beneficiary: string;
      encCoverage: Uint8Array;
      encThreshold: Uint8Array;
      encPremium: Uint8Array;
      encExpiry: Uint8Array;
      category: number;
      oracleFeed: string;
      policyRefHash: `0x${string}`;
    }): Promise<{ policyId: number; txHash: string }> => {
      setState((prev) => ({ ...prev, isWriting: true, error: null }));
      try {
        await sleep(2000);
        const newId = DEMO_POLICIES.length + 1;
        setState((prev) => ({ ...prev, isWriting: false }));
        return {
          policyId: newId,
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Transaction failed";
        setState((prev) => ({ ...prev, isWriting: false, error: message }));
        throw e;
      }
    },
    []
  );

  const resolveWithOracle = useCallback(
    async (policyId: number, oracleValue: number): Promise<{ txHash: string }> => {
      setState((prev) => ({ ...prev, isWriting: true, error: null }));
      try {
        await sleep(3000);
        setState((prev) => ({ ...prev, isWriting: false }));
        return {
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Oracle resolve failed";
        setState((prev) => ({ ...prev, isWriting: false, error: message }));
        throw e;
      }
    },
    []
  );

  const markSettled = useCallback(async (policyId: number): Promise<{ txHash: string }> => {
    setState((prev) => ({ ...prev, isWriting: true, error: null }));
    try {
      await sleep(1500);
      setState((prev) => ({ ...prev, isWriting: false }));
      return {
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Settlement marking failed";
      setState((prev) => ({ ...prev, isWriting: false, error: message }));
      throw e;
    }
  }, []);

  return {
    ...state,
    contractAddress: UMBRA_CONTRACT_ADDRESS,
    getPolicies,
    getPolicy,
    createPolicy,
    resolveWithOracle,
    markSettled,
  };
}
