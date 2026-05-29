/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Settlement Execution Page (On-Chain)
   Real FHE decrypt + Privara payout flow
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RISK_CATEGORIES, ORACLE_FEEDS } from "@/lib/constants";
import { formatAddress, formatBigUSDC } from "@/lib/utils";
import {
  usePolicy,
  usePolicyHandles,
  useMarkSettled,
  useLinkSettlementEscrow,
  usePolicyEscrowId,
  isValidPolicy,
} from "@/hooks/useUmbraContract";
import { useFhenix } from "@/hooks/useFhenix";
import { useUserRoles, resolveAclRole } from "@/hooks/useUserRole";
import { usePrivara } from "@/hooks/usePrivara";
import { txHashToBytes32 } from "@/lib/fhenix";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import {
  getOracleValueForFeed,
  resolveFeedKeyFromAddress,
  formatOraclePrice,
} from "@/lib/oracle-utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  Radio,
  Zap,
  Check,
  Lock,
  Unlock,
  Send,
  RefreshCw,
} from "lucide-react";

type SettleStage =
  | "idle"
  | "decrypt-result"
  | "decrypt-payout"
  | "execute-payout"
  | "mark-settled"
  | "complete"
  | "error";

const STAGES: { key: SettleStage; label: string; description: string }[] = [
  {
    key: "decrypt-result",
    label: "Decrypt Trigger (ebool)",
    description: "Sealed decrypt of homomorphic comparison result via CoFHE Threshold Network…",
  },
  {
    key: "decrypt-payout",
    label: "Decrypt Payout (FHE.select)",
    description: "Reveal encrypted payout amount: FHE.select(triggered, coverage, 0)…",
  },
  {
    key: "execute-payout",
    label: "Execute Payout",
    description: "Executing insurance payout via Privara settlement layer…",
  },
  {
    key: "mark-settled",
    label: "Mark Settled",
    description: "Recording settlement on-chain…",
  },
  {
    key: "complete",
    label: "Settlement Complete",
    description: "Policy settled. Funds released to beneficiary.",
  },
];

export default function SettlementPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = Number(params.id);

  const [stage, setStage] = useState<SettleStage>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [settleTxHash, setSettleTxHash] = useState<string | null>(null);
  const [triggered, setTriggered] = useState<boolean | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<bigint | null>(null);

  const { data: policy, isLoading } = usePolicy(policyId);
  const handles = usePolicyHandles(policyId);
  const { data: linkedEscrowId } = usePolicyEscrowId(policyId);
  const { markSettled } = useMarkSettled();
  const { linkSettlementEscrow } = useLinkSettlementEscrow();
  const { settlePolicy, progress } = usePrivara();
  const { primaryRole, aclRole: baseAclRole } = useUserRoles(
    policy
      ? {
          holder: policy.holder as `0x${string}`,
          beneficiary: policy.beneficiary as `0x${string}`,
          status: policy.status as number,
        }
      : undefined
  );
  const aclRole = policy
    ? resolveAclRole(
        primaryRole,
        policy.status as number,
        false,
        baseAclRole === "privaraRouter"
      )
    : "guest";
  const { decryptForView, decryptPayoutForSettlement, clientReady } = useFhenix();
  const chainlinkPrices = useChainlinkPrices();

  const category = policy
    ? (RISK_CATEGORIES as (typeof RISK_CATEGORIES)[number][])[policy.riskCategory as number]
    : undefined;
  const feedKey = policy ? resolveFeedKeyFromAddress(policy.oracleFeed as string) : undefined;
  const oracleFeed = feedKey ? ORACLE_FEEDS[feedKey] : Object.values(ORACLE_FEEDS).find(
    (f) => f.address.toLowerCase() === (policy?.oracleFeed as string)?.toLowerCase()
  );
  const liveOracle = feedKey ? getOracleValueForFeed(feedKey, chainlinkPrices) : null;

  const currentStageIdx = STAGES.findIndex((s) => s.key === stage);

  const runSettlement = useCallback(async () => {
    if (!policy || !clientReady) {
      toast.error("CoFHE client not ready");
      return;
    }

    setIsRunning(true);
    setErrorMsg(null);

    try {
      // Stage 1: Decrypt ebool trigger result
      setStage("decrypt-result");
      if (!handles.triggerHandle) {
        throw new Error("No trigger result handle — resolve oracle first");
      }
      const isTriggered = (await decryptForView(
        aclRole,
        policy.status as number,
        "trigger",
        handles.triggerHandle,
        "bool"
      )) as boolean;
      setTriggered(isTriggered);

      if (!isTriggered) {
        toast.info("Policy did not trigger — no payout required");
        setStage("complete");
        return;
      }

      // Stage 2: Decrypt FHE.select payout amount (falls back to coverage handle)
      setStage("decrypt-payout");
      const payoutHandle = handles.payoutHandle ?? handles.coverageHandle;
      if (!payoutHandle) {
        throw new Error("No payout handle available");
      }
      let payout: bigint;
      try {
        const result = await decryptPayoutForSettlement(
          aclRole,
          policy.status as number,
          payoutHandle
        );
        payout = result.value;
      } catch {
        if (handles.coverageHandle) {
          const fallback = await decryptPayoutForSettlement(
            aclRole,
            policy.status as number,
            handles.coverageHandle
          );
          payout = fallback.value;
        } else {
          payout = 0n;
        }
      }
      setPayoutAmount(payout);

      // Stage 3: Execute payout via Privara
      setStage("execute-payout");
      const result = await settlePolicy({
        policyId: String(policyId),
        enterpriseAddress: policy.holder as string,
        beneficiaryAddress: policy.beneficiary as string,
        encryptedCoverageAmount: formatBigUSDC(payout),
        policyReferenceHash: policy.policyHash as string,
        riskCategory: String(policy.riskCategory),
      });

      if (result.escrowIdBytes32 && !linkedEscrowId) {
        setStage("execute-payout");
        await linkSettlementEscrow(policyId, result.escrowIdBytes32);
      }

      setStage("mark-settled");
      const settleTx = txHashToBytes32(result.transactionHash);
      setSettleTxHash(result.transactionHash);
      await markSettled(policyId, settleTx);

      setStage("complete");
      toast.success("Settlement complete");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Settlement failed";
      setErrorMsg(msg);
      setStage("error");
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  }, [
    policy,
    clientReady,
    handles,
    decryptForView,
    decryptPayoutForSettlement,
    aclRole,
    settlePolicy,
    policyId,
    markSettled,
    linkSettlementEscrow,
    linkedEscrowId,
  ]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-umbra-blue" />
        <p className="text-umbra-muted">Loading policy from chain…</p>
      </div>
    );
  }

  if (!isValidPolicy(policy)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-white">Policy Not Found</h1>
        <p className="text-umbra-muted">Policy #{policyId} does not exist.</p>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/policy/${policyId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-umbra-warning" />
            <h1 className="text-2xl font-bold text-white">
              Settle Policy #{policyId}
            </h1>
            <StatusBadge status={policy.status as number} />
          </div>
          <p className="text-umbra-muted text-sm mt-1">
            {category?.label} · {oracleFeed?.name ?? "Unknown Feed"}
          </p>
        </div>
      </div>

      {!clientReady && (
        <div className="px-4 py-3 rounded-xl border border-umbra-warning/30 bg-umbra-warning/5 text-sm text-umbra-warning">
          CoFHE client connecting — sealed decryption requires an active CoFHE session.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FlowBox
          icon={<Radio className="w-5 h-5 text-amber-400" />}
          title="Oracle Proof"
          subtitle={oracleFeed?.name ?? "Feed"}
          value={
            liveOracle?.value !== null && liveOracle?.value !== undefined
              ? `${formatOraclePrice(liveOracle.value, oracleFeed?.unit ?? "USD")}`
              : "Awaiting Chainlink…"
          }
          active={false}
          done={policy.status >= 1}
        />
        <FlowBox
          icon={<Lock className="w-5 h-5 text-umbra-violet" />}
          title="FHE Engine"
          subtitle={category?.fheOperator ?? "FHE.gte + FHE.select"}
          value={
            triggered === null
              ? "Encrypted comparison"
              : triggered
                ? "Triggered ✓"
                : "Not triggered"
          }
          active={stage === "decrypt-result" || stage === "decrypt-payout"}
          done={triggered !== null && stage !== "error"}
        />
        <FlowBox
          icon={<Send className="w-5 h-5 text-umbra-success" />}
          title="Settlement"
          subtitle="Beneficiary"
          value={
            payoutAmount !== null
              ? formatBigUSDC(payoutAmount)
              : formatAddress(policy.beneficiary as `0x${string}`, 6)
          }
          active={stage === "execute-payout" || stage === "mark-settled"}
          done={stage === "complete"}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-umbra-blue" />
            <h2 className="text-lg font-semibold text-white">Settlement Pipeline</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {STAGES.map((s, idx) => {
            const isDone = idx < currentStageIdx && stage !== "error";
            const isActive = s.key === stage;
            const isPending = idx > currentStageIdx || stage === "idle";

            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending && stage !== "idle" ? 0.3 : 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="flex items-start gap-4"
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-umbra-success/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-umbra-success" />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full border-2 border-umbra-blue/30 border-t-umbra-blue animate-spin" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-white/10" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDone ? "text-umbra-success" : isActive ? "text-white" : "text-white/40"}`}>
                    {s.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive ? "text-umbra-muted" : "text-white/20"}`}>
                    {s.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <div className="pt-4 border-t border-white/[0.06]">
            {stage === "idle" && (
              <Button
                variant="primary"
                className="w-full"
                glow
                onClick={runSettlement}
                disabled={!clientReady || policy.status < 1}
              >
                <Zap className="w-4 h-4" />
                {policy.status < 1
                  ? "Resolve oracle first"
                  : "Begin Sealed Decrypt & Settlement"}
              </Button>
            )}

            {stage === "error" && (
              <div className="space-y-3">
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {errorMsg}
                </div>
                <Button variant="ghost" className="w-full" onClick={() => { setStage("idle"); setErrorMsg(null); }}>
                  Retry
                </Button>
              </div>
            )}

            {isRunning && (
              <div className="text-center text-sm text-umbra-muted animate-pulse mt-2">
                Settlement in progress — do not navigate away
              </div>
            )}

            {stage === "complete" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-umbra-success/10 border border-umbra-success/20">
                  <Unlock className="w-4 h-4 text-umbra-success" />
                  <span className="text-sm text-umbra-success font-medium">
                    {triggered ? "Settlement executed successfully" : "Policy evaluated — no payout required"}
                  </span>
                </div>
                {settleTxHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${settleTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-umbra-blue hover:underline font-mono"
                  >
                    {settleTxHash.slice(0, 20)}… ↗
                  </a>
                )}
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => router.push(`/dashboard/policy/${policyId}`)}>
                    View Policy
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function FlowBox({
  icon,
  title,
  subtitle,
  value,
  active,
  done,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <motion.div
      animate={{
        borderColor: done
          ? "rgba(16, 185, 129, 0.3)"
          : active
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(255, 255, 255, 0.06)",
        boxShadow: active ? "0 0 20px rgba(59, 130, 246, 0.1)" : "none",
      }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border bg-umbra-card p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            done ? "bg-umbra-success/10" : active ? "bg-umbra-blue/10" : "bg-white/5"
          }`}
        >
          {done ? <Check className="w-5 h-5 text-umbra-success" /> : icon}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-umbra-muted">{subtitle}</p>
        </div>
      </div>
      <p className="text-xs text-umbra-muted font-mono">{value}</p>
    </motion.div>
  );
}
