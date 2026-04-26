/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Privara (ReineiraOS) Settlement Client
   Uses @reineira-os/sdk ReineiraSDK with wagmi wallet integration.
   ═══════════════════════════════════════════════════════════ */

import { ReineiraSDK } from "@reineira-os/sdk";
import type { SettlementRequest, SettlementResult } from "./types";

interface PrivaraClientConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient?: any;
}

let privaraInstance: ReineiraSDK | null = null;
let lastWalletClient: unknown;

export async function getPrivaraClient(
  config: PrivaraClientConfig
): Promise<ReineiraSDK> {
  // Re-initialise if walletClient changed (e.g. account switch)
  if (privaraInstance && config.walletClient === lastWalletClient) {
    return privaraInstance;
  }

  let sdk: ReineiraSDK;

  if (config.walletClient) {
    // Dynamically import to avoid SSR issues
    const { walletClientToSigner } = await import("@reineira-os/sdk");
    // walletClientToSigner may be async depending on SDK version
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signerOrPromise = walletClientToSigner(config.walletClient as any);
    const signer = signerOrPromise instanceof Promise ? await signerOrPromise : signerOrPromise;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sdk = ReineiraSDK.create({ network: "testnet", signer } as any);
  } else {
    throw new Error("Privara: walletClient required — connect your wallet first.");
  }

  await sdk.initialize();
  privaraInstance = sdk;
  lastWalletClient = config.walletClient;
  return sdk;
}

export async function executeInsurancePayout(
  sdk: ReineiraSDK,
  request: SettlementRequest
): Promise<SettlementResult> {
  const escrow = await sdk.escrow.create({
    amount: sdk.usdc(request.encryptedCoverageAmount),
    owner: request.beneficiaryAddress,
  });

  await escrow.fund(sdk.usdc(request.encryptedCoverageAmount), { autoApprove: true });

  return {
    transactionHash: escrow.createTx?.hash ?? "",
    timestamp: Date.now(),
    status: "completed",
    privacyNote:
      "Transfer amount and counterparties are confidential per Privara privacy guarantees",
  };
}

