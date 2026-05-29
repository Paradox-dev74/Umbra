"use client";

import { useAccount, useChainId } from "wagmi";
import { useCofheClient } from "@cofhe/react";
import { getActivePermit, getPermits } from "@/lib/permits";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { umbraConfig } from "@/lib/config";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { formatAddress } from "@/lib/utils";
import {
  allowedFieldsForRole,
  decryptPathLabel,
  policyStatusLabel,
  type AclRole,
} from "@/lib/acl-policy";
import { Shield, Key, Link2, Eye, Lock } from "lucide-react";

interface PrivacyAccessPanelProps {
  policyId?: number;
  aclRole?: AclRole;
  policyStatus?: number;
}

export function PrivacyAccessPanel({
  policyId,
  aclRole = "guest",
  policyStatus = 0,
}: PrivacyAccessPanelProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const client = useCofheClient();

  const permitsRecord = address ? getPermits(chainId, address) : {};
  const permits = Object.values(permitsRecord);
  const activePermit = address ? getActivePermit(chainId, address) : null;

  const viewFields = allowedFieldsForRole(aclRole, policyStatus, "view");
  const txFields = allowedFieldsForRole(aclRole, policyStatus, "tx");

  return (
    <Card glass className="border-umbra-violet/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-umbra-violet" />
          <h3 className="text-sm font-semibold text-white">Privacy & ACL</h3>
          <Badge variant="muted" className="text-[10px] ml-auto font-mono">
            {aclRole}
          </Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-4 text-xs">
        <Row icon={Shield} label="CoFHE client" value={client ? "Ready" : "Connecting…"} />
        <Row icon={Link2} label="Chain" value={`${chainId} · ${umbraConfig.contractVersion}`} />
        <Row icon={Key} label="Contract" value={formatAddress(UMBRA_CONTRACT_ADDRESS, 8)} />
        {policyId !== undefined && (
          <>
            <Row icon={Eye} label="Policy ID" value={`#${policyId}`} />
            <Row icon={Lock} label="Lifecycle" value={policyStatusLabel(policyStatus)} />
          </>
        )}
        <Row
          icon={Key}
          label="Wallet"
          value={isConnected && address ? formatAddress(address, 8) : "Not connected"}
        />

        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <p className="text-[10px] text-umbra-muted uppercase tracking-wider">Eligible fields (view)</p>
          {viewFields.length === 0 ? (
            <p className="text-umbra-danger/80 text-[10px]">No view decrypt at this lifecycle stage.</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {viewFields.map((f) => (
                <Badge key={f} variant="muted" className="text-[9px] font-mono">
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-umbra-muted uppercase tracking-wider">Eligible fields (tx)</p>
          {txFields.length === 0 ? (
            <p className="text-umbra-muted text-[10px]">No tx-path decrypt for this role.</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {txFields.map((f) => (
                <Badge key={f} variant="warning" className="text-[9px] font-mono">
                  {f} · {decryptPathLabel("tx")}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <p className="text-[10px] text-umbra-muted uppercase tracking-wider">CoFHE sharing permit</p>
          {activePermit ? (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 space-y-1 font-mono text-[10px]">
              <p className="text-white truncate">{activePermit.name ?? "Active permit"}</p>
              {"issuer" in activePermit && activePermit.issuer && (
                <p className="text-umbra-muted">
                  Issuer: {formatAddress(activePermit.issuer as string, 6)}
                </p>
              )}
              {"recipient" in activePermit && activePermit.recipient && (
                <p className="text-umbra-muted">
                  Recipient: {formatAddress(activePermit.recipient as string, 6)}
                </p>
              )}
              <p className="text-umbra-muted">
                Expires:{" "}
                {activePermit.expiration
                  ? new Date(Number(activePermit.expiration) * 1000).toLocaleString()
                  : "—"}
              </p>
              <p className="text-umbra-muted truncate">{activePermit.hash?.slice(0, 22)}…</p>
            </div>
          ) : (
            <p className="text-umbra-muted text-[10px]">
              No active permit — auditors need holder-issued sharing permit + on-chain grantViewerAccess.
            </p>
          )}
          <Row icon={Key} label="Stored permits" value={String(permits.length)} />
        </div>

        <p className="text-[10px] text-umbra-muted pt-2 border-t border-white/[0.06]">
          Plaintext never shown here — only ACL matrix eligibility, handles, and permit metadata.
        </p>
      </CardBody>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 font-mono">
      <span className="flex items-center gap-1.5 text-umbra-muted">
        <Icon className="w-3 h-3" />
        {label}
      </span>
      <span className="text-white truncate max-w-[55%] text-right">{value}</span>
    </div>
  );
}
