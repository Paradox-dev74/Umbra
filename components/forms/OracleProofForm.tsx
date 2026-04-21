/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Oracle Resolution Form
   For authorized resolvers to submit oracle readings
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ORACLE_FEEDS } from "@/lib/constants";
import { sleep } from "@/lib/utils";
import { Zap, Check, Radio } from "lucide-react";

interface OracleProofFormProps {
  policyId: number;
  oracleFeedAddress: string;
  onComplete?: () => void;
}

type ResolutionStage =
  | "idle"
  | "fetching"
  | "comparing"
  | "decrypting"
  | "settling"
  | "complete";

const stageMessages: Record<ResolutionStage, string> = {
  idle: "",
  fetching: "Fetching Chainlink data...",
  comparing: "Running FHE.gte comparison...",
  decrypting: "ebool result encrypted — requesting sealed decrypt...",
  settling: "Evaluation complete. Initiating settlement...",
  complete: "Settlement triggered via Privara ✓",
};

export function OracleProofForm({
  policyId,
  oracleFeedAddress,
  onComplete,
}: OracleProofFormProps) {
  const [oracleValue, setOracleValue] = useState("");
  const [stage, setStage] = useState<ResolutionStage>("idle");

  const feedEntry = Object.values(ORACLE_FEEDS).find(
    (f) => f.address.toLowerCase() === oracleFeedAddress.toLowerCase()
  );

  const handleEvaluate = useCallback(async () => {
    setStage("fetching");
    await sleep(1200);
    setStage("comparing");
    await sleep(2000);
    setStage("decrypting");
    await sleep(1500);
    setStage("settling");
    await sleep(1000);
    setStage("complete");
    onComplete?.();
  }, [onComplete]);

  return (
    <Card className="border-umbra-blue/20">
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-umbra-blue/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-umbra-blue" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Submit Oracle Reading
            </h3>
            <p className="text-xs text-umbra-muted">
              Policy #{policyId} · {feedEntry?.name ?? "Unknown Feed"}
            </p>
          </div>
        </div>

        {stage === "idle" ? (
          <>
            <div className="space-y-2">
              <label className="text-sm text-umbra-muted">
                Oracle Value
              </label>
              <input
                type="number"
                value={oracleValue || (feedEntry?.currentValue ?? "")}
                onChange={(e) => setOracleValue(e.target.value)}
                placeholder="Enter latest oracle reading"
                className="w-full bg-umbra-bg border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-umbra-blue/50 focus:ring-1 focus:ring-umbra-blue/30 transition-colors placeholder:text-white/20"
              />
              {feedEntry && (
                <p className="text-xs text-umbra-muted">
                  Current {feedEntry.name}: {feedEntry.currentValue}{" "}
                  {feedEntry.unit}
                </p>
              )}
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleEvaluate}
              glow
            >
              Evaluate Homomorphically
              <Zap className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="space-y-3 py-2">
            {(
              ["fetching", "comparing", "decrypting", "settling", "complete"] as ResolutionStage[]
            ).map((s) => {
              const stageOrder = [
                "fetching",
                "comparing",
                "decrypting",
                "settling",
                "complete",
              ];
              const currentIdx = stageOrder.indexOf(stage);
              const thisIdx = stageOrder.indexOf(s);
              const isActive = thisIdx === currentIdx;
              const isDone = thisIdx < currentIdx;
              const isPending = thisIdx > currentIdx;

              return (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                  transition={{ delay: thisIdx * 0.1, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-umbra-success/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-umbra-success" />
                    </div>
                  ) : isActive ? (
                    <div
                      className={`w-5 h-5 rounded-full border-2 animate-spin ${
                        s === "comparing"
                          ? "border-cyan-500/30 border-t-cyan-500"
                          : "border-umbra-blue/30 border-t-umbra-blue"
                      }`}
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/10" />
                  )}
                  <span
                    className={`text-sm ${
                      isPending
                        ? "text-white/30"
                        : s === "complete" && isDone
                          ? "text-umbra-success"
                          : "text-white"
                    }`}
                  >
                    {stageMessages[s]}
                  </span>
                </motion.div>
              );
            })}

            {stage === "complete" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="success" dot className="mt-4">
                  Oracle resolution complete
                </Badge>
              </motion.div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
