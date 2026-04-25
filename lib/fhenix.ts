/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Fhenix FHE Client Integration
   Uses @cofhe/sdk CofheClient for FHE operations.
   In demo mode these functions are not called — mock
   decrypt delays are used instead.
   ═══════════════════════════════════════════════════════════ */

import type {
  CofheClient,
  EncryptedUint64Input,
  EncryptedUint32Input,
} from "@cofhe/sdk";
import { Encryptable } from "@cofhe/sdk";

let fhenixClientInstance: CofheClient | null = null;

export async function getFhenixClient(
  _provider?: unknown
): Promise<CofheClient> {
  if (!fhenixClientInstance) {
    throw new Error(
      "CofheClient must be initialised via @cofhe/react before use. " +
        "In demo mode this function should not be called."
    );
  }
  return fhenixClientInstance;
}

export function setFhenixClient(client: CofheClient): void {
  fhenixClientInstance = client;
}

export interface EncryptedPolicyInputs {
  encCoverage: EncryptedUint64Input;
  encThreshold: EncryptedUint32Input;
  encPremium: EncryptedUint32Input;
  encExpiry: EncryptedUint32Input;
}

export async function encryptPolicyTerms(
  client: CofheClient,
  params: {
    coverageAmountUsdc: bigint;
    triggerThreshold: number;
    premiumUsdc: number;
    expiryBlock: number;
  }
): Promise<EncryptedPolicyInputs> {
  const encrypted = await client
    .encryptInputs([
      Encryptable.uint64(params.coverageAmountUsdc),
      Encryptable.uint32(BigInt(params.triggerThreshold)),
      Encryptable.uint32(BigInt(params.premiumUsdc)),
      Encryptable.uint32(BigInt(params.expiryBlock)),
    ])
    .execute();

  return {
    encCoverage: encrypted[0] as EncryptedUint64Input,
    encThreshold: encrypted[1] as EncryptedUint32Input,
    encPremium: encrypted[2] as EncryptedUint32Input,
    encExpiry: encrypted[3] as EncryptedUint32Input,
  };
}
