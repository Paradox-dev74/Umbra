"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useFhenix } from "@/hooks/useFhenix";
import { usePrivara } from "@/hooks/usePrivara";
import {
  useLinkSettlementEscrow,
  useMarkSettled,
  usePolicyEscrowId,
  usePolicyHandles,
} from "@/hooks/useUmbraContract";
import { txHashToBytes32 } from "@/lib/fhenix";
import { formatBigUSDC } from "@/lib/utils";
import { umbraConfig } from "@/lib/config";
import { toast } from "sonner";
import { Check, Lock, Send, Shield, Unlock, Zap } from "lucide-react";
import type { OnChainPolicy } from "@/hooks/useUmbraContract";

type WizardStage =
  | "idle"
  | "decrypt-trigger"
  | "decrypt-payout"
  | "create-escrow"
  | "link-escrow"
  | "mark-settled"
  | "complete"
  | "error";

const STAGE_LABELS: Record<WizardStage, string> = {
  idle: "Ready",
  "decrypt-trigger": "Decrypt trigger (ebool)",
  "decrypt-payout": "Decrypt payout amount",
  "create-escrow": "Privara escrow + fund",
  "link-escrow": "Link escrow on-chain",
  "mark-settled": "Mark settled",
  complete: "Complete",
  error: "Error",
};

interface SettlementWizardProps {
  policyId: number;
  policy: OnChainPolicy;
  compact?: boolean;
}

export function SettlementWizard({ policyId, policy, compact = false }: SettlementWizardProps) {
  const [stage, setStage] = useState<WizardStage>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [triggered, setTriggered] = useState<boolean | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<bigint | null>(null);
  const [settleTxHash, setSettleTxHash] = useState<string | null>(null);

  const handles = usePolicyHandles(policyId);
  const { data: linkedEscrowId } = usePolicyEscrowId(policyId);
  const { decryptBool, decryptValue, clientReady } = useFhenix();
  const { settlePolicy, progress, isSettling } = usePrivara();
  const { linkSettlementEscrow } = useLinkSettlementEscrow();
  const { markSettled } = useMarkSettled();

  const runSettlement = useCallback(async () => {
    if (!clientReady) {
      toast.error("CoFHE client not ready");
      return;
    }
    if (policy.status < 1) {
      toast.error("Policy must be oracle-triggered first");
      return;
    }
    if (!umbraConfig.privaraEnabled) {
      toast.error("Privara settlement is disabled in config");
      return;
    }

    setErrorMsg(null);

    try {
      setStage("decrypt-trigger");
      if (!handles.triggerHandle) {
        throw new Error("No trigger handle — resolve oracle first");
      }
      const isTriggered = await decryptBool(handles.triggerHandle);
      setTriggered(isTriggered);

      if (!isTriggered) {
        setStage("complete");
        toast.info("Policy did not trigger — no payout required");
        return;
      }

      setStage("decrypt-payout");
      const payoutHandle = handles.payoutHandle ?? handles.coverageHandle;
      if (!payoutHandle) throw new Error("No payout handle available");
      let payout: bigint;
      try {
        payout = await decryptValue(payoutHandle);
      } catch {
        payout = handles.coverageHandle
          ? await decryptValue(handles.coverageHandle)
          : 0n;
      }
      setPayoutAmount(payout);

      setStage("create-escrow");
      const result = await settlePolicy({
        policyId: String(policyId),
        enterpriseAddress: policy.holder as string,
        beneficiaryAddress: policy.beneficiary as string,
        encryptedCoverageAmount: formatBigUSDC(payout),
        policyReferenceHash: policy.policyHash as string,
        riskCategory: String(policy.riskCategory),
      });

      if (result.escrowIdBytes32 && !linkedEscrowId) {
        setStage("link-escrow");
        await linkSettlementEscrow(policyId, result.escrowIdBytes32);
      }

      setStage("mark-settled");
      const txBytes = txHashToBytes32(result.transactionHash);
      setSettleTxHash(result.transactionHash);
      await markSettled(policyId, txBytes);

      setStage("complete");
      toast.success("Settlement complete");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Settlement failed";
      setErrorMsg(msg);
      setStage("error");
      toast.error(msg);
    }
  }, [
    clientReady,
    policy,
    handles,
    decryptBool,
    decryptValue,
    settlePolicy,
    policyId,
    linkSettlementEscrow,
    linkedEscrowId,
    markSettled,
  ]);

  if (policy.status >= 2) {
    return (
      <Card glass className="border-umbra-success/20">
        <CardBody className="flex items-center gap-3 py-4">
          <Check className="w-5 h-5 text-umbra-success" />
          <div>
            <p className="text-sm font-medium text-white">Policy settled</p>
            {policy.settlementTx && policy.settlementTx !== "0x" + "0".repeat(64) && (
              <a
                href={`https://sepolia.etherscan.io/tx/0x${String(policy.settlementTx).slice(2, 66)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-umbra-blue hover:underline"
              >
                View settlement tx ↗
              </a>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card glass gradientBorder className="border-umbra-warning/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-umbra-warning" />
          <h3 className="text-lg font-semibold text-white">Settlement Wizard</h3>
          {linkedEscrowId &&
            linkedEscrowId !== "0x" + "0".repeat(64) && (
              <Badge variant="muted" className="text-[10px] ml-auto">
                Escrow linked
              </Badge>
            )}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {!compact && (
          <p className="text-xs text-umbra-muted">
            Sealed decrypt → Privara escrow (create, fund, redeem) → link escrow → mark settled on Umbra V5.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {(Object.keys(STAGE_LABELS) as WizardStage[])
            .filter((s) => s !== "idle" && s !== "error")
            .map((s) => {
              const idx = Object.keys(STAGE_LABELS).indexOf(s);
              const curIdx = Object.keys(STAGE_LABELS).indexOf(stage);
              const done = idx < curIdx && stage !== "error";
              const active = s === stage;
              return (
                <Badge
                  key={s}
                  variant={done ? "success" : active ? "warning" : "muted"}
                  className="text-[10px]"
                >
                  {STAGE_LABELS[s]}
                </Badge>
              );
            })}
        </div>

        {progress && isSettling && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-umbra-cyan animate-pulse"
          >
            Privara: {progress.stage.replace(/-/g, " ")}
            {progress.escrowId !== undefined ? ` · escrow #${progress.escrowId}` : ""}
          </motion.p>
        )}

        {stage === "idle" && (
          <Button
            variant="primary"
            className="w-full"
            glow
            onClick={runSettlement}
            disabled={!clientReady || policy.status < 1 || isSettling}
          >
            <Unlock className="w-4 h-4" />
            {policy.status < 1 ? "Awaiting oracle trigger" : "Begin Settlement"}
          </Button>
        )}

        {stage === "error" && (
          <div className="space-y-3">
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {errorMsg}
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setStage("idle")}>
              Retry
            </Button>
          </div>
        )}

        {stage === "complete" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-umbra-success">
              <Shield className="w-4 h-4" />
              {triggered ? "Payout executed via Privara" : "No payout required"}
            </div>
            {payoutAmount !== null && triggered && (
              <p className="text-xs text-umbra-muted font-mono">
                Decrypted payout: {formatBigUSDC(payoutAmount)}
              </p>
            )}
            {settleTxHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${settleTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-umbra-blue hover:underline flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                {settleTxHash.slice(0, 18)}… ↗
              </a>
            )}
          </motion.div>
        )}

        {!clientReady && (
          <p className="text-xs text-umbra-warning flex items-center gap-1">
            <Lock className="w-3 h-3" />
            CoFHE session required for sealed decrypt
          </p>
        )}
      </CardBody>
    </Card>
  );
}
