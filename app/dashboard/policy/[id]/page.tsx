/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Policy Detail Page (Mock Mode)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { OracleProofForm } from "@/components/forms/OracleProofForm";
import {
  DEMO_POLICIES,
  RISK_CATEGORIES,
  ORACLE_FEEDS,
  POLICY_STATUS_CONFIG,
} from "@/lib/constants";
import {
  formatAddress,
  formatUSDC,
  formatTimestamp,
  formatRelativeTime,
  sleep,
} from "@/lib/utils";
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
} from "lucide-react";

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = Number(params.id);

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
  const statusConfig = POLICY_STATUS_CONFIG[policy.status];
  const oracleFeed = Object.values(ORACLE_FEEDS).find(
    (f) => f.address.toLowerCase() === policy.oracleFeed.toLowerCase()
  );

  const mockDecrypt = (value: number, prefix = "") => async (): Promise<string> => {
    await sleep(1800);
    return `${prefix}${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
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
            <span className="text-2xl">{category?.icon}</span>
            <h1 className="text-2xl font-bold text-white">
              Policy #{policyId}
            </h1>
            <StatusBadge status={policy.status} />
          </div>
          <p className="text-umbra-muted text-sm mt-1">
            {category?.label} · Created {formatRelativeTime(policy.createdAt)}
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
                Values are encrypted on-chain via Fhenix FHE. Click the lock to
                perform a sealed decrypt.
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
                    value={null}
                    unit="USDC"
                    onDecryptRequest={mockDecrypt(policy.coverageAmount, "$")}
                  />
                </div>

                {/* Premium */}
                <div className="space-y-2">
                  <label className="text-xs text-umbra-muted uppercase tracking-wider">
                    Premium Paid
                  </label>
                  <EncryptedValue
                    value={null}
                    unit="USDC"
                    onDecryptRequest={mockDecrypt(policy.premium, "$")}
                  />
                </div>

                {/* Trigger Threshold */}
                <div className="space-y-2">
                  <label className="text-xs text-umbra-muted uppercase tracking-wider">
                    Trigger Threshold
                  </label>
                  <EncryptedValue
                    value={null}
                    unit={oracleFeed?.unit ?? ""}
                    onDecryptRequest={mockDecrypt(policy.triggerThreshold)}
                  />
                </div>
              </div>

              {/* FHE info banner */}
              <div className="mt-2 rounded-lg border border-umbra-violet/20 bg-umbra-violet/5 px-4 py-3">
                <p className="text-xs text-umbra-violet">
                  <span className="font-semibold">FHE Protection:</span>{" "}
                  Coverage, premium, and threshold values are encrypted using
                  Fhenix&apos;s FHE scheme. The oracle comparison uses{" "}
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
                policyId={Number(policy.id)}
                oracleFeedAddress={policy.oracleFeed}
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
                  <p className="text-xs text-umbra-muted">Enterprise</p>
                  <p className="text-sm text-white font-mono">
                    {formatAddress(policy.enterprise, 6)}
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
                    {formatAddress(policy.beneficiary, 6)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Oracle Feed */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-white">
                Oracle Feed
              </h3>
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
                    {formatAddress(policy.oracleFeed, 6)}
                  </p>
                </div>
              </div>
              {oracleFeed && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-xs text-umbra-muted">
                    Current Value
                  </span>
                  <span className="text-sm text-white font-mono flex items-center gap-1">
                    {oracleFeed.currentValue.toLocaleString()}{" "}
                    <span className="text-umbra-muted text-xs">
                      {oracleFeed.unit}
                    </span>
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
                value={formatAddress(policy.policyReferenceHash, 8)}
                mono
              />
              <DetailRow
                icon={<FileText className="w-3.5 h-3.5" />}
                label="Risk Category"
                value={category?.label ?? `Category ${policy.riskCategory}`}
              />
              <DetailRow
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Created"
                value={formatTimestamp(policy.createdAt)}
              />
              <DetailRow
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Expiry Block"
                value={`#${policy.expiryBlock.toLocaleString()}`}
                mono
              />
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
      <span
        className={`text-sm text-white ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
