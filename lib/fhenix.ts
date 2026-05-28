/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Fhenix FHE Client Integration
   ═══════════════════════════════════════════════════════════ */

import type { CofheClient, EncryptedUint64Input } from "@cofhe/sdk";
import { Encryptable, FheTypes } from "@cofhe/sdk";

let fhenixClientInstance: CofheClient | null = null;

export function getFhenixClientSync(): CofheClient | null {
  return fhenixClientInstance;
}

export async function getFhenixClient(): Promise<CofheClient> {
  if (!fhenixClientInstance) {
    throw new Error(
      "CofheClient must be initialised via @cofhe/react before use."
    );
  }
  return fhenixClientInstance;
}

export function setFhenixClient(client: CofheClient): void {
  fhenixClientInstance = client;
}

export interface EncryptedPolicyInputs {
  encCoverage: EncryptedUint64Input;
  encPremium: EncryptedUint64Input;
  encThreshold: EncryptedUint64Input;
  encDeductible?: EncryptedUint64Input;
  encCeiling?: EncryptedUint64Input;
}

export async function encryptPolicyTerms(
  client: CofheClient,
  params: {
    coverageAmountUsdc: bigint;
    premiumUsdc: bigint;
    triggerThreshold: bigint;
    ceilingThreshold?: bigint;
    deductibleUsdc?: bigint;
  }
): Promise<EncryptedPolicyInputs> {
  const inputs = [
    Encryptable.uint64(params.coverageAmountUsdc),
    Encryptable.uint64(params.premiumUsdc),
    Encryptable.uint64(params.triggerThreshold),
    Encryptable.uint64(params.ceilingThreshold ?? 0n),
  ];
  if (params.deductibleUsdc !== undefined) {
    inputs.push(Encryptable.uint64(params.deductibleUsdc));
  }

  const encrypted = await client.encryptInputs(inputs).execute();

  const result: EncryptedPolicyInputs = {
    encCoverage: encrypted[0] as EncryptedUint64Input,
    encPremium: encrypted[1] as EncryptedUint64Input,
    encThreshold: encrypted[2] as EncryptedUint64Input,
    encCeiling: encrypted[3] as EncryptedUint64Input,
  };
  if (params.deductibleUsdc !== undefined) {
    result.encDeductible = encrypted[4] as EncryptedUint64Input;
  }
  return result;
}

/** Encrypt oracle + threshold inputs for Privacy Lab — no cleartext comparison on client */
export async function encryptComparisonInputs(
  client: CofheClient,
  oracleValue: bigint,
  thresholdValue: bigint
): Promise<{
  oracleCt: EncryptedUint64Input;
  thresholdCt: EncryptedUint64Input;
  oracleHash: string;
  thresholdHash: string;
}> {
  const encrypted = await client
    .encryptInputs([
      Encryptable.uint64(oracleValue),
      Encryptable.uint64(thresholdValue),
    ])
    .execute();
  const oracleCt = encrypted[0] as EncryptedUint64Input;
  const thresholdCt = encrypted[1] as EncryptedUint64Input;
  return {
    oracleCt,
    thresholdCt,
    oracleHash: String((oracleCt as { ctHash?: bigint }).ctHash ?? ""),
    thresholdHash: String((thresholdCt as { ctHash?: bigint }).ctHash ?? ""),
  };
}

export async function decryptHandle(
  client: CofheClient,
  ctHash: `0x${string}`
): Promise<bigint> {
  const result = await client
    .decryptForView(ctHash, FheTypes.Uint64)
    .execute();
  return result as bigint;
}

export async function decryptBoolHandle(
  client: CofheClient,
  ctHash: `0x${string}`
): Promise<boolean> {
  const result = await client
    .decryptForView(ctHash, FheTypes.Bool)
    .execute();
  return Boolean(result);
}

/** Verifiable decrypt signature for on-chain tx submission */
export async function decryptHandleForTx(
  client: CofheClient,
  ctHash: `0x${string}`
): Promise<{ value: bigint; signature: `0x${string}` }> {
  const result = await client
    .decryptForTx(ctHash)
    .withoutPermit()
    .execute();
  return {
    value: (result as { decryptedValue: bigint }).decryptedValue,
    signature: (result as { signature: `0x${string}` }).signature,
  };
}

export type InEuint64Tuple = {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: `0x${string}`;
};

export function asInEuint64(input: EncryptedUint64Input): InEuint64Tuple {
  return input as InEuint64Tuple;
}

export function escrowIdToBytes32(escrowId: bigint): `0x${string}` {
  const hex = escrowId.toString(16).padStart(64, "0");
  return `0x${hex}` as `0x${string}`;
}

export function txHashToBytes32(txHash: string): `0x${string}` {
  const normalized = txHash.startsWith("0x") ? txHash.slice(2) : txHash;
  return `0x${normalized.padStart(64, "0").slice(0, 64)}` as `0x${string}`;
}
