/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Fhenix FHE Client Integration
   ═══════════════════════════════════════════════════════════ */

import { BfheClient } from "@cofhe/sdk";

let fhenixClientInstance: BfheClient | null = null;

export async function getFhenixClient(provider: unknown): Promise<BfheClient> {
  if (!fhenixClientInstance) {
    fhenixClientInstance = new BfheClient(provider);
    await fhenixClientInstance.init();
  }
  return fhenixClientInstance;
}

export async function encryptCoverageAmount(
  client: BfheClient,
  amountUsdc: bigint
): Promise<{ encryptedInput: Uint8Array; hash: string }> {
  const encrypted = await client.encrypt_uint64(amountUsdc);
  return {
    encryptedInput: encrypted,
    hash: `enc_${amountUsdc.toString().slice(0, 4)}...`,
  };
}

export async function encryptThreshold(
  client: BfheClient,
  value: number
): Promise<{ encryptedInput: Uint8Array; hash: string }> {
  const encrypted = await client.encrypt_uint32(value);
  return {
    encryptedInput: encrypted,
    hash: `enc_${value.toString().slice(0, 3)}...`,
  };
}

export async function encryptPolicyTerms(
  client: BfheClient,
  params: {
    coverageAmountUsdc: bigint;
    triggerThreshold: number;
    premiumUsdc: number;
    expiryBlock: number;
  }
): Promise<{
  encCoverage: Uint8Array;
  encThreshold: Uint8Array;
  encPremium: Uint8Array;
  encExpiry: Uint8Array;
}> {
  const [encCoverage, encThreshold, encPremium, encExpiry] = await Promise.all([
    client.encrypt_uint64(params.coverageAmountUsdc),
    client.encrypt_uint32(params.triggerThreshold),
    client.encrypt_uint32(params.premiumUsdc),
    client.encrypt_uint32(params.expiryBlock),
  ]);

  return { encCoverage, encThreshold, encPremium, encExpiry };
}

export async function sealedDecryptParameter(
  client: BfheClient,
  contractAddress: string
): Promise<{ permit: unknown; publicKey: string }> {
  const permit = await client.generatePermit(contractAddress);
  return {
    permit,
    publicKey: (permit as { publicKey: string }).publicKey,
  };
}
