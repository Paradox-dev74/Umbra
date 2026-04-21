/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Integration Logos Section
   ═══════════════════════════════════════════════════════════ */

"use client";

import { motion } from "framer-motion";

const integrations = [
  { name: "Fhenix", icon: "🔐" },
  { name: "Chainlink", icon: "⬡" },
  { name: "Privara", icon: "🛡️" },
  { name: "Ethereum", icon: "◆" },
  { name: "Arbitrum", icon: "🔷" },
];

export function IntegrationLogos() {
  return (
    <section className="w-full bg-umbra-bg py-16 border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-umbra-muted text-sm mb-8 tracking-wider uppercase">
          Built with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {integrations.map((int, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors duration-300 cursor-default"
            >
              <span className="text-xl">{int.icon}</span>
              <span className="text-sm font-medium">{int.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
