"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { setPermit, formatPermitExpiry, getPermits, getActivePermit } from "@/lib/permits";
import {
  allowedFieldsForRole,
  DELEGATION_PRESETS,
  policyStatusLabel,
} from "@/lib/acl-policy";
import { Eye, KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AuditPortalPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [importJson, setImportJson] = useState("");

  const permits = address ? Object.values(getPermits(chainId, address)) : [];
  const activePermit = address ? getActivePermit(chainId, address) : null;

  const auditorViewFields = allowedFieldsForRole("auditor", 0, "view");

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Eye className="w-8 h-8 text-umbra-cyan" />
          Auditor Portal
        </h1>
        <p className="text-sm text-umbra-muted mt-2">
          CoFHE permits provide time-bound off-chain auth. On-chain{" "}
          <code className="text-umbra-violet">grantViewerAccess</code> is still required for sealed decrypt.
        </p>
      </div>

      <Card glass gradientBorder>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-umbra-violet" />
            ACL Eligibility (auditor role)
          </h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <p className="text-xs text-umbra-muted">
            Auditors only decrypt fields explicitly granted via{" "}
            <code className="text-umbra-cyan">grantViewerAccess</code> plus an active CoFHE sharing permit.
            Base matrix fields without delegation:
          </p>
          <div className="flex flex-wrap gap-1">
            {auditorViewFields.length === 0 ? (
              <Badge variant="muted">None without holder delegation</Badge>
            ) : (
              auditorViewFields.map((f) => (
                <Badge key={f} variant="muted" className="text-[10px] font-mono">
                  {f}
                </Badge>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-white/[0.06] space-y-3">
            <p className="text-xs text-umbra-muted uppercase tracking-wider">Delegation presets</p>
            {Object.entries(DELEGATION_PRESETS).map(([id, preset]) => (
              <div
                key={id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <p className="text-white font-medium text-sm">{preset.label}</p>
                <p className="text-xs text-umbra-muted mt-1">{preset.description}</p>
                <p className="text-[10px] text-umbra-cyan mt-2 font-mono">
                  Path: {preset.path}
                  {"issuePermit" in preset && preset.issuePermit ? " · issues CoFHE permit" : ""}
                  {"globalExposureOnly" in preset && preset.globalExposureOnly
                    ? " · owner global exposure grant"
                    : ""}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(preset.fields)
                    .filter(([, enabled]) => enabled)
                    .map(([field]) => (
                      <Badge key={field} variant="muted" className="text-[9px] font-mono">
                        {field}
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card glass gradientBorder>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Your Permits
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {!address ? (
            <p className="text-sm text-umbra-muted">Connect wallet to view stored permits.</p>
          ) : permits.length === 0 ? (
            <p className="text-sm text-umbra-muted border border-dashed border-white/10 rounded-xl py-6 text-center">
              No permits in local store. Holders issue sharing permits from the policy delegate form.
            </p>
          ) : (
            permits.map((p) => (
              <div
                key={p.hash}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-medium">{p.name ?? "Audit permit"}</p>
                  {activePermit?.hash === p.hash && (
                    <Badge variant="success" className="text-[9px]">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-umbra-muted font-mono mt-1">
                  {p.type} · expires {formatPermitExpiry(p.expiration)}
                </p>
                {"issuer" in p && p.issuer && (
                  <p className="text-[10px] text-umbra-muted font-mono mt-1">
                    Issuer: {(p.issuer as string).slice(0, 10)}…
                  </p>
                )}
                {"recipient" in p && p.recipient && (
                  <p className="text-[10px] text-umbra-muted font-mono">
                    Recipient: {(p.recipient as string).slice(0, 10)}…
                  </p>
                )}
                <p className="text-[10px] text-umbra-muted font-mono mt-1 truncate">{p.hash}</p>
              </div>
            ))
          )}

          <div className="pt-4 border-t border-white/[0.06]">
            <label className="text-xs text-umbra-muted">Import shared permit JSON (recipient)</label>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='Paste permit JSON from holder…'
              className="w-full mt-2 h-24 bg-umbra-bg border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-umbra-cyan/40"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={!importJson.trim()}
              onClick={() => {
                try {
                  if (!address) return;
                  const parsed = JSON.parse(importJson);
                  setPermit(chainId, address, parsed);
                  setImportJson("");
                  toast.success("Permit imported to local store");
                } catch {
                  toast.error("Invalid permit JSON — check the payload from the holder");
                }
              }}
            >
              Import permit
            </Button>
            <p className="text-[10px] text-umbra-muted mt-2">
              Lifecycle note: delegated view access applies while policy status is{" "}
              {policyStatusLabel(0)} through {policyStatusLabel(1)} unless holder revokes via permit expiry.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
