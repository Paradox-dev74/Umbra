/* ═══════════════════════════════════════════════════════════
   Oracle Resolution — on-chain Chainlink (max privacy) or manual fallback
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { useResolveWithOracle } from "@/hooks/useUmbraContract";
import { useResolveWithChainlink, useOracleMaxStaleness } from "@/hooks/usePrivacyFeatures";
import { findFeedByAddress, getOracleValueForFeed, oracleValueToUint64, resolveFeedKeyFromAddress, formatOraclePrice } from "@/lib/oracle-utils";
import { UMBRA_TRUSTED_ORACLE } from "@/lib/constants";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Zap, Check, Radio, ExternalLink, RefreshCw, Link2, Clock } from "lucide-react";

interface OracleProofFormProps {
  policyId: number;
  oracleFeedAddress: string;
  riskCategory?: number;
  onComplete?: () => void;
}

type ResolutionStage = "idle" | "fetching" | "submitting" | "complete";

export function OracleProofForm({
  policyId,
  oracleFeedAddress,
  riskCategory = 0,
  onComplete,
}: OracleProofFormProps) {
  const router = useRouter();
  const { address } = useAccount();
  const chainlinkPrices = useChainlinkPrices();
  const { resolveWithOracle, isPending: manualPending } = useResolveWithOracle();
  const { resolveWithChainlink, isPending: chainlinkPending } = useResolveWithChainlink();
  const { data: maxStalenessSec } = useOracleMaxStaleness();

  const feedEntry = useMemo(
    () => findFeedByAddress(oracleFeedAddress),
    [oracleFeedAddress]
  );
  const feedKey = feedEntry?.[0];
  const feed = feedEntry?.[1];
  const hasOnChainFeed = !!feed?.chainlinkAddress;

  const liveData = feedKey ? getOracleValueForFeed(feedKey, chainlinkPrices) : null;
  const chainlinkMeta = feedKey ? chainlinkPrices[feedKey] : null;
  const defaultValue = liveData?.value ?? null;

  const [oracleValue, setOracleValue] = useState("");
  const [stage, setStage] = useState<ResolutionStage>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [usedChainlink, setUsedChainlink] = useState(false);

  const displayValue = oracleValue || (defaultValue !== null ? String(defaultValue) : "");
  const operator = riskCategory === 1 ? "FHE.lte" : "FHE.gte";
  const isPending = manualPending || chainlinkPending;

  const isOracleWallet =
    address?.toLowerCase() === UMBRA_TRUSTED_ORACLE.toLowerCase();

  const stalenessLimit = maxStalenessSec ? Number(maxStalenessSec) : 3600;
  const feedAgeSec = chainlinkMeta?.updatedAt
    ? Math.floor(Date.now() / 1000) - chainlinkMeta.updatedAt
    : null;
  const isFeedStale = chainlinkMeta?.isStale ?? (feedAgeSec !== null && feedAgeSec > stalenessLimit);

  const runChainlinkResolve = useCallback(async () => {
    if (!isOracleWallet) {
      toast.error("Connect the trusted oracle wallet to resolve policies");
      return;
    }
    if (isFeedStale) {
      toast.error(`Chainlink feed stale — must update within ${stalenessLimit}s (contract oracleMaxStaleness)`);
      return;
    }
    setStage("submitting");
    setUsedChainlink(true);
    try {
      const hash = await toast.promise(resolveWithChainlink(policyId), {
        loading: "Reading Chainlink on-chain → FHE compare…",
        success: "On-chain oracle + homomorphic resolution complete",
        error: (e: unknown) =>
          `Chainlink resolve failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      });
      setTxHash(String(hash));
      setStage("complete");
      onComplete?.();
    } catch {
      setStage("idle");
      setUsedChainlink(false);
    }
  }, [policyId, resolveWithChainlink, onComplete, isOracleWallet, isFeedStale, stalenessLimit]);

  const runManualResolve = useCallback(async () => {
    if (!isOracleWallet) {
      toast.error("Connect the trusted oracle wallet to resolve policies");
      return;
    }
    setStage("fetching");
    try {
      const numericValue = parseFloat(displayValue);
      if (Number.isNaN(numericValue) || numericValue <= 0) {
        throw new Error("Enter a valid oracle value");
      }
      const onChainValue = oracleValueToUint64(numericValue, feedKey);
      setStage("submitting");
      setUsedChainlink(false);
      const hash = await toast.promise(resolveWithOracle(policyId, onChainValue), {
        loading: `Submitting ${operator} + FHE.and(ratioValid)…`,
        success: "Oracle resolution submitted",
        error: (e: unknown) =>
          `Resolution failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      });
      setTxHash(String(hash));
      setStage("complete");
      onComplete?.();
    } catch (e: unknown) {
      setStage("idle");
      if (!(e instanceof Error && e.message.includes("Resolution failed"))) {
        toast.error(e instanceof Error ? e.message : "Oracle resolution failed");
      }
    }
  }, [displayValue, feedKey, operator, policyId, resolveWithOracle, onComplete, isOracleWallet]);

  return (
    <Card glass gradientBorder className="border-umbra-cyan/20">
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-umbra-blue/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-umbra-blue" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Resolve with Oracle</h3>
            <p className="text-xs text-umbra-muted">
              Policy #{policyId} · {feed?.name ?? "Unknown"} ·{" "}
              <code className="text-umbra-blue">{operator}</code> +{" "}
              <code className="text-umbra-violet">FHE.and(ratioValid)</code>
            </p>
          </div>
          {hasOnChainFeed && (
            <Badge variant="success" className="text-[10px]">
              On-chain Chainlink
            </Badge>
          )}
        </div>

        {!isOracleWallet && address && (
          <div className="rounded-lg border border-umbra-warning/30 bg-umbra-warning/5 px-3 py-2 text-xs text-umbra-warning">
            Oracle resolution requires wallet {UMBRA_TRUSTED_ORACLE.slice(0, 10)}…
          </div>
        )}

        {stage === "idle" || stage === "fetching" ? (
          <>
            {hasOnChainFeed ? (
              <div className="rounded-lg border border-umbra-success/20 bg-umbra-success/5 px-4 py-3 space-y-2">
                <p className="text-xs text-umbra-success flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5" />
                  Recommended: contract reads Chainlink directly — threshold stays encrypted
                </p>
                {liveData?.value != null && (
                  <p className="text-xs text-umbra-muted">
                    Live preview: {formatOraclePrice(liveData.value, feed?.unit ?? "USD")}
                    {feedAgeSec !== null && (
                      <span className={isFeedStale ? " text-umbra-warning" : " text-umbra-success"}>
                        {" "}· updated {feedAgeSec}s ago
                      </span>
                    )}
                  </p>
                )}
                {isFeedStale && (
                  <div className="rounded-lg border border-umbra-warning/30 bg-umbra-warning/5 px-3 py-2 text-xs text-umbra-warning flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Feed exceeds oracleMaxStaleness ({stalenessLimit}s) — resolveWithChainlink will revert
                  </div>
                )}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={runChainlinkResolve}
                  disabled={isPending || isFeedStale}
                  glow
                >
                  Resolve via On-Chain Chainlink
                  <Zap className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm text-umbra-muted">Oracle Value</label>
                  <input
                    type="number"
                    value={oracleValue || String(defaultValue)}
                    onChange={(e) => setOracleValue(e.target.value)}
                    className="w-full bg-umbra-bg border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono"
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={runManualResolve}
                  disabled={isPending}
                  glow
                >
                  Submit Oracle & FHE Compare
                  <Zap className="w-4 h-4" />
                </Button>
              </>
            )}

            {hasOnChainFeed && (
              <details className="text-xs text-umbra-muted">
                <summary className="cursor-pointer hover:text-white">Manual oracle override</summary>
                <div className="mt-3 space-y-2">
                  <input
                    type="number"
                    value={oracleValue || String(defaultValue)}
                    onChange={(e) => setOracleValue(e.target.value)}
                    className="w-full bg-umbra-bg border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                  />
                  <Button variant="outline" size="sm" className="w-full" onClick={runManualResolve} disabled={isPending}>
                    Manual resolveWithOracle
                  </Button>
                </div>
              </details>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-umbra-success/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-umbra-success" />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Resolution complete</p>
                <p className="text-xs text-umbra-muted">
                  {usedChainlink ? "Chainlink read on-chain" : "Manual oracle"} · encrypted ebool + FHE.select payout
                </p>
              </div>
            </div>
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-umbra-blue font-mono hover:underline"
              >
                {txHash.slice(0, 24)}…
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <Button variant="primary" className="w-full" onClick={() => router.push(`/settle/${policyId}`)}>
              Continue to Settlement
              <Zap className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </CardBody>
    </Card>
  );
}

export { resolveFeedKeyFromAddress };
