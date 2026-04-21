"use client";

import { motion } from "framer-motion";
import { Lock, Radio, GitCompare } from "lucide-react";

const ENCRYPTED_FIELDS = ["Coverage", "Threshold", "Premium", "Deductible"];

export function PrivacyVeilHero() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto aspect-square md:aspect-[4/3]">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-umbra-cyan/15 via-transparent to-umbra-violet/15 blur-3xl animate-mesh-drift" />

      {/* Outer orbit rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 rounded-full border border-dashed pointer-events-none"
          style={{
            inset: `${ring * 8}%`,
            borderColor: ring === 1 ? "rgba(34,211,238,0.25)" : ring === 2 ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.06)",
          }}
          animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 40 + ring * 15, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Main card container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 80 }}
        className="absolute inset-[12%] glass-panel rounded-3xl overflow-hidden shadow-cyan-glow-sm border border-white/10"
      >
        {/* Privacy boundary — vertical veil line */}
        <div className="absolute top-0 bottom-0 left-[42%] w-px z-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-umbra-cyan to-transparent"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 -ml-8"
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-umbra-cyan/20 blur-xl" />
          </motion.div>
        </div>

        {/* PUBLIC zone */}
        <div className="absolute inset-0 right-[58%] p-5 flex flex-col">
          <div className="flex items-center gap-1.5 mb-4">
            <Radio className="w-3.5 h-3.5 text-umbra-success" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-umbra-success">
              Public Oracle
            </span>
          </div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex-1 flex flex-col justify-center"
          >
            <p className="text-[10px] text-umbra-muted mb-1">ETH / USD</p>
            <p className="text-2xl font-mono font-bold text-white tabular-nums">$3,842</p>
            <p className="text-[10px] text-umbra-success mt-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-umbra-success animate-pulse" />
              Chainlink · Live
            </p>
          </motion.div>
          <p className="text-[9px] text-umbra-muted/80 font-mono">visible on-chain</p>
        </div>

        {/* PRIVATE zone */}
        <div className="absolute inset-0 left-[42%] p-5 flex flex-col bg-gradient-to-bl from-umbra-violet/10 to-transparent">
          <div className="flex items-center gap-1.5 mb-4">
            <Lock className="w-3.5 h-3.5 text-umbra-violet" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-umbra-violet">
              Encrypted Policy
            </span>
          </div>
          <div className="flex-1 space-y-2.5">
            {ENCRYPTED_FIELDS.map((field, i) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-[10px] text-umbra-muted">{field}</span>
                <span className="text-[10px] font-mono encrypted-mask">████████</span>
              </motion.div>
            ))}
          </div>
          <p className="text-[9px] text-umbra-violet/80 font-mono">FHE · CoFHE · sealed</p>
        </div>

        {/* Center FHE node */}
        <motion.div
          className="absolute top-1/2 left-[42%] -translate-x-1/2 -translate-y-1/2 z-30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-14 h-14 rounded-2xl bg-umbra-bg border border-umbra-cyan/40 flex flex-col items-center justify-center shadow-cyan-glow-sm">
            <GitCompare className="w-4 h-4 text-umbra-cyan mb-0.5" />
            <span className="text-[8px] font-mono text-umbra-cyan">FHE.gte</span>
          </div>
        </motion.div>

        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-umbra-cyan/60 to-transparent z-10 pointer-events-none"
          animate={{ top: ["15%", "85%", "15%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Floating particles — public → veil */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-umbra-cyan/80"
          style={{ top: `${20 + i * 8}%`, left: "8%" }}
          animate={{
            x: [0, 120, 140],
            opacity: [0, 1, 0],
            scale: [1, 0.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Result badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-dark border border-umbra-violet/30 flex items-center gap-2 whitespace-nowrap"
      >
        <span className="w-2 h-2 rounded-full bg-umbra-violet animate-pulse" />
        <span className="text-[11px] font-mono text-white/90">
          ebool result · payout via <span className="text-umbra-cyan">FHE.select</span>
        </span>
      </motion.div>
    </div>
  );
}
