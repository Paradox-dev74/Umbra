"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EncryptedValue } from "@/components/ui/EncryptedValue";
import { useFhenix } from "@/hooks/useFhenix";
import { useAccount } from "wagmi";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { useRefreshProximityFromChainlink } from "@/hooks/usePrivacyFeatures";
import { UMBRA_TRUSTED_ORACLE } from "@/lib/constants";
import { getOracleValueForFeed, resolveFeedKeyFromAddress } from "@/lib/oracle-utils";
import { RISK_CATEGORIES, UMBRA_V3_FEATURES } from "@/lib/constants";
import { FHESensitivityBand } from "@/components/dashboard/FHESensitivityBand";
import { toast } from "sonner";
import { Gauge, Lock, Eye, EyeOff, Zap } from "lucide-react";

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
  thresholdHandle,
  floorHandle,
  ceilingHandle,
  proximityHandle,
  policyMode = 0,
  status,
}: TriggerProximityMonitorProps) {
  const { address } = useAccount();
  const { decryptValue, decryptBool, clientReady } = useFhenix();
  const { refreshProximity, isPending: isRefreshing } = useRefreshProximityFromChainlink();
  const chainlinkPrices = useChainlinkPrices();
  const isOracle =
    !!address && address.toLowerCase() === UMBRA_TRUSTED_ORACLE.toLowerCase();
  const [mode, setMode] = useState<"onchain" | "band" | "full">(
    UMBRA_V3_FEATURES ? "onchain" : "band"
  );
  const [proximity, setProximity] = useState<{
    oracle: number;
    threshold: number;
    wouldTrigger: boolean;
  } | null>(null);
  const [onChainFlag, setOnChainFlag] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const isBand = policyMode === 1;
  const boundHandle = isBand ? floorHandle : thresholdHandle;

  if (status !== 0 || (!boundHandle && !proximityHandle)) return null;

  const category = RISK_CATEGORIES[riskCategory];
  const feedKey = resolveFeedKeyFromAddress(oracleFeedAddress);
  const live = feedKey ? getOracleValueForFeed(feedKey, chainlinkPrices) : null;
  const operator = isBand ? "FHE.and(gte,lte)" : (category?.fheOperator ?? "FHE.gte");
  const isLte = category?.fheOperator === "FHE.lte";
  const liveOracle = live?.value ?? 0;

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

  const analyze = async () => {
    if (!clientReady || !boundHandle) {
      toast.error("CoFHE not ready");
      return;
    }
    setLoading(true);
    try {
      const rawThreshold = await decryptValue(boundHandle);
      const threshold = Number(rawThreshold);
      const oracle = live?.value ?? threshold;
      const wouldTrigger = isBand
        ? proximityHandle
          ? await decryptBool(proximityHandle)
          : oracle >= threshold
        : isLte
          ? oracle <= threshold
          : oracle >= threshold;
      setProximity({ oracle, threshold, wouldTrigger: Boolean(wouldTrigger) });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const riskPct = proximity
    ? Math.min(100, (proximity.oracle / Math.max(proximity.threshold, 1)) * 100)
    : 0;

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
                  {isBand ? "Index band · homomorphic in-band check" : "FHE-aware risk distance"}
                </p>
              </div>
            </div>
            <div className="flex rounded-lg border border-white/10 p-0.5 bg-black/20">
              {UMBRA_V3_FEATURES && (
                <button
                  type="button"
                  onClick={() => setMode("onchain")}
                  className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                    mode === "onchain" ? "bg-umbra-cyan/20 text-umbra-cyan" : "text-umbra-muted"
                  }`}
                >
                  On-chain
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode("band")}
                className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                  mode === "band" ? "bg-umbra-violet/20 text-umbra-violet" : "text-umbra-muted"
                }`}
              >
                Band
              </button>
              <button
                type="button"
                onClick={() => setMode("full")}
                className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                  mode === "full" ? "bg-umbra-warning/20 text-umbra-warning" : "text-umbra-muted"
                }`}
              >
                Full
              </button>
            </div>
          </div>

          {mode === "onchain" && UMBRA_V3_FEATURES ? (
            <div className="space-y-3">
              <p className="text-xs text-umbra-muted">
                Oracle-only: reads Chainlink inside the contract, then sealed-decrypt{" "}
                <strong>ebool only</strong> — bounds stay hidden.
              </p>
              <div className="flex items-center gap-2 text-xs text-umbra-muted">
                <span>Live oracle:</span>
                <span className="text-white font-mono">{liveOracle.toLocaleString()}</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={analyzeOnChain}
                disabled={loading || isRefreshing || !clientReady || !isOracle}
              >
                <Zap className="w-3.5 h-3.5" />
                {loading || isRefreshing ? "Updating…" : "Refresh On-Chain Proximity"}
              </Button>
              {(onChainFlag !== null || proximityHandle) && (
                <div className="space-y-2">
                  <label className="text-xs text-umbra-muted uppercase tracking-wider">
                    Proximity Flag (ebool)
                  </label>
                  {proximityHandle ? (
                    <EncryptedValue
                      ctHash={proximityHandle}
                      valueType="bool"
                      formatBool={(raw) =>
                        raw
                          ? isBand
                            ? "✓ Oracle within encrypted band"
                            : "✓ Would trigger (homomorphic)"
                          : "✗ Outside trigger condition"
                      }
                    />
                  ) : onChainFlag !== null ? (
                    <Badge variant={onChainFlag ? "warning" : "success"}>
                      {onChainFlag ? "In band / triggered" : "Not triggered"}
                    </Badge>
                  ) : null}
                </div>
              )}
              {isBand && floorHandle && ceilingHandle && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] text-umbra-muted">Floor</label>
                    <EncryptedValue ctHash={floorHandle} format={(raw) => raw.toString()} compact />
                  </div>
                  <div>
                    <label className="text-[10px] text-umbra-muted">Ceiling</label>
                    <EncryptedValue ctHash={ceilingHandle} format={(raw) => raw.toString()} compact />
                  </div>
                </div>
              )}
            </div>
          ) : mode === "band" ? (
            <FHESensitivityBand
              embedded
              oracleValue={liveOracle}
              thresholdHandle={boundHandle}
              operator={isLte ? "FHE.lte" : "FHE.gte"}
              bandPercent={12}
              title={isBand ? "Index Band Monitor" : "Encrypted Sensitivity Band"}
            />
          ) : !proximity ? (
            <Button variant="outline" size="sm" onClick={analyze} disabled={loading || !clientReady}>
              <Lock className="w-3.5 h-3.5" />
              {loading ? "Analyzing…" : "Reveal Full Comparison"}
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-umbra-muted flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Live oracle
                </span>
                <span className="text-white font-mono">{proximity.oracle.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-umbra-muted flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Bound (local decrypt)
                </span>
                <span className="text-umbra-violet font-mono">{proximity.threshold.toLocaleString()}</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${riskPct}%` }}
                  className={`h-full rounded-full ${proximity.wouldTrigger ? "bg-umbra-warning" : "bg-umbra-success"}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={proximity.wouldTrigger ? "warning" : "success"}>
                  {proximity.wouldTrigger ? "Would trigger now" : "Within safe range"}
                </Badge>
                <span className="text-[10px] text-umbra-muted font-mono">{operator}</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setProximity(null)}>
                Hide analysis
              </Button>
            </motion.div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
