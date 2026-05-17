/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Policy Detail Page (On-Chain)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { OracleProofForm } from "@/components/forms/OracleProofForm";
import {
  RISK_CATEGORIES,
  ORACLE_FEEDS,
  POLICY_STATUS_CONFIG,
} from "@/lib/constants";
import {
  formatAddress,
  formatRelativeTime,
} from "@/lib/utils";
import { usePolicy, usePolicyHandles } from "@/hooks/useUmbraContract";
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
} from "lucide-react";

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = Number(params.id);

  const { data: policy, isLoading } = usePolicy(policyId);
  const handles = usePolicyHandles(policyId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-umbra-blue" />
        <p className="text-umbra-muted">Loading policy from chain…</p>
      </div>
    );
  }

  if (!policy || policy.id === 0n) {
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
  const oracleFeed = Object.values(ORACLE_FEEDS).find(
    (f) => f.address.toLowerCase() === (policy.oracleFeed as string).toLowerCase()
  );

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

                {/* Trigger Threshold */}
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
              </div>

              {/* Trigger result — shown after oracle resolves */}
              {policy.status >= 1 && handles.triggerHandle && (
                <div className="space-y-2">
                  <label className="text-xs text-umbra-muted uppercase tracking-wider">
                    Trigger Result (ebool)
                  </label>
                  <EncryptedValue
                    ctHash={handles.triggerHandle}
                    format={(raw) => raw ? "✓ Triggered" : "✗ Not Triggered"}
                  />
                </div>
              )}

              {/* FHE info banner */}
              <div className="mt-2 rounded-lg border border-umbra-violet/20 bg-umbra-violet/5 px-4 py-3">
                <p className="text-xs text-umbra-violet">
                  <span className="font-semibold">FHE Protection:</span>{" "}
                  Coverage, premium, and threshold values are encrypted using
                  CoFHE. The oracle comparison uses{" "}
                  <code className="text-umbra-blue bg-black/30 px-1 py-0.5 rounded text-[10px]">
                    {category?.fheOperator ?? "FHE.gte"}
                  </code>{" "}
                  — no party sees plaintext values during evaluation.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Oracle Resolution Form — only for triggered policies */}
          {policy.status === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <OracleProofForm
                policyId={policyId}
                oracleFeedAddress={policy.oracleFeed as string}
              />
            </motion.div>
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
                  <span className="text-xs text-umbra-muted">Current Value</span>
                  <span className="text-sm text-white font-mono flex items-center gap-1">
                    {oracleFeed.currentValue.toLocaleString()}{" "}
                    <span className="text-umbra-muted text-xs">{oracleFeed.unit}</span>
                    {oracleFeed.trend === "up" && (
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

