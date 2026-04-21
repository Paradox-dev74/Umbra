"use client";

import type { WalletClient, PublicClient } from "viem";
import { PermitUtils, setPermit, setActivePermitHash, ValidationUtils, permitStore } from "@cofhe/sdk/permits";

export interface IssuedAuditPermit {
  hash: string;
  recipient: `0x${string}`;
  expiration: number;
  name: string;
}

/** Issue a time-bound CoFHE sharing permit for auditor sealed-decrypt access */
export async function issueSharingAuditPermit(
  publicClient: PublicClient,
  walletClient: WalletClient,
  chainId: number,
  recipient: `0x${string}`,
  hours = 24
): Promise<IssuedAuditPermit> {
  if (!walletClient.account) {
    throw new Error("Wallet not connected");
  }

  const issuer = walletClient.account.address;
  const expiration = Math.floor(Date.now() / 1000) + hours * 3600;
  const name = `Umbra audit ${hours}h`;

  const signed = await PermitUtils.createSharingAndSign(
    {
      type: "sharing",
      issuer,
      recipient,
      name,
      expiration,
    },
    publicClient,
    walletClient
  );

  setPermit(chainId, issuer, signed);
  setActivePermitHash(chainId, issuer, signed.hash);

  return {
    hash: signed.hash,
    recipient,
    expiration,
    name,
  };
}

export function isPermitExpired(expiration: number): boolean {
  return expiration <= Math.floor(Date.now() / 1000);
}

export function formatPermitExpiry(expiration: number): string {
  const remaining = expiration - Math.floor(Date.now() / 1000);
  if (remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

export { ValidationUtils, PermitUtils, permitStore, setPermit };
