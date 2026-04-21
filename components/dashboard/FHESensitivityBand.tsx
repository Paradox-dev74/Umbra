"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCofheClient } from "@cofhe/react";
import { useFhenix } from "@/hooks/useFhenix";
import { encryptProximityBand } from "@/lib/fhenix";
import { toast } from "sonner";
import { Radar, Lock } from "lucide-react";

interface FHESensitivityBandProps {
  oracleValue: number;
  thresholdHandle?: `0x${string}`;
  operator?: "FHE.gte" | "FHE.lte";
  bandPercent?: number;
  title?: string;
  embedded?: boolean;
}

export function FHESensitivityBand({
  oracleValue,
  thresholdHandle,
  operator = "FHE.gte",
  bandPercent = 10,
  title = "FHE Sensitivity Band",
  embedded = false,
}: FHESensitivityBandProps) {
  const client = useCofheClient();
  const { decryptValue, clientReady } = useFhenix();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    withinBand: boolean;
    distancePct: number;
    wouldTrigger: boolean;
    bandLabel: string;
  } | null>(null);

  const analyze = async () => {
    if (!thresholdHandle || !clientReady || !client) {
      toast.error("CoFHE not ready");
      return;
    }
    setLoading(true);
    try {
      const rawThreshold = await decryptValue(thresholdHandle);
      const threshold = Number(rawThreshold);
      const band = await encryptProximityBand(
        client,
        BigInt(Math.round(oracleValue)),
        BigInt(Math.round(threshold)),
        bandPercent
      );
      const wouldTrigger = operator === "FHE.lte" ? band.wouldTriggerLte : band.wouldTriggerGte;
      const bandLabel = band.withinBand
        ? `Within ±${bandPercent}% encrypted band`
        : `Outside ±${bandPercent}% band · ${band.distancePct}% of threshold`;
      setResult({
        withinBand: band.withinBand,
        distancePct: band.distancePct,
        wouldTrigger,
        bandLabel,
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Band analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const inner = (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-umbra-violet/10 flex items-center justify-center">
          <Radar className="w-5 h-5 text-umbra-violet" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-umbra-muted">
            Encrypt proximity via CoFHE · threshold stays sealed on-chain
          </p>
        </div>
      </div>

      {!result ? (
        <Button variant="violet" size="sm" onClick={analyze} disabled={loading || !clientReady || !thresholdHandle}>
          <Lock className="w-3.5 h-3.5" />
          {loading ? "Encrypting band…" : "Run FHE Band Analysis"}
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, result.distancePct)}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${
                result.wouldTrigger ? "bg-gradient-to-r from-umbra-warning to-umbra-danger" : "bg-gradient-to-r from-umbra-cyan to-umbra-success"
              }`}
            />
          </div>
          <p className="text-xs text-umbra-muted font-mono">{result.bandLabel}</p>
          <div className="flex items-center justify-between">
            <Badge variant={result.wouldTrigger ? "warning" : "success"}>
              {result.wouldTrigger ? "Homomorphic trigger: YES" : "Homomorphic trigger: NO"}
            </Badge>
            <span className="text-[10px] text-umbra-violet font-mono">{operator}</span>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setResult(null)}>
            Clear analysis
          </Button>
        </motion.div>
      )}
    </div>
  );

  if (embedded) return inner;

  return (
    <Card glass gradientBorder className="border-umbra-violet/20">
      <CardBody>{inner}</CardBody>
    </Card>
  );
}
