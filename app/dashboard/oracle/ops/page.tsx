"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAllActivePolicies } from "@/hooks/useUmbraContract";
import { useResolveWithChainlink } from "@/hooks/usePrivacyFeatures";
import { useRefreshProximityFromChainlink } from "@/hooks/usePrivacyFeatures";
import { UMBRA_TRUSTED_ORACLE } from "@/lib/constants";
import { ORACLE_FEEDS } from "@/lib/constants";
import { resolveFeedKeyFromAddress, getOracleValueForFeed } from "@/lib/oracle-utils";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { formatAddress } from "@/lib/utils";
import { toast } from "sonner";
import { Radio, Zap, Gauge, ExternalLink } from "lucide-react";

export default function OracleOpsPage() {
  const { address } = useAccount();
  const { policies, isLoading, refetch } = useAllActivePolicies();
  const { resolveWithChainlink, isPending: resolving } = useResolveWithChainlink();
  const { refreshProximity, isPending: refreshing } = useRefreshProximityFromChainlink();
  const chainlinkPrices = useChainlinkPrices();

  const isOracle =
    !!address && address.toLowerCase() === UMBRA_TRUSTED_ORACLE.toLowerCase();

  const handleResolve = async (policyId: number) => {
    try {
      await toast.promise(resolveWithChainlink(policyId), {
        loading: "Resolving via Chainlink…",
        success: "Policy resolved on-chain",
        error: (e: unknown) => (e instanceof Error ? e.message : "Resolve failed"),
      });
      refetch();
    } catch {
      /* toast */
    }
  };

  const handleProximity = async (policyId: number) => {
    try {
      await toast.promise(refreshProximity(policyId), {
        loading: "Updating proximity ebool…",
        success: "Proximity flag updated",
        error: (e: unknown) => (e instanceof Error ? e.message : "Update failed"),
      });
    } catch {
      /* toast */
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Radio className="w-8 h-8 text-umbra-cyan" />
          Oracle Operator Console
        </h1>
        <p className="text-sm text-umbra-muted mt-2">
          Trusted oracle:{" "}
          <span className="font-mono text-umbra-cyan">{formatAddress(UMBRA_TRUSTED_ORACLE, 6)}</span>
        </p>
        {!isOracle && (
          <Badge variant="warning" className="mt-3">
            Connect the trusted oracle wallet to resolve policies
          </Badge>
        )}
      </div>

      <Card glass gradientBorder>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Active Policy Queue</h2>
          <p className="text-xs text-umbra-muted">
            {policies.length} active {policies.length === 1 ? "policy" : "policies"} awaiting resolution
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-umbra-muted py-8 text-center">Loading…</p>
          ) : policies.length === 0 ? (
            <p className="text-sm text-umbra-muted py-8 text-center border border-dashed border-white/10 rounded-xl">
              No active policies on this contract.
            </p>
          ) : (
            policies.map((p) => {
              const feedKey = resolveFeedKeyFromAddress(p.oracleFeed as string);
              const feed = feedKey ? ORACLE_FEEDS[feedKey] : undefined;
              const live = feedKey ? getOracleValueForFeed(feedKey, chainlinkPrices) : null;
              const id = Number(p.id);
              return (
                <div
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      Policy #{id}{" "}
                      <Badge variant="info" className="ml-1 text-[10px]">
                        {p.policyMode === 1 ? "Band" : "Single"}
                      </Badge>
                    </p>
                    <p className="text-xs text-umbra-muted mt-1">
                      {feed?.name ?? "Unknown feed"} · holder {formatAddress(p.holder, 4)}
                    </p>
                    {live && (
                      <p className="text-xs text-umbra-cyan font-mono mt-1">
                        Live: {live.value.toLocaleString()} {feed?.unit}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/policy/${id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Detail
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isOracle || refreshing}
                      onClick={() => handleProximity(id)}
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      Proximity
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!isOracle || resolving}
                      onClick={() => handleResolve(id)}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Resolve
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}
