"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useGrantViewerAccess } from "@/hooks/usePrivacyFeatures";
import { useAuditPermit } from "@/hooks/useAuditPermit";
import { formatPermitExpiry } from "@/lib/permits";
import {
  DELEGATION_PRESETS,
  decryptPathLabel,
  type DelegationPresetId,
} from "@/lib/acl-policy";
import { isAddress } from "viem";
import { toast } from "sonner";
import { UserPlus, Shield, Clock } from "lucide-react";

interface PrivacyDelegateFormProps {
  policyId: number;
  isHolder: boolean;
  isResolved?: boolean;
}

export function PrivacyDelegateForm({ policyId, isHolder, isResolved = false }: PrivacyDelegateFormProps) {
  const { grantAccess, isPending } = useGrantViewerAccess();
  const { issuePermit, isIssuing, lastPermit } = useAuditPermit();
  const [viewer, setViewer] = useState("");
  const [presetId, setPresetId] = useState<DelegationPresetId>("auditor");

  if (!isHolder) return null;

  const preset = DELEGATION_PRESETS[presetId];

  const handleGrant = async () => {
    if (!isAddress(viewer)) {
      toast.error("Enter a valid viewer address");
      return;
    }
    if ("globalExposureOnly" in preset && preset.globalExposureOnly) {
      toast.info("Use owner settings to grant global exposure viewer for reinsurers.");
      return;
    }
    const f = preset.fields;
    if (!Object.values(f).some(Boolean)) {
      toast.error("Preset has no fields to grant");
      return;
    }
    try {
      await toast.promise(
        grantAccess({
          policyId,
          viewer: viewer as `0x${string}`,
          allowCoverage: f.coverage ?? false,
          allowPremium: f.premium ?? false,
          allowThreshold: f.threshold ?? false,
          allowDeductible: f.deductible ?? false,
          allowRatioValid: f.ratioValid ?? false,
          allowTrigger: f.trigger ?? false,
          allowPayout: f.payout ?? false,
          allowProximity: f.proximity ?? false,
        }),
        {
          loading: "Granting on-chain FHE.allow…",
          success: `ACL granted · path: ${decryptPathLabel(preset.path)}`,
          error: (e: unknown) => (e instanceof Error ? e.message : "Grant failed"),
        }
      );
      if (preset.issuePermit) {
        await issuePermit(viewer as `0x${string}`, 24);
      }
    } catch {
      /* toast */
    }
  };

  const handleIssuePermitOnly = async () => {
    if (!isAddress(viewer)) {
      toast.error("Enter auditor address for permit recipient");
      return;
    }
    try {
      await toast.promise(issuePermit(viewer as `0x${string}`, 24), {
        loading: "Signing CoFHE sharing permit…",
        success: "24h audit permit issued (view path)",
        error: (e: unknown) => (e instanceof Error ? e.message : "Permit failed"),
      });
    } catch {
      /* toast */
    }
  };

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
            <p className="text-xs text-umbra-muted">
              Role presets · on-chain ACL + optional CoFHE permit · path: decryptForView
            </p>
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
          {(Object.keys(DELEGATION_PRESETS) as DelegationPresetId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPresetId(id)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                presetId === id
                  ? "border-umbra-violet/40 bg-umbra-violet/15 text-umbra-violet"
                  : "border-white/10 text-umbra-muted hover:border-white/20"
              }`}
            >
              {DELEGATION_PRESETS[id].label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-umbra-violet/15 bg-umbra-violet/5 px-3 py-2 space-y-1">
          <p className="text-xs text-white font-medium">{preset.label}</p>
          <p className="text-[11px] text-umbra-muted">{preset.description}</p>
          <Badge variant="info" className="text-[10px] mt-1">
            {decryptPathLabel(preset.path)}
          </Badge>
        </div>

        {isResolved && presetId === "arbitratorReview" && (
          <p className="text-[11px] text-umbra-warning">
            Assign an arbitrator via dispute flow before granting arbitrator-review ACL.
          </p>
        )}

        <div className="rounded-xl border border-umbra-violet/15 bg-umbra-violet/5 px-3 py-2">
          <p className="text-[11px] text-umbra-muted flex items-start gap-1.5">
            <Shield className="w-3 h-3 mt-0.5 shrink-0 text-umbra-violet" />
            CoFHE grants are append-only on-chain; revoke via permit expiry and avoid re-granting.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="violet" className="flex-1" onClick={handleGrant} disabled={isPending}>
            Grant On-Chain ACL
          </Button>
          {preset.issuePermit && (
            <Button variant="outline" className="flex-1" onClick={handleIssuePermitOnly} disabled={isIssuing}>
              <Clock className="w-3.5 h-3.5" />
              Issue 24h Permit
            </Button>
          )}
        </div>

        {lastPermit && (
          <div className="rounded-xl border border-umbra-success/20 bg-umbra-success/5 px-3 py-2 text-[11px]">
            <p className="text-umbra-success font-medium">{lastPermit.name}</p>
            <p className="text-umbra-muted font-mono mt-1">
              → {lastPermit.recipient.slice(0, 10)}… · {formatPermitExpiry(lastPermit.expiration)}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
