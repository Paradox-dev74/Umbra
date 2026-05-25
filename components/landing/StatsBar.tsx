"use client";

import { motion } from "framer-motion";
import { StatCounter } from "@/components/ui/StatCounter";

const stats = [
  { value: 847, prefix: "$", suffix: "B+", label: "Parametric Insurance Market", decimals: 0 },
  { value: 100, prefix: "", suffix: "%", label: "Policy Terms Encrypted On-Chain", decimals: 0 },
  { value: 5, prefix: "", suffix: "", label: "Supported Risk Categories", decimals: 0 },
  { value: 0, prefix: "$", suffix: "", label: "Competitor Visibility Into Your Risk", decimals: 0 },
];

export function StatsBar() {
  return (
    <section id="product" className="relative w-full border-y border-white/[0.06]">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: "linear-gradient(90deg, rgba(34,211,238,0.04) 0%, transparent 50%, rgba(167,139,250,0.04) 100%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <StatCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
                label={stat.label}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
