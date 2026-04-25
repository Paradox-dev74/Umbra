/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Fhenix FHE Encryption Hook
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback, useRef } from "react";
import {
  getFhenixClient,
  setFhenixClient,
  encryptPolicyTerms,
} from "@/lib/fhenix";
import type { EncryptedPolicyInputs } from "@/lib/fhenix";
import type { CofheClient } from "@cofhe/sdk";

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

export function useFhenix() {
  const [state, setState] = useState<EncryptionState>({
    isEncrypting: false,
    isInitializing: false,
    error: null,
    clientReady: false,
  });

  const clientRef = useRef<CofheClient | null>(null);

  const initializeClient = useCallback(async (client?: CofheClient) => {
    setState((prev) => ({ ...prev, isInitializing: true, error: null }));
    try {
      if (client) {
        setFhenixClient(client);
        clientRef.current = client;
      } else {
        clientRef.current = await getFhenixClient();
      }
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
    ): Promise<EncryptedPolicyInputs> => {
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
