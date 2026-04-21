/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Architecture Callout
   "The Pattern Other Projects Miss"
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export function ArchitectureCallout() {
  return (
    <section className="w-full bg-umbra-bg py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/[0.06] overflow-hidden shadow-card-dark"
          style={{
            borderLeft: "4px solid #3B82F6",
          }}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/[0.06] bg-umbra-card">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              The Pattern Other Projects Miss
            </h3>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT — Standard FHE */}
            <div className="p-8 bg-umbra-card/80">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-umbra-danger/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-umbra-danger" />
                </div>
                <h4 className="text-lg font-bold text-umbra-danger">
                  Standard FHE Pattern
                </h4>
              </div>
              <p className="text-umbra-muted text-sm leading-relaxed mb-4">
                Comparing{" "}
                <span className="text-white font-medium">encrypted data</span>{" "}
                vs.{" "}
                <span className="text-white font-medium">encrypted data</span>
              </p>
              <div className="bg-umbra-bg/50 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-umbra-muted font-mono">
                  // Example: matching two hidden bids in an auction
                </p>
                <p className="text-sm text-white/60 font-mono mt-2">
                  FHE.gte(
                  <span className="text-umbra-danger">encryptedBid_A</span>,{" "}
                  <span className="text-umbra-danger">encryptedBid_B</span>)
                </p>
                <p className="text-xs text-umbra-muted mt-2">
                  Both values hidden — limited real-world utility for parametric
                  insurance.
                </p>
              </div>
            </div>

            {/* RIGHT — Umbra's Pattern */}
            <div
              className="p-8 relative"
              style={{
                background:
                  "linear-gradient(135deg, rgba(5,13,26,0.95), rgba(10,22,40,0.95))",
              }}
            >
              {/* Subtle blue glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 60%)",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-umbra-success/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-umbra-success" />
                  </div>
                  <h4 className="text-lg font-bold text-umbra-success">
                    Umbra&apos;s Pattern
                  </h4>
                </div>
                <p className="text-umbra-muted text-sm leading-relaxed mb-4">
                  Comparing{" "}
                  <span className="text-umbra-blue font-medium">
                    PUBLIC oracle data
                  </span>{" "}
                  vs.{" "}
                  <span className="text-umbra-violet font-medium">
                    ENCRYPTED threshold
                  </span>
                </p>
                <div className="bg-umbra-bg/50 rounded-lg p-4 border border-umbra-blue/20">
                  <p className="text-xs text-umbra-muted font-mono">
                    // Chainlink posts weather index 847 publicly
                  </p>
                  <p className="text-sm text-white font-mono mt-2">
                    FHE.gte(
                    <span className="text-umbra-blue">publicOracle(847)</span>,{" "}
                    <span className="text-umbra-violet">encrypted[████]</span>)
                  </p>
                  <p className="text-xs text-umbra-muted mt-2">
                    Oracle data is public. Your threshold stays hidden. Novel
                    pattern for real-world parametric insurance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
