"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { useFhenix } from "@/hooks/useFhenix";
import { useAccount } from "wagmi";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { useRefreshProximityFromChainlink } from "@/hooks/usePrivacyFeatures";
import { UMBRA_TRUSTED_ORACLE, UMBRA_V3_FEATURES } from "@/lib/constants";
import { getOracleValueForFeed, resolveFeedKeyFromAddress } from "@/lib/oracle-utils";
import { RISK_CATEGORIES } from "@/lib/constants";
import { FHESensitivityBand } from "@/components/dashboard/FHESensitivityBand";
import { toast } from "sonner";
import { Gauge, Zap } from "lucide-react";

interface TriggerProximityMonitorProps {
  policyId: number;
  riskCategory: number;
  oracleFeedAddress: string;
  thresholdHandle?: `0x${string}`;
  floorHandle?: `0x${string}`;
  ceilingHandle?: `0x${string}`;
  proximityHandle?: `0x${string}`;
  policyMode?: number;
  status: number;
}

export function TriggerProximityMonitor({
  policyId,
  riskCategory,
  oracleFeedAddress,
  floorHandle,
  ceilingHandle,
  proximityHandle,
  policyMode = 0,
  status,
}: TriggerProximityMonitorProps) {
  const { address } = useAccount();
  const { decryptBool, clientReady } = useFhenix();
  const { refreshProximity, isPending: isRefreshing } = useRefreshProximityFromChainlink();
  const chainlinkPrices = useChainlinkPrices();
  const isOracle =
    !!address && address.toLowerCase() === UMBRA_TRUSTED_ORACLE.toLowerCase();
  const [onChainFlag, setOnChainFlag] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const isBand = policyMode === 1;
  const category = RISK_CATEGORIES[riskCategory];
  const feedKey = resolveFeedKeyFromAddress(oracleFeedAddress);
  const live = feedKey ? getOracleValueForFeed(feedKey, chainlinkPrices) : null;
  const operator = isBand ? "FHE.and(gte,lte)" : (category?.fheOperator ?? "FHE.gte");
  const liveOracle = live?.value ?? 0;

  if (status !== 0 || (!proximityHandle && !UMBRA_V3_FEATURES)) return null;

  const analyzeOnChain = async () => {
    if (!isOracle) {
      toast.error("Only the trusted oracle wallet can refresh on-chain proximity");
      return;
    }
    if (!clientReady) {
      toast.error("CoFHE not ready");
      return;
    }
    setLoading(true);
    try {
      await toast.promise(refreshProximity(policyId), {
        loading: "Oracle reading Chainlink + updating ebool…",
        success: "On-chain proximity flag updated",
        error: (e: unknown) => (e instanceof Error ? e.message : "Update failed"),
      });
      if (proximityHandle) {
        const flag = await decryptBool(proximityHandle);
        setOnChainFlag(flag);
      }
    } catch {
      /* toast handles */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card glass gradientBorder className="border-amber-500/20">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Trigger Proximity</h3>
                <p className="text-xs text-umbra-muted">
                  On-chain ebool only — no client-side threshold comparison
                </p>
              </div>
            </div>
            <Badge variant="muted" className="text-[10px] font-mono">
              {operator}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-umbra-muted">
            <span>Public Chainlink feed:</span>
            <span className="text-white font-mono">{liveOracle.toLocaleString()}</span>
          </div>

          {UMBRA_V3_FEATURES && (
            <Button
              variant="primary"
              size="sm"
              onClick={analyzeOnChain}
              disabled={loading || isRefreshing || !clientReady || !isOracle}
            >
              <Zap className="w-3.5 h-3.5" />
              {loading || isRefreshing ? "Updating…" : "Refresh On-Chain Proximity"}
            </Button>
          )}

          {proximityHandle && (
            <FHESensitivityBand
              embedded
              proximityHandle={proximityHandle}
              operator={category?.fheOperator === "FHE.lte" ? "FHE.lte" : "FHE.gte"}
              title={isBand ? "Index Band Proximity" : "Threshold Proximity"}
            />
          )}

          {onChainFlag !== null && !proximityHandle && (
            <Badge variant={onChainFlag ? "warning" : "success"}>
              {onChainFlag ? "In proximity band" : "Outside proximity band"}
            </Badge>
          )}

          {isBand && floorHandle && ceilingHandle && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="text-[10px] text-umbra-muted">Floor (encrypted)</label>
                <EncryptedValue ctHash={floorHandle} format={(raw) => raw.toString()} compact />
              </div>
              <div>
                <label className="text-[10px] text-umbra-muted">Ceiling (encrypted)</label>
                <EncryptedValue ctHash={ceilingHandle} format={(raw) => raw.toString()} compact />
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
