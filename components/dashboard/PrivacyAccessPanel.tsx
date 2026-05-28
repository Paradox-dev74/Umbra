"use client";

import { useAccount, useChainId } from "wagmi";
import { useCofheClient } from "@cofhe/react";
import { getActivePermit, getPermits } from "@/lib/permits";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { umbraConfig } from "@/lib/config";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { formatAddress } from "@/lib/utils";
import { Shield, Key, Link2, Eye } from "lucide-react";

export function PrivacyAccessPanel({ policyId }: { policyId?: number }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const client = useCofheClient();

  const permitsRecord = address ? getPermits(chainId, address) : {};
  const permits = Object.values(permitsRecord);
  const activePermit = address ? getActivePermit(chainId, address) : null;

  return (
    <Card glass className="border-umbra-violet/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-umbra-violet" />
          <h3 className="text-sm font-semibold text-white">Privacy & Access Debug</h3>
          <Badge variant="muted" className="text-[10px] ml-auto">
            Dev
          </Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-3 text-xs font-mono">
        <Row icon={Shield} label="CoFHE client" value={client ? "Ready" : "Connecting…"} />
        <Row icon={Link2} label="Chain" value={`${chainId} · ${umbraConfig.contractVersion}`} />
        <Row icon={Key} label="Contract" value={formatAddress(UMBRA_CONTRACT_ADDRESS, 8)} />
        {policyId !== undefined && (
          <Row icon={Eye} label="Policy ID" value={`#${policyId}`} />
        )}
        <Row
          icon={Key}
          label="Wallet"
          value={isConnected && address ? formatAddress(address, 8) : "Not connected"}
        />
        <Row
          icon={Key}
          label="Active permit"
          value={activePermit?.hash ? `${activePermit.hash.slice(0, 14)}…` : "None"}
        />
        <Row icon={Key} label="Stored permits" value={String(permits.length)} />
        <p className="text-[10px] text-umbra-muted pt-2 border-t border-white/[0.06]">
          Plaintext never shown here — only ACL state, handles, and permit metadata.
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
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-umbra-muted">
        <Icon className="w-3 h-3" />
        {label}
      </span>
      <span className="text-white truncate max-w-[55%] text-right">{value}</span>
    </div>
  );
}
