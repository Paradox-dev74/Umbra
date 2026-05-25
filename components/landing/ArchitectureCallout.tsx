"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { LandingSection } from "./LandingSection";

export function ArchitectureCallout() {
  return (
    <LandingSection
      id="architecture"
      className="bg-umbra-bg"
      eyebrow="Why Umbra Wins"
      title="The pattern other projects miss"
      subtitle="Standard FHE compares hidden vs hidden. Umbra compares public oracle data against your encrypted threshold — the only pattern that works for real parametric insurance."
      align="left"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-card-dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-10 bg-umbra-card/80 border-b md:border-b-0 md:border-r border-white/[0.06]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-umbra-danger/10 flex items-center justify-center">
                <X className="w-5 h-5 text-umbra-danger" />
              </div>
              <h4 className="text-lg font-bold text-umbra-danger">Standard FHE</h4>
            </div>
            <p className="text-umbra-muted text-sm leading-relaxed mb-5">
              Encrypted vs encrypted — limited utility for insurance where oracle data must be public.
            </p>
            <div className="rounded-xl p-4 bg-umbra-bg/60 border border-white/5 font-mono text-sm">
              <span className="text-umbra-muted">FHE.gte(</span>
              <span className="text-umbra-danger">encA</span>
              <span className="text-umbra-muted">, </span>
              <span className="text-umbra-danger">encB</span>
              <span className="text-umbra-muted">)</span>
            </div>
          </div>

          <div className="p-8 md:p-10 relative bg-gradient-to-br from-umbra-cyan/5 to-umbra-violet/5">
            <div className="absolute top-0 right-0 w-40 h-40 bg-umbra-cyan/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-umbra-success/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-umbra-success" />
                </div>
                <h4 className="text-lg font-bold text-umbra-success">Umbra Pattern</h4>
              </div>
              <p className="text-umbra-muted text-sm leading-relaxed mb-5">
                Public oracle vs encrypted bounds — index band policies hide both floor and ceiling.
              </p>
              <div className="rounded-xl p-4 bg-umbra-bg/60 border border-umbra-cyan/20 font-mono text-sm space-y-2">
                <div>
                  <span className="text-umbra-muted">FHE.gte(</span>
                  <span className="text-umbra-cyan">oracle</span>
                  <span className="text-umbra-muted">, </span>
                  <span className="text-umbra-violet encrypted-mask text-xs">floor</span>
                  <span className="text-umbra-muted">)</span>
                </div>
                <div>
                  <span className="text-umbra-muted">FHE.and · FHE.lte(oracle, </span>
                  <span className="text-umbra-violet encrypted-mask text-xs">ceiling</span>
                  <span className="text-umbra-muted">)</span>
                </div>
                <div className="text-[10px] text-umbra-muted pt-1">
                  Exposure lifecycle: FHE.sub on cancel · expire · settle
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </LandingSection>
  );
}
