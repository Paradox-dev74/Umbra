/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Privara (ReineiraOS) Settlement Client
   Uses @reineira-os/sdk ReineiraSDK for confidential payouts.
   In demo mode these functions are not called.
   ═══════════════════════════════════════════════════════════ */

import { ReineiraSDK, type SDKConfig } from "@reineira-os/sdk";
import type { SettlementRequest, SettlementResult } from "./types";

let privaraInstance: ReineiraSDK | null = null;

export async function getPrivaraClient(
  config: SDKConfig
): Promise<ReineiraSDK> {
  if (!privaraInstance) {
    privaraInstance = ReineiraSDK.create(config);
    await privaraInstance.initialize();
  }
  return privaraInstance;
}

export async function executeInsurancePayout(
  sdk: ReineiraSDK,
  request: SettlementRequest
): Promise<SettlementResult> {
  const escrow = await sdk.escrow.create({
    amount: sdk.usdc(request.encryptedCoverageAmount),
    owner: request.beneficiaryAddress,
  });

  return {
    transactionHash: escrow.createTx?.hash ?? "",
    timestamp: Date.now(),
    status: "completed",
    privacyNote:
      "Transfer amount and counterparties are confidential per Privara privacy guarantees",
  };
}
