"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import {
  usePolicyCount,
  usePolicy,
  usePolicyHandles,
  useResolveDispute,
} from "@/hooks/useUmbraContract";
import { Scale } from "lucide-react";
import { toast } from "sonner";
import { useReadContracts } from "wagmi";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";

export default function ArbitratorPage() {
  const { address } = useAccount();
  const { data: countData } = usePolicyCount();
  const count = countData ? Number(countData) : 0;
  const { resolveDispute, isPending } = useResolveDispute();

  const contracts = Array.from({ length: count }, (_, i) => ({
    address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
    abi: UMBRA_ABI,
    functionName: "getPolicy" as const,
    args: [BigInt(i)],
  }));

  const { data: results } = useReadContracts({
    contracts,
    query: { enabled: count > 0 },
  });

  const disputed: Array<{ id: number; arbitrator: string }> = [];

  if (results && address) {
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === "success" && r.result) {
        const p = r.result as { status: number; id: bigint };
        if (p.status === 4) {
          disputed.push({ id: Number(p.id), arbitrator: "" });
        }
      }
    }
  }

  const handleResolve = async (policyId: number, uphold: boolean) => {
    try {
      await toast.promise(resolveDispute(policyId, uphold), {
        loading: uphold ? "Upholding dispute…" : "Rejecting dispute…",
        success: "Dispute resolved",
        error: (e: unknown) => (e instanceof Error ? e.message : "Failed"),
      });
    } catch {
      /* toast */
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Scale className="w-8 h-8 text-umbra-warning" />
          Arbitrator Portal
        </h1>
        <p className="text-sm text-umbra-muted mt-2">
          Disputed policies auto-grant trigger, payout, and ratio ACL to the assigned arbitrator.
        </p>
      </div>

      {disputed.length === 0 ? (
        <Card glass>
          <CardBody className="py-12 text-center text-sm text-umbra-muted">
            No disputed policies on this contract.
          </CardBody>
        </Card>
      ) : (
        disputed.map(({ id }) => (
          <ArbitratorPolicyCard
            key={id}
            policyId={id}
            address={address}
            onResolve={handleResolve}
            isPending={isPending}
          />
        ))
      )}
    </div>
  );
}

function ArbitratorPolicyCard({
  policyId,
  address,
  onResolve,
  isPending,
}: {
  policyId: number;
  address?: `0x${string}`;
  onResolve: (id: number, uphold: boolean) => void;
  isPending: boolean;
}) {
  const { data: policy } = usePolicy(policyId);
  const handles = usePolicyHandles(policyId);

  const isArb =
    policy &&
    address &&
    typeof policy === "object" &&
    "holder" in policy;

  return (
    <Card glass gradientBorder className="border-umbra-warning/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Policy #{policyId}</h2>
          <Badge variant="warning">Disputed</Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-umbra-muted mb-1">Trigger (ebool)</p>
            <EncryptedValue
              ctHash={handles.triggerHandle}
              valueType="bool"
              formatBool={(v) => (v ? "Triggered" : "Not triggered")}
            />
          </div>
          <div>
            <p className="text-xs text-umbra-muted mb-1">Payout</p>
            <EncryptedValue
              ctHash={handles.payoutHandle}
              unit="USDC"
              format={(raw) => "$" + (Number(raw) / 1_000_000).toLocaleString()}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/policy/${policyId}`}>
            <Button variant="ghost" size="sm">
              Full detail
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            disabled={!address || isPending}
            onClick={() => onResolve(policyId, true)}
          >
            Uphold
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!address || isPending}
            onClick={() => onResolve(policyId, false)}
          >
            Reject
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
