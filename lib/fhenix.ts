/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Fhenix FHE Client Integration
   Uses @cofhe/sdk CofheClient for FHE operations.
   All three policy terms (coverage, premium, threshold) are
   encrypted as uint64 to match InEuint64 in the contract.
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
}

/**
 * Encrypt all three policy financial terms as uint64 (matching InEuint64 contract params).
 * All values are in base-unit integers (e.g. USDC with 6 decimals → multiply by 1e6 before call).
 */
export async function encryptPolicyTerms(
  client: CofheClient,
  params: {
    coverageAmountUsdc: bigint;
    premiumUsdc: bigint;
    triggerThreshold: bigint;
  }
): Promise<EncryptedPolicyInputs> {
  const encrypted = await client
    .encryptInputs([
      Encryptable.uint64(params.coverageAmountUsdc),
      Encryptable.uint64(params.premiumUsdc),
      Encryptable.uint64(params.triggerThreshold),
    ])
    .execute();

  return {
    encCoverage:   encrypted[0] as EncryptedUint64Input,
    encPremium:    encrypted[1] as EncryptedUint64Input,
    encThreshold:  encrypted[2] as EncryptedUint64Input,
  };
}

/**
 * Request sealed decryption of a euint64 ciphertext handle via the CoFHE Threshold Network.
 * The caller must hold an ACL permit (FHE.allow was called for their address).
 * Returns the decrypted BigInt value.
 */
export async function decryptHandle(
  client: CofheClient,
  ctHash: `0x${string}`
): Promise<bigint> {
  const result = await client
    .decryptForView(ctHash, FheTypes.Uint64)
    .execute();
  return result as bigint;
}

/**
 * Request sealed decryption of an ebool ciphertext handle.
 * Used to reveal trigger results after oracle resolution.
 */
export async function decryptBoolHandle(
  client: CofheClient,
  ctHash: `0x${string}`
): Promise<boolean> {
  const result = await client
    .decryptForView(ctHash, FheTypes.Bool)
    .execute();
  return Boolean(result);
}

