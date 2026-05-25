"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-umbra-bg"
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
  );
}
