"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { PrivacyVeilHero } from "./PrivacyVeilHero";
import { ChevronDown, ArrowRight, Shield, EyeOff, Zap } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, label: "CoFHE FHE" },
  { icon: EyeOff, label: "Zero Threshold Leak" },
  { icon: Zap, label: "Chainlink Oracles" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-umbra-bg">
      <MeshBackground intensity="strong" hex />

      {/* Top gradient fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-umbra-bg to-transparent z-[1] pointer-events-none" />

      <div className="relative z-10 flex-1 flex items-center pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Copy */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="success" dot pulse className="mb-6">
                  Live on Ethereum Sepolia
                </Badge>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-umbra-cyan text-sm font-mono uppercase tracking-[0.2em] mb-4"
              >
                Confidential Parametric Insurance
              </motion.p>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight mb-6">
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="block text-white"
                >
                  Your risk stays
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className="block bg-gradient-to-r from-umbra-cyan via-white to-umbra-violet bg-clip-text text-transparent"
                >
                  behind the veil.
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-umbra-muted text-base md:text-lg leading-relaxed mb-8"
              >
                Umbra encrypts coverage, premiums, and trigger thresholds on-chain. Oracles
                evaluate your hidden parameters homomorphically — competitors see the market,
                never your strike price.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="flex flex-wrap gap-3 mb-10"
              >
                <Link href="/dashboard/create">
                  <Button variant="primary" size="lg" pill glow>
                    Create Encrypted Policy
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="ghost" size="lg" pill>
                    See How Privacy Works
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-6"
              >
                {TRUST_ITEMS.map((item, i) => (
                  <div key={item.label} className="flex items-center gap-2 text-umbra-muted">
                    <item.icon className="w-4 h-4 text-umbra-cyan" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Privacy visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:pl-8"
            >
              <PrivacyVeilHero />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 border-t border-white/[0.06] glass-dark"
      >
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {[
              { value: "$847B", label: "Parametric TAM" },
              { value: "100%", label: "Terms Encrypted" },
              { value: "FHE.gte", label: "Homomorphic Compare" },
              { value: "Zero", label: "Threshold Exposure" },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-lg md:text-xl font-mono font-bold text-umbra-cyan">{stat.value}</p>
                <p className="text-[11px] text-umbra-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 hidden lg:block"
      >
        <ChevronDown className="w-5 h-5 text-white/30 animate-chevron-bounce" />
      </motion.div>
    </section>
  );
}
