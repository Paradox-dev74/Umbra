"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { LandingSection } from "./LandingSection";
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
    iconBg: "bg-umbra-cyan/10 text-umbra-cyan",
  },
  {
    icon: GitBranch,
    title: "Branchless Settlement",
    body: "FHE.select prevents side-channel leakage. No public branching means observers cannot infer payout outcomes from execution patterns.",
    iconBg: "bg-umbra-violet/10 text-umbra-violet",
  },
  {
    icon: Radio,
    title: "Real Chainlink Oracles",
    body: "Live Chainlink price feeds on Sepolia are evaluated homomorphically against your encrypted thresholds.",
    iconBg: "bg-umbra-success/10 text-umbra-success",
  },
  {
    icon: ShieldCheck,
    title: "Confidential Payouts",
    body: "Privara hides transfer amounts and treasury movements. Settlement executes without revealing your financial exposure.",
    iconBg: "bg-umbra-cyan/10 text-umbra-cyan",
  },
  {
    icon: KeyRound,
    title: "Sealed Decryption",
    body: "Only authorized parties decrypt via CoFHE Threshold Network. Auto-relock after 90 seconds in the UI.",
    iconBg: "bg-umbra-violet/10 text-umbra-violet",
  },
  {
    icon: Layers,
    title: "Exposure Aggregation",
    body: "Homomorphic sums track per-holder and protocol-wide encrypted exposure for portfolio and reinsurance views.",
    iconBg: "bg-umbra-blue/10 text-umbra-blue",
  },
];

export function FeatureGrid() {
  return (
    <LandingSection
      id="features"
      className="bg-umbra-card/30"
      eyebrow="Capabilities"
      title={
        <>
          Enterprise-grade{" "}
          <span className="bg-gradient-to-r from-umbra-cyan to-umbra-violet bg-clip-text text-transparent">
            privacy infrastructure
          </span>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <Card glass hover gradientBorder className="h-full p-6 group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-umbra-muted leading-relaxed">{feature.body}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </LandingSection>
  );
}
