"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useGrantViewerAccess } from "@/hooks/usePrivacyFeatures";
import { useAuditPermit } from "@/hooks/useAuditPermit";
import { formatPermitExpiry } from "@/lib/permits";
import { isAddress } from "viem";
import { toast } from "sonner";
import { UserPlus, Shield, Zap, Clock } from "lucide-react";

interface PrivacyDelegateFormProps {
  policyId: number;
  isHolder: boolean;
  isResolved?: boolean;
}

export function PrivacyDelegateForm({ policyId, isHolder, isResolved = false }: PrivacyDelegateFormProps) {
  const { grantAccess, isPending } = useGrantViewerAccess();
  const { issuePermit, isIssuing, lastPermit } = useAuditPermit();
  const [viewer, setViewer] = useState("");
  const [fields, setFields] = useState({
    coverage: true,
    premium: false,
    threshold: false,
    deductible: false,
    ratioValid: false,
    trigger: false,
    payout: false,
    proximity: false,
  });

  if (!isHolder) return null;

  const toggle = (key: keyof typeof fields) =>
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGrant = async () => {
    if (!isAddress(viewer)) {
      toast.error("Enter a valid viewer address");
      return;
    }
    if (!Object.values(fields).some(Boolean)) {
      toast.error("Select at least one field to share");
      return;
    }
    try {
      await toast.promise(
        grantAccess({
          policyId,
          viewer: viewer as `0x${string}`,
          allowCoverage: fields.coverage,
          allowPremium: fields.premium,
          allowThreshold: fields.threshold,
          allowDeductible: fields.deductible,
          allowRatioValid: fields.ratioValid,
          allowTrigger: fields.trigger,
          allowPayout: fields.payout,
          allowProximity: fields.proximity,
        }),
        {
          loading: "Granting FHE ACL to viewer…",
          success: "Viewer can sealed-decrypt selected fields only",
          error: (e: unknown) => (e instanceof Error ? e.message : "Grant failed"),
        }
      );
    } catch {
      /* toast */
    }
  };

  const handleIssuePermit = async () => {
    if (!isAddress(viewer)) {
      toast.error("Enter auditor address for permit recipient");
      return;
    }
    try {
      await toast.promise(issuePermit(viewer as `0x${string}`, 24), {
        loading: "Signing CoFHE sharing permit…",
        success: "24h audit permit issued",
        error: (e: unknown) => (e instanceof Error ? e.message : "Permit failed"),
      });
    } catch {
      /* toast */
    }
  };

  const fieldLabels: Array<[keyof typeof fields, string]> = [
    ["coverage", "Coverage"],
    ["premium", "Premium"],
    ["threshold", "Bounds"],
    ["deductible", "Deductible"],
    ["ratioValid", "Ratio ✓"],
    ["trigger", "Trigger"],
    ["payout", "Payout"],
    ["proximity", "Proximity ebool"],
  ];

  return (
    <Card glass gradientBorder className="border-umbra-violet/20">
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-umbra-violet/20 to-umbra-cyan/10 flex items-center justify-center border border-white/10"
          >
            <UserPlus className="w-5 h-5 text-umbra-violet" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">Delegate View Access</h3>
            <p className="text-xs text-umbra-muted">Explicit on-chain FHE.allow per field + optional CoFHE permits</p>
          </div>
        </div>

        <input
          type="text"
          value={viewer}
          onChange={(e) => setViewer(e.target.value)}
          placeholder="Viewer / auditor address (0x…)"
          className="w-full bg-umbra-bg/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-umbra-violet/40"
        />

        <div className="flex flex-wrap gap-2">
          {fieldLabels.map(([key, label]) => (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(key)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                fields[key]
                  ? "border-umbra-violet/40 bg-umbra-violet/15 text-umbra-violet"
                  : "border-white/10 text-umbra-muted hover:border-white/20"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {isResolved && (
          <div className="rounded-xl border border-umbra-cyan/20 bg-umbra-cyan/5 px-3 py-2 flex items-start gap-2">
            <Zap className="w-3.5 h-3.5 text-umbra-cyan mt-0.5 shrink-0" />
            <p className="text-[11px] text-umbra-muted">
              Post-resolve: enable trigger, payout, and proximity for arbitrator review.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-umbra-violet/15 bg-umbra-violet/5 px-3 py-2">
          <p className="text-[11px] text-umbra-muted flex items-start gap-1.5">
            <Shield className="w-3 h-3 mt-0.5 shrink-0 text-umbra-violet" />
            Proximity is opt-in — no automatic ACL leak.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="violet" className="flex-1" onClick={handleGrant} disabled={isPending}>
            Grant On-Chain ACL
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleIssuePermit} disabled={isIssuing}>
            <Clock className="w-3.5 h-3.5" />
            Issue 24h Audit Permit
          </Button>
        </div>

        {lastPermit && (
          <div className="rounded-xl border border-umbra-success/20 bg-umbra-success/5 px-3 py-2 text-[11px]">
            <p className="text-umbra-success font-medium">{lastPermit.name}</p>
            <p className="text-umbra-muted font-mono mt-1">
              → {lastPermit.recipient.slice(0, 10)}… · {formatPermitExpiry(lastPermit.expiration)}
            </p>
            <Badge variant="success" className="mt-2 text-[10px]">
              @cofhe/sdk/permits
            </Badge>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
