"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LandingSection } from "./LandingSection";
import { FHEOracleGraph } from "./FHEOracleGraph";
import { Lock, Satellite, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Lock,
    step: "01",
    title: "Encrypt Policy Terms",
    body: "Coverage, premium, threshold, and deductible are encrypted client-side via CoFHE before a single byte hits the chain.",
    tech: "Encryptable.uint64 · createPolicyV2",
    accent: "border-l-umbra-cyan",
    iconBg: "bg-umbra-cyan/10 text-umbra-cyan",
  },
  {
    icon: Satellite,
    step: "02",
    title: "Homomorphic Oracle Compare",
    body: "Chainlink feeds post public oracle values. Your contract runs FHE.gte / FHE.lte against your hidden threshold — strike price never revealed.",
    tech: "FHE.gte · resolveWithChainlink",
    accent: "border-l-umbra-violet",
    iconBg: "bg-umbra-violet/10 text-umbra-violet",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Silent Settlement",
    body: "FHE.select routes payout without public branching. Privara executes confidential USDC transfer — amount and counterparty stay private.",
    tech: "FHE.select · FHE.and · Privara",
    accent: "border-l-umbra-success",
    iconBg: "bg-umbra-success/10 text-umbra-success",
  },
];

export function HowItWorks() {
  return (
    <LandingSection
      id="how-it-works"
      className="bg-umbra-bg umbra-hex-grid"
      eyebrow="Protocol Flow"
      title={
        <>
          <span className="text-white">Three steps. </span>
          <span className="bg-gradient-to-r from-umbra-cyan to-umbra-violet bg-clip-text text-transparent">
            Total privacy.
          </span>
        </>
      }
      subtitle="From encrypted policy creation to homomorphic resolution — every financial parameter stays sealed until you choose to decrypt."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card glass hover className={`h-full border-l-4 ${step.accent} overflow-hidden`}>
              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.iconBg}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-white/5 font-mono">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-umbra-muted text-sm leading-relaxed mb-5">{step.body}</p>
                <Badge variant="info" className="font-mono text-[10px]">
                  {step.tech}
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <FHEOracleGraph />
    </LandingSection>
  );
}
