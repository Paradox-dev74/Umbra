"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { RoleBanner } from "@/components/dashboard/RoleBanner";
import {
  usePolicyCount,
  usePolicy,
  usePolicyHandles,
  useResolveDispute,
  useDisputeArbitrator,
} from "@/hooks/useUmbraContract";
import { useUserRoles } from "@/hooks/useUserRole";
import { Scale, Shield } from "lucide-react";
import { toast } from "sonner";
import { useReadContracts } from "wagmi";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";

function DisputedPolicyCard({
  policyId,
  address,
}: {
  policyId: number;
  address?: `0x${string}`;
}) {
  const { data: policy } = usePolicy(policyId);
  const { data: arbitrator } = useDisputeArbitrator(policyId);
  const handles = usePolicyHandles(policyId);
  const { resolveDispute, isPending } = useResolveDispute();

  const isAssigned =
    !!address &&
    !!arbitrator &&
    (arbitrator as string).toLowerCase() === address.toLowerCase();

  if (!policy || policy.status !== 4) return null;

  const handleResolve = async (uphold: boolean) => {
    if (!isAssigned) {
      toast.error("Only the assigned arbitrator can resolve this dispute");
      return;
    }
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
    <Card glass className={isAssigned ? "border-umbra-warning/30" : "opacity-60"}>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link href={`/dashboard/policy/${policyId}`} className="text-white font-semibold hover:text-umbra-cyan">
              Policy #{policyId}
            </Link>
            <p className="text-xs text-umbra-muted mt-1">
              Arbitrator: {(arbitrator as string)?.slice(0, 10)}…
            </p>
          </div>
          {isAssigned ? (
            <Badge variant="warning">Assigned to you</Badge>
          ) : (
            <Badge variant="muted">Not your assignment</Badge>
          )}
        </div>

        {handles.triggerHandle && (
          <EncryptedValue
            ctHash={handles.triggerHandle}
            valueType="bool"
            formatBool={(raw) => (raw ? "Trigger upheld" : "Trigger rejected")}
          />
        )}

        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={!isAssigned || isPending}
            onClick={() => handleResolve(true)}
          >
            Uphold
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!isAssigned || isPending}
            onClick={() => handleResolve(false)}
          >
            Reject
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function ArbitratorPage() {
  const { address } = useAccount();
  const { roles } = useUserRoles();
  const { data: countData } = usePolicyCount();
  const count = countData ? Number(countData) : 0;

  const contracts = Array.from({ length: count }, (_, i) => ({
    address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
    abi: UMBRA_ABI,
    functionName: "getPolicy" as const,
    args: [BigInt(i)],
  }));

  const { data: results, isLoading } = useReadContracts({
    contracts,
    query: { enabled: count > 0 },
  });

  const disputedIds: number[] = [];
  if (results) {
    for (const r of results) {
      if (r.status === "success" && r.result) {
        const p = r.result as { status: number; id: bigint };
        if (p.status === 4) disputedIds.push(Number(p.id));
      }
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <RoleBanner roles={roles} />
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Scale className="w-8 h-8 text-umbra-warning" />
          Arbitrator Portal
        </h1>
        <p className="text-sm text-umbra-muted mt-2">
          Only the assigned arbitrator wallet can sealed-decrypt and resolve a disputed policy.
        </p>
      </div>

      {!address && (
        <Card glass>
          <CardBody className="py-8 text-center text-sm text-umbra-muted">
            Connect wallet to view assigned disputes.
          </CardBody>
        </Card>
      )}

      {address && disputedIds.length === 0 && !isLoading && (
        <Card glass>
          <CardBody className="py-12 text-center text-sm text-umbra-muted">
            <Shield className="w-8 h-8 mx-auto mb-3 text-umbra-success opacity-60" />
            No disputed policies on this contract.
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        {disputedIds.map((id) => (
          <DisputedPolicyCard key={id} policyId={id} address={address} />
        ))}
      </div>
    </div>
  );
}
