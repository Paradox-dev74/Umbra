"use client";

import { useState, useCallback } from "react";
import { useCofheClient } from "@cofhe/react";
import {
  encryptPolicyTerms,
  encryptComparisonInputs,
  setFhenixClient,
} from "@/lib/fhenix";
import type { EncryptedPolicyInputs } from "@/lib/fhenix";
import {
  decryptFieldForView,
  decryptPayoutForSettlementTx,
  AclDecryptError,
  type DecryptIntent,
} from "@/lib/acl-decrypt";
import type { AclRole, EncryptedField } from "@/lib/acl-policy";
import { getAccessExplanation } from "@/lib/acl-policy";

interface PolicyEncryptionParams {
  coverageAmountUsdc: bigint;
  premiumUsdc: bigint;
  triggerThreshold: bigint;
  ceilingThreshold?: bigint;
  deductibleUsdc?: bigint;
}

export function useFhenix() {
  const client = useCofheClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (client) setFhenixClient(client);

  const encryptPolicy = useCallback(
    async (params: PolicyEncryptionParams): Promise<EncryptedPolicyInputs> => {
      if (!client) throw new Error("CoFHE client not ready");
      setIsEncrypting(true);
      setError(null);
      try {
        return await encryptPolicyTerms(client, params);
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

  const decryptForView = useCallback(
    async (
      role: AclRole,
      policyStatus: number,
      field: EncryptedField,
      ctHash: `0x${string}`,
      valueType: "uint64" | "bool" = "uint64"
    ) => {
      if (!client) throw new Error("CoFHE client not ready");
      return decryptFieldForView(client, role, policyStatus, field, ctHash, valueType);
    },
    [client]
  );

  const decryptPayoutForSettlement = useCallback(
    async (role: AclRole, policyStatus: number, payoutHandle: `0x${string}`) => {
      if (!client) throw new Error("CoFHE client not ready");
      return decryptPayoutForSettlementTx(client, role, policyStatus, payoutHandle);
    },
    [client]
  );

  const explainAccess = useCallback(
    (role: AclRole, policyStatus: number, field: EncryptedField, path: "view" | "tx") =>
      getAccessExplanation(role, policyStatus, field, path),
    []
  );

  const encryptComparison = useCallback(
    async (oracleValue: bigint, thresholdValue: bigint) => {
      if (!client) throw new Error("CoFHE client not ready");
      return encryptComparisonInputs(client, oracleValue, thresholdValue);
    },
    [client]
  );

  /** @deprecated Prefer decryptForView with explicit field/role/status */
  const decryptValue = useCallback(
    async (ctHash: `0x${string}`): Promise<bigint> => {
      if (!client) throw new Error("CoFHE client not ready");
      const { decryptHandle } = await import("@/lib/fhenix");
      return decryptHandle(client, ctHash);
    },
    [client]
  );

  const decryptBool = useCallback(
    async (ctHash: `0x${string}`): Promise<boolean> => {
      if (!client) throw new Error("CoFHE client not ready");
      const { decryptBoolHandle } = await import("@/lib/fhenix");
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
    decryptForView,
    decryptPayoutForSettlement,
    explainAccess,
    encryptComparison,
    decryptValue,
    decryptBool,
    AclDecryptError,
  };
}

export type { DecryptIntent, AclRole, EncryptedField, AclDecryptError };
