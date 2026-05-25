"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="relative w-full py-28 md:py-36 overflow-hidden">
      <MeshBackground intensity="medium" />
      <div className="absolute inset-0 bg-gradient-to-t from-umbra-bg via-transparent to-umbra-bg pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl p-10 md:p-14 border border-white/10"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight">
            <span className="text-white">Your exposure belongs to </span>
            <span className="bg-gradient-to-r from-umbra-cyan to-umbra-violet bg-clip-text text-transparent italic">
              no one but you.
            </span>
          </h2>
          <p className="text-umbra-muted text-base md:text-lg mb-8 max-w-xl mx-auto">
            Deploy encrypted parametric coverage on Sepolia. Create a policy in minutes — thresholds stay hidden forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/create">
              <Button variant="primary" size="lg" pill glow>
                Create Your First Policy
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg" pill>
                Open Dashboard
              </Button>
            </Link>
          </div>
          <Badge variant="success" dot pulse className="mt-6">
            CoFHE · Sepolia Testnet
          </Badge>
        </motion.div>
      </div>
    </section>
  );
}
