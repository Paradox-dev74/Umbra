/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Privara (ReineiraOS) Settlement Client
   Full escrow lifecycle: create → fund → poll → redeem
   ═══════════════════════════════════════════════════════════ */

import { ReineiraSDK } from "@reineira-os/sdk";
import { escrowIdToBytes32, txHashToBytes32 } from "@/lib/fhenix";
import type { SettlementRequest, SettlementResult } from "./types";

export type EscrowStage =
  | "idle"
  | "creating"
  | "funding"
  | "waiting-funded"
  | "waiting-redeemable"
  | "redeeming"
  | "complete"
  | "failed";

export interface SettlementProgress {
  stage: EscrowStage;
  escrowId?: bigint;
  escrowIdBytes32?: `0x${string}`;
  createTxHash?: string;
  fundTxHash?: string;
  redeemTxHash?: string;
  isFunded?: boolean;
  isRedeemable?: boolean;
  error?: string;
}

interface PrivaraClientConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient?: any;
  onProgress?: (progress: SettlementProgress) => void;
}

let privaraInstance: ReineiraSDK | null = null;
let lastWalletClient: unknown;

export async function getPrivaraClient(
  config: PrivaraClientConfig
): Promise<ReineiraSDK> {
  if (privaraInstance && config.walletClient === lastWalletClient) {
    return privaraInstance;
  }

  if (!config.walletClient) {
    throw new Error("Privara: walletClient required — connect your wallet first.");
  }

  const { walletClientToSigner } = await import("@reineira-os/sdk");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signerOrPromise = walletClientToSigner(config.walletClient as any);
  const signer =
    signerOrPromise instanceof Promise ? await signerOrPromise : signerOrPromise;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdk = ReineiraSDK.create({ network: "testnet", signer } as any);

  await sdk.initialize();
  privaraInstance = sdk;
  lastWalletClient = config.walletClient;
  return sdk;
}

function emit(onProgress: PrivaraClientConfig["onProgress"], progress: SettlementProgress) {
  onProgress?.(progress);
}

export async function executeInsurancePayout(
  sdk: ReineiraSDK,
  request: SettlementRequest,
  onProgress?: (progress: SettlementProgress) => void
): Promise<SettlementResult & { escrowId: bigint; escrowIdBytes32: `0x${string}` }> {
  emit(onProgress, { stage: "creating" });

  const escrow = await sdk.escrow.create({
    amount: sdk.usdc(request.encryptedCoverageAmount),
    owner: request.beneficiaryAddress,
  });

  const escrowId = escrow.id as bigint;
  const escrowIdBytes32 = escrowIdToBytes32(escrowId);
  const createTxHash = escrow.createTx?.hash ?? "";

  emit(onProgress, {
    stage: "funding",
    escrowId,
    escrowIdBytes32,
    createTxHash,
  });

  const fundResult = await escrow.fund(sdk.usdc(request.encryptedCoverageAmount), {
    autoApprove: true,
  });

  emit(onProgress, {
    stage: "waiting-funded",
    escrowId,
    escrowIdBytes32,
    createTxHash,
    fundTxHash: fundResult?.tx?.hash,
  });

  try {
    await escrow.waitForFunded(600_000);
  } catch {
    const funded = await escrow.isFunded();
    if (!funded) {
      throw new Error("Escrow funding did not complete within timeout");
    }
  }

  emit(onProgress, {
    stage: "waiting-redeemable",
    escrowId,
    escrowIdBytes32,
    createTxHash,
    isFunded: true,
  });

  try {
    await escrow.waitForRedeemable({ pollIntervalMs: 5000, timeoutMs: 300_000 });
  } catch {
    const redeemable = await escrow.isRedeemable();
    if (!redeemable) {
      throw new Error("Escrow not yet redeemable — condition may be pending");
    }
  }

  emit(onProgress, {
    stage: "redeeming",
    escrowId,
    escrowIdBytes32,
    isFunded: true,
    isRedeemable: true,
  });

  const redeemResult = await escrow.redeem();

  const redeemTxHash = redeemResult.hash ?? createTxHash;

  emit(onProgress, {
    stage: "complete",
    escrowId,
    escrowIdBytes32,
    createTxHash,
    redeemTxHash,
    isFunded: true,
    isRedeemable: true,
  });

  return {
    transactionHash: redeemTxHash,
    timestamp: Date.now(),
    status: "completed",
    privacyNote:
      "Settlement routed via Privara/ReineiraOS — payout amount and counterparties remain confidential.",
    escrowId,
    escrowIdBytes32,
  };
}

export async function pollEscrowStatus(
  sdk: ReineiraSDK,
  escrowId: bigint
): Promise<{ exists: boolean; funded: boolean; redeemable: boolean }> {
  const escrow = sdk.escrow.get(escrowId);
  const [exists, funded, redeemable] = await Promise.all([
    escrow.exists(),
    escrow.isFunded(),
    escrow.isRedeemable(),
  ]);
  return { exists, funded, redeemable };
}

export { escrowIdToBytes32, txHashToBytes32 };
