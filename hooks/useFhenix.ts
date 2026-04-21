/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Fhenix FHE Encryption Hook
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback, useRef } from "react";
import { getFhenixClient, encryptPolicyTerms } from "@/lib/fhenix";
import type { BfheClient } from "@cofhe/sdk";

interface EncryptionState {
  isEncrypting: boolean;
  isInitializing: boolean;
  error: string | null;
  clientReady: boolean;
}

interface PolicyEncryptionParams {
  coverageAmountUsdc: bigint;
  triggerThreshold: number;
  premiumUsdc: number;
  expiryBlock: number;
}

interface EncryptedPolicyTerms {
  encCoverage: Uint8Array;
  encThreshold: Uint8Array;
  encPremium: Uint8Array;
  encExpiry: Uint8Array;
}

export function useFhenix() {
  const [state, setState] = useState<EncryptionState>({
    isEncrypting: false,
    isInitializing: false,
    error: null,
    clientReady: false,
  });

  const clientRef = useRef<BfheClient | null>(null);

  const initializeClient = useCallback(async (provider?: unknown) => {
    setState((prev) => ({ ...prev, isInitializing: true, error: null }));
    try {
      const client = await getFhenixClient(provider);
      clientRef.current = client;
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        clientReady: true,
      }));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to initialize Fhenix";
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: message,
      }));
    }
  }, []);

  const encryptPolicy = useCallback(
    async (
      params: PolicyEncryptionParams
    ): Promise<EncryptedPolicyTerms> => {
      if (!clientRef.current) {
        await initializeClient();
      }
      setState((prev) => ({ ...prev, isEncrypting: true, error: null }));
      try {
        const result = await encryptPolicyTerms(clientRef.current!, params);
        setState((prev) => ({ ...prev, isEncrypting: false }));
        return result;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Encryption failed";
        setState((prev) => ({
          ...prev,
          isEncrypting: false,
          error: message,
        }));
        throw e;
      }
    },
    [initializeClient]
  );

  return {
    ...state,
    initializeClient,
    encryptPolicy,
  };
}
