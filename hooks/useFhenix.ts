/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Fhenix FHE Encryption Hook
   Uses @cofhe/react hooks — client is managed by CofheProvider.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback } from "react";
import { useCofheClient } from "@cofhe/react";
import {
  encryptPolicyTerms,
  decryptHandle,
  decryptBoolHandle,
  setFhenixClient,
} from "@/lib/fhenix";
import type { EncryptedPolicyInputs } from "@/lib/fhenix";

interface PolicyEncryptionParams {
  coverageAmountUsdc: bigint;
  premiumUsdc: bigint;
  triggerThreshold: bigint;
}

export function useFhenix() {
  const client = useCofheClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync the global singleton so non-hook code can access the client
  if (client) setFhenixClient(client);

  const encryptPolicy = useCallback(
    async (params: PolicyEncryptionParams): Promise<EncryptedPolicyInputs> => {
      if (!client) throw new Error("CoFHE client not ready");
      setIsEncrypting(true);
      setError(null);
      try {
        const result = await encryptPolicyTerms(client, params);
        return result;
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Encryption failed";
        setError(message);
        throw e;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  const decryptValue = useCallback(
    async (ctHash: `0x${string}`): Promise<bigint> => {
      if (!client) throw new Error("CoFHE client not ready");
      return decryptHandle(client, ctHash);
    },
    [client]
  );

  const decryptBool = useCallback(
    async (ctHash: `0x${string}`): Promise<boolean> => {
      if (!client) throw new Error("CoFHE client not ready");
      return decryptBoolHandle(client, ctHash);
    },
    [client]
  );

  return {
    clientReady: !!client,
    isConnecting: !client,
    isEncrypting,
    error,
    encryptPolicy,
    decryptValue,
    decryptBool,
  };
}

