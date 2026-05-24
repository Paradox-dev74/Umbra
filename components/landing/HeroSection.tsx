/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Hero Section
   Full viewport hero with particle field, energy orb,
   bottom-left headline, and stats strip.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ParticleCanvas } from "./ParticleCanvas";
import { HeroOrb } from "./HeroOrb";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, Shield, Lock } from "lucide-react";

const words = [
  { text: "Invisible", color: "text-white" },
  { text: "Risk", color: "text-umbra-blue" },
  { text: "Coverage", color: "text-white" },
  { text: "For", color: "text-white" },
  { text: "Enterprises.", color: "text-white" },
];

const stats = [
  { value: "$847B", label: "Total Addressable Market" },
  { value: "100%", label: "Parameters Encrypted" },
  { value: "<2s", label: "Oracle Resolution Time" },
  { value: "Zero", label: "Threshold Exposure" },
];

export function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-umbra-bg">
      {/* Slow gradient rotation background */}
      <div
        className="absolute inset-0 animate-gradient-rotate pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, #020817 0%, #030a14 25%, #020817 50%, #04091a 75%, #020817 100%)",
        }}
      />

      {/* LAYER 1: Particle Canvas */}
      <ParticleCanvas className="z-[1]" count={150} />

      {/* LAYER 2: Energy Orb */}
      <HeroOrb />

      {/* LAYER 2.5: Floating Encrypted Policy Card — visible md+ */}
      <div className="hidden md:block absolute top-1/2 right-10 xl:right-24 -translate-y-1/2 z-10 w-72">
        <motion.div
          initial={{ opacity: 0, x: 50, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8, type: "spring", stiffness: 80 }}
          className="relative"
        >
          {/* Ambient glow behind card */}
          <div className="absolute -inset-4 bg-umbra-blue/10 blur-2xl rounded-3xl pointer-events-none" />

          {/* Card */}
          <div className="relative bg-umbra-card/90 border border-white/[0.1] rounded-2xl p-5 backdrop-blur-sm shadow-card-dark">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-umbra-blue/15 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-umbra-blue" />
                </div>
                <span className="text-sm font-semibold text-white">Policy #42</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-umbra-success/10 text-umbra-success text-[11px] font-medium">
                Active
              </span>
            </div>

            {/* Fields */}
            <div className="space-y-3 mb-4">
              {[
                { label: "Coverage", encrypted: true },
                { label: "Trigger Threshold", encrypted: true },
                { label: "Oracle", value: "ETH / USD", encrypted: false },
                { label: "Risk Category", value: "Commodity Price", encrypted: false },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-umbra-muted">{field.label}</span>
                  {field.encrypted ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-white/25 tracking-widest select-none">
                        ███████
                      </span>
                      <Lock className="w-2.5 h-2.5 text-umbra-violet" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-white font-mono">{field.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* FHE footer */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
              <motion.span
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-umbra-violet flex-shrink-0"
              />
              <span className="text-[10px] text-umbra-violet font-mono tracking-wide">
                FHE-ENCRYPTED · COFHE · SEPOLIA
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* LAYER 3: Hero Text — bottom-left positioned */}
      <div className="absolute bottom-20 md:bottom-20 left-6 md:left-20 z-10 max-w-xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Badge variant="success" dot pulse className="mb-6">
            Live on Ethereum Sepolia · CoFHE
          </Badge>
        </motion.div>

        {/* Headline — stagger word animation */}
        <h1 className="text-5xl md:text-7xl lg:text-[72px] font-extrabold leading-[1.05] mb-6">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4 + i * 0.08,
                duration: 0.6,
                ease: "easeOut",
              }}
              className={`${word.color} inline-block mr-3`}
            >
              {word.text}
            </motion.span>
          ))}
        </h1>

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-umbra-muted text-base leading-[1.7] mb-8 max-w-[420px]"
        >
          Parametric insurance where your trigger thresholds and coverage limits
          are encrypted on-chain. Chainlink oracles evaluate your hidden risk
          parameters homomorphically — payouts execute without ever revealing
          your financial exposure.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          <Link href="/dashboard/create">
            <Button variant="primary" pill glow>
              Create Policy
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" pill>
              View Protocol
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Stats Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 md:gap-0">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-umbra-blue font-mono font-bold text-sm md:text-base">
                    {stat.value}
                  </span>
                  <span className="text-umbra-muted text-xs md:text-sm">
                    {stat.label}
                  </span>
                </div>
                {i < stats.length - 1 && (
                  <span className="hidden md:block w-[1px] h-4 bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 hidden md:block"
      >
        <ChevronDown className="w-5 h-5 text-white/40 animate-chevron-bounce" />
      </motion.div>
    </section>
  );
}
