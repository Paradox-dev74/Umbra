/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Privara (ReineiraOS) Settlement Client
   ═══════════════════════════════════════════════════════════ */

import { ReineiraClient } from "@reineira-os/sdk";
import type { SettlementRequest, SettlementResult } from "./types";

let privateraInstance: ReineiraClient | null = null;

interface PrivaraConfig {
  apiKey: string;
  network: "testnet" | "mainnet";
}

export async function getPrivaraClient(
  config: PrivaraConfig
): Promise<ReineiraClient> {
  if (!privateraInstance) {
    privateraInstance = new ReineiraClient({
      apiKey: config.apiKey,
      network: config.network,
    });
  }
  return privateraInstance;
}

export async function executeInsurancePayout(
  client: ReineiraClient,
  request: SettlementRequest
): Promise<SettlementResult> {
  const result = await client.settlement.execute({
    referenceId: request.policyId,
    from: request.enterpriseAddress,
    to: request.beneficiaryAddress,
    encryptedAmount: request.encryptedCoverageAmount,
    metadata: {
      type: "parametric_insurance_payout",
      policyHash: request.policyReferenceHash,
      category: request.riskCategory,
    },
    confidential: true,
  });

  return {
    transactionHash: result.transactionHash,
    timestamp: result.timestamp,
    status: "completed",
    privacyNote:
      "Transfer amount and counterparties are confidential per Privara privacy guarantees",
  };
}

export async function checkSettlementStatus(
  client: ReineiraClient,
  policyId: string
): Promise<{ status: string; txHash?: string }> {
  const status = await client.settlement.getStatus(policyId);
  return {
    status: status.state,
    txHash: status.transactionHash,
  };
}
