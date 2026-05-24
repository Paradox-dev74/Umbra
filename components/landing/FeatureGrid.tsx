/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Feature Grid (6 cards, 3×2)
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import {
  EyeOff,
  GitBranch,
  Radio,
  ShieldCheck,
  KeyRound,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: EyeOff,
    title: "Zero Threshold Exposure",
    body: "Your strike price never touches the blockchain in plaintext. FHE ensures your trigger threshold is encrypted at rest and during every oracle comparison.",
    gradient: "from-umbra-blue/30 via-transparent to-transparent",
    iconBg: "bg-umbra-blue/10",
    iconColor: "text-umbra-blue",
  },
  {
    icon: GitBranch,
    title: "Branchless Settlement",
    body: "FHE.select prevents side-channel leakage. No public branching means external observers cannot infer payout outcomes from execution patterns.",
    gradient: "from-umbra-violet/30 via-transparent to-transparent",
    iconBg: "bg-umbra-violet/10",
    iconColor: "text-umbra-violet",
  },
  {
    icon: Radio,
    title: "Real Chainlink Oracles",
    body: "Live Chainlink price feeds on Sepolia are evaluated homomorphically against your encrypted thresholds — oracle values are public, your threshold is not.",
    gradient: "from-amber-500/30 via-transparent to-transparent",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: ShieldCheck,
    title: "Confidential Payouts",
    body: "Privara hides transfer amounts and treasury movements. Settlement executes without revealing your financial exposure to counterparties or observers.",
    gradient: "from-umbra-success/30 via-transparent to-transparent",
    iconBg: "bg-umbra-success/10",
    iconColor: "text-umbra-success",
  },
  {
    icon: KeyRound,
    title: "Sealed Decryption",
    body: "Only you can read your policy parameters using CoFHE sealed output. The Threshold Network performs decryption — no single party holds a decryption key.",
    gradient: "from-rose-500/30 via-transparent to-transparent",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-400",
  },
  {
    icon: Layers,
    title: "5 Risk Categories",
    body: "Supply chain delays, weather indices, commodity prices, shipping costs, and FX volatility — all with FHE-protected hidden thresholds on Ethereum Sepolia.",
    gradient: "from-cyan-500/30 via-transparent to-transparent",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="w-full bg-umbra-bg py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold">
            <span className="text-white">Built for </span>
            <span className="text-umbra-blue">Enterprise </span>
            <span className="text-white">Privacy</span>
          </h2>
        </motion.div>

        {/* 6-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.08,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
            >
              {/* Gradient border wrapper */}
              <div
                className={`group relative rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] transition-all duration-300 hover:opacity-100 h-full`}
              >
                <Card
                  className="relative h-full rounded-xl p-6 bg-umbra-card transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.05)]"
                >
                  <div className={`w-10 h-10 rounded-lg ${feature.iconBg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-umbra-muted leading-relaxed">
                    {feature.body}
                  </p>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
