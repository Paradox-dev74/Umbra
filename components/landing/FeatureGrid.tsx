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
    body: "Competitors never learn your strike price. FHE ensures your trigger threshold is encrypted at rest and during computation.",
  },
  {
    icon: GitBranch,
    title: "Branchless Settlement",
    body: "FHE.select prevents side-channel leakage. No public branching means observers cannot infer outcomes from execution patterns.",
  },
  {
    icon: Radio,
    title: "Live Oracle Integration",
    body: "Chainlink feeds are evaluated homomorphically against your encrypted thresholds in real-time on every oracle update.",
  },
  {
    icon: ShieldCheck,
    title: "Confidential Payouts",
    body: "Privara hides transfer amounts and treasury movements. Settlement details remain indistinguishable to external observers.",
  },
  {
    icon: KeyRound,
    title: "Sealed Decryption",
    body: "Only you can read your policy parameters using Fhenix sealed output. Zero third-party decryption keys required.",
  },
  {
    icon: Layers,
    title: "Multi-Risk Categories",
    body: "Supply chain delays, weather indices, commodity prices, shipping costs, and FX volatility — all with FHE-protected thresholds.",
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
              <Card
                className="p-6 h-full transition-all duration-300 hover:border-umbra-blue/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.06)]"
                hover
              >
                <div className="w-10 h-10 rounded-lg bg-umbra-blue/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-umbra-blue" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-umbra-muted leading-relaxed">
                  {feature.body}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
