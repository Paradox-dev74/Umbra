"use client";

import Link from "next/link";
import { UmbraLogo } from "@/components/ui/UmbraLogo";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";

const columns = [
  {
    title: "Protocol",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Create Policy", href: "/dashboard/create" },
      { label: "Privacy Lab", href: "/dashboard/privacy" },
      { label: "Smart Contract", href: `https://sepolia.etherscan.io/address/${UMBRA_CONTRACT_ADDRESS}`, external: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "CoFHE Docs", href: "https://docs.cofhe.io", external: true },
      { label: "Chainlink Feeds", href: "https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=sepolia", external: true },
      { label: "Etherscan", href: `https://sepolia.etherscan.io/address/${UMBRA_CONTRACT_ADDRESS}`, external: true },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Architecture", href: "#architecture" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Risk Disclosure", href: "#" },
    ],
  },
];

export function Footer() {
  const shortAddr = `${UMBRA_CONTRACT_ADDRESS.slice(0, 6)}...${UMBRA_CONTRACT_ADDRESS.slice(-4)}`;

  return (
    <footer className="w-full bg-umbra-bg border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <UmbraLogo size={32} showText />
            <p className="text-xs text-umbra-muted leading-relaxed mt-4">
              Invisible risk coverage.
              <br />
              Confidential parametric insurance powered by FHE.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-umbra-muted hover:text-umbra-cyan transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-umbra-muted hover:text-umbra-cyan transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 px-4 py-3 rounded-xl bg-umbra-warning/5 border border-umbra-warning/20">
          <p className="text-[11px] text-umbra-warning/90 text-center leading-relaxed">
            <span className="font-semibold">Testnet:</span> Umbra runs on Ethereum Sepolia. Use test ETH only.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-umbra-muted">© 2026 Umbra Protocol · CoFHE + Chainlink</p>
          <a
            href={`https://sepolia.etherscan.io/address/${UMBRA_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-umbra-muted hover:text-umbra-cyan transition-colors font-mono"
          >
            {shortAddr}
          </a>
        </div>
      </div>
    </footer>
  );
}
