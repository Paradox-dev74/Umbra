/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Policy Detail Page (On-Chain)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { OracleProofForm } from "@/components/forms/OracleProofForm";
import { PrivacyDelegateForm } from "@/components/forms/PrivacyDelegateForm";
import { TriggerProximityMonitor } from "@/components/dashboard/TriggerProximityMonitor";
import {
  RISK_CATEGORIES,
  ORACLE_FEEDS,
  POLICY_STATUS_CONFIG,
} from "@/lib/constants";
import {
  formatAddress,
  formatRelativeTime,
} from "@/lib/utils";
import {
  usePolicy,
  usePolicyHandles,
  useCancelPolicy,
  useExpirePolicy,
  useDisputePolicy,
  isValidPolicy,
  isIndexBandPolicy,
} from "@/hooks/useUmbraContract";
import { useAccount, useBlockNumber } from "wagmi";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { getOracleValueForFeed, resolveFeedKeyFromAddress, formatOraclePrice } from "@/lib/oracle-utils";
import { isAddress } from "viem";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  Building2,
  User,
  Clock,
  Hash,
  Radio,
  TrendingUp,
  FileText,
  Zap,
  RefreshCw,
  AlertTriangle,
  Hourglass,
  XCircle,
} from "lucide-react";

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = Number(params.id);
  const { address } = useAccount();

  const { data: policy, isLoading, refetch } = usePolicy(policyId);
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const handles = usePolicyHandles(policyId);
  const chainlinkPrices = useChainlinkPrices();
  const { cancelPolicy, isPending: isCancelling } = useCancelPolicy();
  const { expirePolicy, isPending: isExpiring } = useExpirePolicy();
  const { disputePolicy, isPending: isDisputing } = useDisputePolicy();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [arbitratorAddress, setArbitratorAddress] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const handleExpire = async () => {
    try {
      await toast.promise(expirePolicy(policyId), {
        loading: "Expiring policy & subtracting exposure…",
        success: "Policy expired — FHE.sub applied to portfolio",
        error: (e: unknown) => (e instanceof Error ? e.message : "Expire failed"),
      });
      refetch();
    } catch {
      /* toast */
    }
  };

  const handleDispute = async () => {
    if (!isAddress(arbitratorAddress)) {
      toast.error("Enter a valid arbitrator address");
      return;
    }
    try {
      await toast.promise(disputePolicy(policyId, arbitratorAddress as `0x${string}`), {
        loading: "Opening dispute & granting arbitrator ACL…",
        success: "Policy disputed — arbitrator can sealed-decrypt trigger/payout",
        error: (e: unknown) => (e instanceof Error ? e.message : "Dispute failed"),
      });
      setShowDisputeForm(false);
      setArbitratorAddress("");
      refetch();
    } catch {
      /* toast */
    }
  };

  const handleCancel = async () => {
    try {
      const txHash = await toast.promise(
        cancelPolicy(policyId),
        {
          loading: "Submitting cancellation…",
          success: "Policy cancelled successfully",
          error: (e: unknown) => `Cancel failed: ${e instanceof Error ? e.message : "Unknown error"}`,
        }
      );
      if (txHash) {
        setShowCancelConfirm(false);
        refetch();
      }
    } catch {
      // toast.promise already handles the error display
    }
  };

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
        <p className="text-umbra-muted">
          Policy #{policyId} does not exist on-chain.
        </p>
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const category = (RISK_CATEGORIES as (typeof RISK_CATEGORIES)[number][])[policy.riskCategory as number];
  const feedKey = resolveFeedKeyFromAddress(policy.oracleFeed as string);
  const oracleFeed = feedKey ? ORACLE_FEEDS[feedKey] : Object.values(ORACLE_FEEDS).find(
    (f) => f.address.toLowerCase() === (policy.oracleFeed as string).toLowerCase()
  );
  const liveOracle = feedKey ? getOracleValueForFeed(feedKey, chainlinkPrices) : null;
  const isHolder =
    !!address && (policy.holder as string).toLowerCase() === address.toLowerCase();
  const isExpiredByBlock =
    blockNumber !== undefined && blockNumber > policy.expiryBlock;
  const isBand = isIndexBandPolicy(policy);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category?.icon ?? "📋"}</span>
            <h1 className="text-2xl font-bold text-white">
              Policy #{policyId}
            </h1>
            <StatusBadge status={policy.status as number} />
          </div>
          <p className="text-umbra-muted text-sm mt-1">
            {category?.label} · Created block #{policy.createdBlock?.toString()}
          </p>
        </div>
        {policy.status === 1 && (
          <Button
            variant="primary"
            glow
            onClick={() => router.push(`/settle/${policyId}`)}
          >
            <Zap className="w-4 h-4" />
            Settle Policy
          </Button>
        )}
        {policy.status === 0 && isHolder && isExpiredByBlock && (
          <Button variant="outline" size="sm" onClick={handleExpire} disabled={isExpiring}>
            <Hourglass className="w-4 h-4" />
            {isExpiring ? "Expiring…" : "Expire Policy"}
          </Button>
        )}
        {(policy.status === 1 || policy.status === 2) && isHolder && (
          showDisputeForm ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={arbitratorAddress}
                onChange={(e) => setArbitratorAddress(e.target.value)}
                placeholder="Arbitrator 0x…"
                className="bg-umbra-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white w-48"
              />
              <Button variant="outline" size="sm" onClick={handleDispute} disabled={isDisputing}>
                {isDisputing ? "…" : "Submit"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDisputeForm(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowDisputeForm(true)}>
              <AlertTriangle className="w-4 h-4" />
              Dispute
            </Button>
          )
        )}
        {policy.status === 0 && isHolder && (
            <>
              {showCancelConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-umbra-muted">Are you sure?</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling…" : "Confirm Cancel"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Keep
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Policy
                </Button>
              )}
            </>
          )}
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Encrypted Values */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-umbra-blue" />
                <h2 className="text-lg font-semibold text-white">
                  FHE-Encrypted Policy Terms
                </h2>
              </div>
              <p className="text-xs text-umbra-muted mt-1">
                Values are encrypted on-chain via CoFHE. Click the lock to
                perform a sealed decrypt via the CoFHE Threshold Network.
              </p>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Coverage */}
                <div className="space-y-2">
                  <label className="text-xs text-umbra-muted uppercase tracking-wider">
                    Coverage Amount
                  </label>
                  <EncryptedValue
                    ctHash={handles.coverageHandle}
                    unit="USDC"
                    format={(raw) => "$" + (Number(raw) / 1_000_000).toLocaleString()}
                  />
                </div>

                {/* Premium */}
                <div className="space-y-2">
                  <label className="text-xs text-umbra-muted uppercase tracking-wider">
                    Premium Paid
                  </label>
                  <EncryptedValue
                    ctHash={handles.premiumHandle}
                    unit="USDC"
                    format={(raw) => "$" + (Number(raw) / 1_000_000).toLocaleString()}
                  />
                </div>

                {/* Trigger Threshold / Band */}
                {isBand ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs text-umbra-muted uppercase tracking-wider">
                        Band Floor
                      </label>
                      <EncryptedValue
                        ctHash={handles.floorHandle}
                        unit={oracleFeed?.unit ?? ""}
                        format={(raw) => raw.toString()}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-umbra-muted uppercase tracking-wider">
                        Band Ceiling
                      </label>
                      <EncryptedValue
                        ctHash={handles.ceilingHandle}
                        unit={oracleFeed?.unit ?? ""}
                        format={(raw) => raw.toString()}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs text-umbra-muted uppercase tracking-wider">
                      Trigger Threshold
                    </label>
                    <EncryptedValue
                      ctHash={handles.thresholdHandle}
                      unit={oracleFeed?.unit ?? ""}
                      format={(raw) => raw.toString()}
                    />
                  </div>
                )}

                {handles.deductibleHandle && handles.deductibleHandle !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                  <div className="space-y-2">
                    <label className="text-xs text-umbra-muted uppercase tracking-wider">
                      Encrypted Deductible
                    </label>
                    <EncryptedValue
                      ctHash={handles.deductibleHandle}
                      unit="USDC"
                      format={(raw) => "$" + (Number(raw) / 1_000_000).toLocaleString()}
                    />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs text-umbra-muted uppercase tracking-wider">
                    Premium Ratio Valid (ebool)
                  </label>
                  <EncryptedValue
                    ctHash={handles.ratioValidHandle}
                    valueType="bool"
                    formatBool={(raw) =>
                      raw ? "✓ Within max ratio (FHE.lte)" : "✗ Ratio exceeded"
                    }
                  />
                </div>
              </div>

              <TriggerProximityMonitor
                policyId={policyId}
                riskCategory={policy.riskCategory as number}
                oracleFeedAddress={policy.oracleFeed as string}
                thresholdHandle={handles.thresholdHandle}
                floorHandle={handles.floorHandle}
                ceilingHandle={handles.ceilingHandle}
                proximityHandle={handles.proximityHandle}
                policyMode={policy.policyMode as number}
                status={policy.status as number}
              />

              {/* Trigger result — shown after oracle resolves */}
              {policy.status >= 1 && handles.triggerHandle && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-umbra-muted uppercase tracking-wider">
                      Trigger Result (ebool)
                    </label>
                    <EncryptedValue
                      ctHash={handles.triggerHandle}
                      valueType="bool"
                      formatBool={(raw) => (raw ? "✓ Triggered" : "✗ Not Triggered")}
                    />
                  </div>
                  {handles.payoutHandle && (
                    <div className="space-y-2">
                      <label className="text-xs text-umbra-muted uppercase tracking-wider">
                        Payout Amount (FHE.select)
                      </label>
                      <EncryptedValue
                        ctHash={handles.payoutHandle}
                        unit="USDC"
                        format={(raw) => "$" + (Number(raw) / 1_000_000).toLocaleString()}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* FHE info banner */}
              <div className="mt-2 rounded-lg border border-umbra-violet/20 bg-umbra-violet/5 px-4 py-3">
                <p className="text-xs text-umbra-violet">
                  <span className="font-semibold">FHE Protection:</span>{" "}
                  Policy terms are encrypted via CoFHE. At resolution the oracle value is public
                  (parametric design); bounds and payout amounts stay encrypted until sealed decrypt.
                  Comparison uses{" "}
                  <code className="text-umbra-blue bg-black/30 px-1 py-0.5 rounded text-[10px]">
                    {category?.fheOperator ?? "FHE.gte"}
                  </code>{" "}
                  with homomorphic payout via{" "}
                  <code className="text-umbra-violet bg-black/30 px-1 py-0.5 rounded text-[10px]">
                    FHE.select
                  </code>
                  — settlement may reveal payout to Privara after holder sealed decrypt.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Oracle Resolution — for active policies awaiting trigger */}
          {policy.status === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <OracleProofForm
                policyId={policyId}
                oracleFeedAddress={policy.oracleFeed as string}
                riskCategory={policy.riskCategory as number}
                onComplete={() => refetch()}
              />
              <PrivacyDelegateForm
                policyId={policyId}
                isHolder={isHolder}
                isResolved={false}
              />
            </motion.div>
          )}

          {(policy.status === 1 || policy.status === 2 || policy.status === 4) && (
            <PrivacyDelegateForm
              policyId={policyId}
              isHolder={isHolder}
              isResolved
            />
          )}
        </div>

        {/* Right Column — Metadata */}
        <div className="space-y-6">
          {/* Parties */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-white">Parties</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-umbra-blue/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-umbra-blue" />
                </div>
                <div>
                  <p className="text-xs text-umbra-muted">Policy Holder</p>
                  <p className="text-sm text-white font-mono">
                    {formatAddress(policy.holder as `0x${string}`, 6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-umbra-violet/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-umbra-violet" />
                </div>
                <div>
                  <p className="text-xs text-umbra-muted">Beneficiary</p>
                  <p className="text-sm text-white font-mono">
                    {formatAddress(policy.beneficiary as `0x${string}`, 6)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Oracle Feed */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-white">Oracle Feed</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    {oracleFeed?.name ?? "Unknown Feed"}
                  </p>
                  <p className="text-xs text-umbra-muted font-mono">
                    {formatAddress(policy.oracleFeed as `0x${string}`, 6)}
                  </p>
                </div>
              </div>
              {oracleFeed && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-xs text-umbra-muted">
                    {liveOracle?.source === "chainlink" ? "Live Chainlink" : "Feed status"}
                  </span>
                  <span className="text-sm text-white font-mono flex items-center gap-1">
                    {formatOraclePrice(liveOracle?.value ?? null, oracleFeed.unit)}{" "}
                    {liveOracle?.source === "chainlink" && (
                      <TrendingUp className="w-3 h-3 text-umbra-success" />
                    )}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-white">Details</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <DetailRow
                icon={<Hash className="w-3.5 h-3.5" />}
                label="Policy Hash"
                value={formatAddress(policy.policyHash as `0x${string}`, 8)}
                mono
              />
              <DetailRow
                icon={<FileText className="w-3.5 h-3.5" />}
                label="Risk Category"
                value={category?.label ?? `Category ${policy.riskCategory}`}
              />
              <DetailRow
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Created Block"
                value={`#${policy.createdBlock?.toString()}`}
                mono
              />
              <DetailRow
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Expiry Block"
                value={`#${policy.expiryBlock?.toString()}`}
                mono
              />
              {policy.resolvedBlock > 0n && (
                <DetailRow
                  icon={<Zap className="w-3.5 h-3.5" />}
                  label="Resolved Block"
                  value={`#${policy.resolvedBlock?.toString()}`}
                  mono
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-umbra-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-sm text-white ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

