"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LandingSection } from "./LandingSection";
import { RISK_CATEGORIES } from "@/lib/constants";

const categoryOracles = [
  { oracle: "Baltic Dry Index", example: "Shipping delays exceed insured threshold" },
  { oracle: "Chainlink BTC/USD", example: "Commodity drops below encrypted strike" },
  { oracle: "AccuWeather API", example: "Temperature index exceeds hidden limit" },
  { oracle: "Freightos FBX", example: "Container rates spike past coverage level" },
  { oracle: "Chainlink ETH/USD", example: "FX volatility triggers treasury hedge" },
];

export function RiskCategoriesShowcase() {
  return (
    <LandingSection
      className="bg-umbra-card/40 border-y border-white/[0.04]"
      eyebrow="Coverage"
      title={
        <>
          Five risk categories.{" "}
          <span className="text-umbra-cyan">One privacy model.</span>
        </>
      }
    >
      <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
        {RISK_CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className="snap-start shrink-0"
          >
            <Card glass hover className="p-6 w-[280px] h-full flex flex-col">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="text-lg font-bold text-white mb-1">{cat.label}</h3>
              <p className="text-xs text-umbra-muted mb-2">Oracle: {categoryOracles[i].oracle}</p>
              <p className="text-sm text-umbra-muted flex-1 mb-4 leading-relaxed">
                {categoryOracles[i].example}
              </p>
              <Badge variant="info" className="self-start font-mono text-[10px]">
                {cat.fheOperator}
              </Badge>
            </Card>
          </motion.div>
        ))}
      </div>
    </LandingSection>
  );
}
