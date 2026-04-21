/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Marketing Landing Page
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ArchitectureCallout } from "@/components/landing/ArchitectureCallout";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { RiskCategoriesShowcase } from "@/components/landing/RiskCategoriesShowcase";
import { IntegrationLogos } from "@/components/landing/IntegrationLogos";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Navbar />
        <main>
          <HeroSection />
          <StatsBar />
          <HowItWorks />
          <ArchitectureCallout />
          <FeatureGrid />
          <RiskCategoriesShowcase />
          <IntegrationLogos />
          <CTABanner />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}
