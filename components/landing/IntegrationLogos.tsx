"use client";

import { motion } from "framer-motion";

const integrations = [
  { name: "CoFHE", sub: "Fhenix FHE" },
  { name: "Chainlink", sub: "Oracles" },
  { name: "Privara", sub: "Settlement" },
  { name: "Ethereum", sub: "Sepolia" },
  { name: "RainbowKit", sub: "Wallet" },
];

export function IntegrationLogos() {
  return (
    <section className="w-full py-14 border-y border-white/[0.04] bg-umbra-bg/80">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-umbra-muted text-xs font-mono uppercase tracking-[0.2em] mb-8">
          Powered by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {integrations.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center px-5 py-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-default"
            >
              <span className="text-sm font-semibold text-white/90">{item.name}</span>
              <span className="text-[10px] text-umbra-muted mt-0.5">{item.sub}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
