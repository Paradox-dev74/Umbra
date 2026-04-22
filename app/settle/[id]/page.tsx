/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Settlement Execution Page (Mock Mode)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  DEMO_POLICIES,
  RISK_CATEGORIES,
  ORACLE_FEEDS,
} from "@/lib/constants";
import {
  formatAddress,
  formatUSDC,
  sleep,
} from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Radio,
  Zap,
  Check,
  Lock,
  Unlock,
  Send,
} from "lucide-react";

type SettleStage =
  | "idle"
  | "verify-oracle"
  | "fhe-compare"
  | "decrypt-result"
  | "execute-payout"
  | "complete";

const STAGES: { key: SettleStage; label: string; description: string }[] = [
  {
    key: "verify-oracle",
    label: "Verify Oracle",
    description: "Fetching and verifying the latest oracle proof on-chain...",
  },
  {
    key: "fhe-compare",
    label: "FHE Comparison",
    description: "Running encrypted comparison: FHE.gte(oracleValue, eThreshold)...",
  },
  {
    key: "decrypt-result",
    label: "Decrypt Result",
    description: "Sealed decryption of ebool comparison result via Privara relay...",
  },
  {
    key: "execute-payout",
    label: "Execute Payout",
    description: "Condition met — transferring encrypted coverage to beneficiary...",
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

  const policy = DEMO_POLICIES.find((p) => Number(p.id) === policyId);

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-white">Policy Not Found</h1>
        <p className="text-umbra-muted">
          Policy #{policyId} does not exist.
        </p>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const category = RISK_CATEGORIES[policy.riskCategory];
  const oracleFeed = Object.values(ORACLE_FEEDS).find(
    (f) => f.address.toLowerCase() === policy.oracleFeed.toLowerCase()
  );

  const currentStageIdx = STAGES.findIndex((s) => s.key === stage);

  const runSettlement = useCallback(async () => {
    setIsRunning(true);

    setStage("verify-oracle");
    await sleep(1500);

    setStage("fhe-compare");
    await sleep(2500);

    setStage("decrypt-result");
    await sleep(2000);

    setStage("execute-payout");
    await sleep(1500);

    setStage("complete");
    setIsRunning(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <StatusBadge status={policy.status} />
          </div>
          <p className="text-umbra-muted text-sm mt-1">
            {category?.label} · {oracleFeed?.name ?? "Unknown Feed"}
          </p>
        </div>
      </div>

      {/* Settlement Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Oracle */}
        <FlowBox
          icon={<Radio className="w-5 h-5 text-amber-400" />}
          title="Oracle Proof"
          subtitle={oracleFeed?.name ?? "Feed"}
          value={`${oracleFeed?.currentValue.toLocaleString() ?? "?"} ${oracleFeed?.unit ?? ""}`}
          active={stage === "verify-oracle"}
          done={currentStageIdx > 0}
        />

        {/* Box 2: FHE Engine */}
        <FlowBox
          icon={<Lock className="w-5 h-5 text-umbra-violet" />}
          title="FHE Engine"
          subtitle={category?.fheOperator ?? "FHE.gte"}
          value="Encrypted comparison"
          active={stage === "fhe-compare" || stage === "decrypt-result"}
          done={currentStageIdx > 2}
        />

        {/* Box 3: Payout */}
        <FlowBox
          icon={<Send className="w-5 h-5 text-umbra-success" />}
          title="Settlement"
          subtitle="Beneficiary"
          value={formatAddress(policy.beneficiary, 6)}
          active={stage === "execute-payout"}
          done={stage === "complete"}
        />
      </div>

      {/* Arrows between boxes */}
      <div className="hidden md:flex items-center justify-center -mt-4 mb-2">
        <div className="flex items-center gap-4 text-white/20">
          <div className="w-24" />
          <ArrowRight className="w-5 h-5" />
          <div className="w-40" />
          <ArrowRight className="w-5 h-5" />
          <div className="w-24" />
        </div>
      </div>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-umbra-blue" />
            <h2 className="text-lg font-semibold text-white">
              Settlement Pipeline
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {STAGES.map((s, idx) => {
            const isDone = idx < currentStageIdx;
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
                {/* Status icon */}
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

                {/* Text */}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDone
                        ? "text-umbra-success"
                        : isActive
                          ? "text-white"
                          : "text-white/40"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isActive ? "text-umbra-muted" : "text-white/20"
                    }`}
                  >
                    {s.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Action buttons */}
          <div className="pt-4 border-t border-white/[0.06]">
            {stage === "idle" && (
              <Button
                variant="primary"
                className="w-full"
                glow
                onClick={runSettlement}
              >
                <Zap className="w-4 h-4" />
                Begin Settlement
              </Button>
            )}

            {isRunning && (
              <div className="text-center text-sm text-umbra-muted animate-pulse">
                Settlement in progress — do not navigate away
              </div>
            )}

            {stage === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-umbra-success/10 border border-umbra-success/20">
                  <Unlock className="w-4 h-4 text-umbra-success" />
                  <span className="text-sm text-umbra-success font-medium">
                    Settlement executed successfully
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/dashboard/policy/${policyId}`)
                    }
                  >
                    View Policy
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Policy Summary */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-umbra-muted">Coverage</p>
              <p className="text-sm text-white font-mono mt-1">
                {formatUSDC(policy.coverageAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-umbra-muted">Premium</p>
              <p className="text-sm text-white font-mono mt-1">
                {formatUSDC(policy.premium)}
              </p>
            </div>
            <div>
              <p className="text-xs text-umbra-muted">Threshold</p>
              <p className="text-sm text-white font-mono mt-1">
                {policy.triggerThreshold.toLocaleString()}{" "}
                <span className="text-umbra-muted text-xs">{oracleFeed?.unit ?? ""}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-umbra-muted">Enterprise</p>
              <p className="text-sm text-white font-mono mt-1">
                {formatAddress(policy.enterprise, 4)}
              </p>
            </div>
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
        boxShadow: active
          ? "0 0 20px rgba(59, 130, 246, 0.1)"
          : "none",
      }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border bg-umbra-card p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            done
              ? "bg-umbra-success/10"
              : active
                ? "bg-umbra-blue/10"
                : "bg-white/5"
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
      {active && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "linear" }}
          className="h-0.5 bg-gradient-to-r from-umbra-blue to-umbra-violet rounded-full origin-left"
        />
      )}
    </motion.div>
  );
}
