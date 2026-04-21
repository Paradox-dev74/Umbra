/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Animated Stats Bar
   ═══════════════════════════════════════════════════════════ */

"use client";

import { StatCounter } from "@/components/ui/StatCounter";

const stats = [
  { value: 847, prefix: "$", suffix: "B+", label: "Parametric Insurance Market", decimals: 0 },
  { value: 100, prefix: "", suffix: "%", label: "Policy Terms Encrypted On-Chain", decimals: 0 },
  { value: 2.1, prefix: "", suffix: "s", label: "Average FHE Oracle Resolution", decimals: 1 },
  { value: 0, prefix: "$", suffix: "", label: "Competitor Visibility Into Your Risk", decimals: 0 },
];

export function StatsBar() {
  return (
    <section className="w-full bg-umbra-card border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StatCounter
              key={i}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
