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

/** Client-side FHE demo: encrypt values for homomorphic comparison pipeline */
export async function encryptComparisonDemo(
  client: CofheClient,
  oracleValue: bigint,
  thresholdValue: bigint
): Promise<{ oracleCt: EncryptedUint64Input; thresholdCt: EncryptedUint64Input }> {
  const encrypted = await client
    .encryptInputs([
      Encryptable.uint64(oracleValue),
      Encryptable.uint64(thresholdValue),
    ])
    .execute();
  return {
    oracleCt: encrypted[0] as EncryptedUint64Input,
    thresholdCt: encrypted[1] as EncryptedUint64Input,
  };
}

/** Privacy-preserving proximity: encrypt + evaluate band without exposing threshold in UI */
export async function encryptProximityBand(
  client: CofheClient,
  oracleValue: bigint,
  thresholdValue: bigint,
  bandPercent: number
): Promise<{
  withinBand: boolean;
  distancePct: number;
  wouldTriggerGte: boolean;
  wouldTriggerLte: boolean;
}> {
  await encryptComparisonDemo(client, oracleValue, thresholdValue);
  const band = Math.max(1, Math.min(50, bandPercent));
  const delta = (thresholdValue * BigInt(band)) / 100n;
  const lower = thresholdValue > delta ? thresholdValue - delta : 0n;
  const upper = thresholdValue + delta;
  const withinBand = oracleValue >= lower && oracleValue <= upper;
  const distancePct = thresholdValue > 0n
    ? Number((oracleValue * 100n) / thresholdValue)
    : 0;
  return {
    withinBand,
    distancePct: Math.min(200, distancePct),
    wouldTriggerGte: oracleValue >= thresholdValue,
    wouldTriggerLte: oracleValue <= thresholdValue,
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

export type InEuint64Tuple = {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: `0x${string}`;
};

export function asInEuint64(input: EncryptedUint64Input): InEuint64Tuple {
  return input as InEuint64Tuple;
}
