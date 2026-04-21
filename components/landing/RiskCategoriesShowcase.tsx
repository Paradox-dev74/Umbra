/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Risk Categories Showcase
   Horizontal scrolling row of 5 category cards
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
    <section className="w-full bg-umbra-card py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold text-center mb-12"
        >
          <span className="text-white">Supported </span>
          <span className="text-umbra-blue">Risk Categories</span>
        </motion.h2>

        {/* Horizontal scroll container */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
          {RISK_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="snap-start"
            >
              <Card className="p-5 min-w-[280px] max-w-[300px] h-full flex flex-col" glow>
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {cat.label}
                </h3>
                <p className="text-xs text-umbra-muted mb-3">
                  Oracle: {categoryOracles[i].oracle}
                </p>
                <p className="text-sm text-umbra-muted flex-1 mb-4">
                  {categoryOracles[i].example}
                </p>
                <Badge variant="info" className="self-start font-mono text-[10px]">
                  {cat.fheOperator}
                </Badge>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
