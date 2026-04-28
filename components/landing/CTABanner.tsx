/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — CTA Banner Section
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function CTABanner() {
  return (
    <section className="w-full bg-umbra-bg py-24 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold mb-6"
        >
          <span className="text-white">Your risk exposure belongs to </span>
          <span className="text-umbra-blue italic">no one but you.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-umbra-muted text-lg mb-8"
        >
          Join enterprises protecting billions in exposure — confidentially.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <Link href="/dashboard">
            <Button variant="primary" size="lg" pill glow>
              Launch Umbra
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
          <Badge variant="success" dot pulse>
            Live on Ethereum Sepolia
          </Badge>
        </motion.div>
      </div>
    </section>
  );
}
