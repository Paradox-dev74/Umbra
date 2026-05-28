"use client";

import { motion } from "framer-motion";
import { usePolicyCountStat } from "@/hooks/useProtocolStats";
import { LIVE_ORACLE_FEED_KEYS, RISK_CATEGORIES } from "@/lib/constants";
import { umbraConfig } from "@/lib/config";
import { Shield, Radio, Lock, Layers } from "lucide-react";

const FEATURES = [
  {
    icon: Lock,
    label: "Encrypted policy terms on-chain",
    detail: "Coverage, premium, and triggers sealed via CoFHE",
  },
  {
    icon: Radio,
    label: "Verified Chainlink resolution",
    detail: `${LIVE_ORACLE_FEED_KEYS.length} live Sepolia feeds`,
  },
  {
    icon: Shield,
    label: "Privara confidential settlement",
    detail: umbraConfig.privaraEnabled ? "ReineiraOS escrow rail" : "Configure Privara to enable",
  },
  {
    icon: Layers,
    label: "Role-aware ACL & permits",
    detail: `${RISK_CATEGORIES.length} parametric risk categories · ${umbraConfig.contractVersion}`,
  },
];

export function StatsBar() {
  const { data: policyCount, isLoading } = usePolicyCountStat();
  const count = policyCount !== undefined ? Number(policyCount) : null;

  return (
    <section id="product" className="relative w-full border-y border-white/[0.06]">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "linear-gradient(90deg, rgba(34,211,238,0.04) 0%, transparent 50%, rgba(167,139,250,0.04) 100%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm text-umbra-muted uppercase tracking-widest mb-2">
            Live on Ethereum Sepolia
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {isLoading ? (
              <span className="encrypted-mask">Loading protocol…</span>
            ) : (
              <>
                <span className="text-umbra-cyan">{count ?? 0}</span>{" "}
                {count === 1 ? "policy" : "policies"} on-chain
              </>
            )}
          </h2>
          <p className="text-umbra-muted text-sm mt-2 max-w-xl mx-auto">
            Real contract state — no fabricated market metrics. Financial terms stay encrypted until
            permit-backed decrypt.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/[0.06] bg-umbra-card/80 p-6 hover:border-umbra-cyan/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-umbra-cyan/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-umbra-cyan" />
                </div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-umbra-muted mt-1">{item.detail}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
