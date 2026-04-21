/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — How It Works Section
   3 step cards + FHE Oracle Graph
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FHEOracleGraph } from "./FHEOracleGraph";
import { Lock, Satellite, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Lock,
    title: "Encrypt Policy Terms",
    body: "Your enterprise uses the Fhenix SDK to define coverage. The trigger threshold (e.g., a shipping index value) is stored as euint32. The coverage payout is stored as euint64. Zero plaintext ever touches the blockchain.",
    tech: "Fhenix FHE · euint32 · euint64",
    accentColor: "bg-umbra-blue",
    iconColor: "text-umbra-blue",
    glowColor: "shadow-blue-glow-sm",
  },
  {
    icon: Satellite,
    title: "Homomorphic Oracle Evaluation",
    body: "Chainlink pushes the latest risk index on-chain. Our contract uses FHE.gte() to compare the PUBLIC oracle value against your HIDDEN threshold homomorphically. Node operators see the oracle value — but never your strike price. The result remains an encrypted ebool.",
    tech: "FHE.gte · ebool · Chainlink",
    accentColor: "bg-umbra-violet",
    iconColor: "text-umbra-violet",
    glowColor: "shadow-violet-glow",
  },
  {
    icon: ShieldCheck,
    title: "Silent Treasury Settlement",
    body: "FHE.select routes the settlement conditionally without public branching. Upon trigger confirmation, Privara's settlement engine executes a confidential stablecoin transfer to your enterprise treasury. The payout amount and counterparty remain indistinguishable to external observers.",
    tech: "FHE.select · Privara · Confidential USDC",
    accentColor: "bg-umbra-success",
    iconColor: "text-umbra-success",
    glowColor: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-umbra-bg py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold">
            <span className="text-white">How Umbra </span>
            <span className="text-umbra-blue">Protects </span>
            <span className="text-white">Your Risk</span>
          </h2>
        </motion.div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
            >
              <Card className="relative h-full overflow-hidden" glow>
                {/* Left accent bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${step.accentColor}`}
                />

                <div className="p-6 pl-8">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${step.glowColor}`}
                  >
                    <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>

                  {/* Step number */}
                  <div className="text-xs text-umbra-muted mb-2 font-mono">
                    STEP {i + 1}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>

                  {/* Body */}
                  <p className="text-umbra-muted text-sm leading-relaxed mb-4">
                    {step.body}
                  </p>

                  {/* Tech pill */}
                  <Badge variant="info" className="font-mono text-[10px]">
                    {step.tech}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FHE Oracle Graph */}
        <FHEOracleGraph />
      </div>
    </section>
  );
}
