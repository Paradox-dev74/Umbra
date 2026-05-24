/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Footer
   ═══════════════════════════════════════════════════════════ */

"use client";

import Link from "next/link";

const columns = [
  {
    title: "Protocol",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Create Policy", href: "/dashboard/create" },
      { label: "Documentation", href: "#" },
      { label: "Smart Contracts", href: "https://sepolia.etherscan.io/address/0x39e14d328EbDe66E2137925EC1A0C77bf40e584e", external: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "CoFHE Docs", href: "https://docs.cofhe.io", external: true },
      { label: "Chainlink Feeds", href: "https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=sepolia", external: true },
      { label: "Etherscan", href: "https://sepolia.etherscan.io/address/0x39e14d328EbDe66E2137925EC1A0C77bf40e584e", external: true },
      { label: "GitHub", href: "https://github.com/aamer1932002-dev/umbra-protocol", external: true },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "#" },
      { label: "Telegram", href: "#" },
      { label: "Twitter / X", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Risk Disclosure", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-umbra-bg border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo + tagline — first column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-umbra-blue flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <span className="text-lg font-bold text-white">Umbra</span>
            </div>
            <p className="text-xs text-umbra-muted leading-relaxed">
              Invisible Risk Coverage
              <br />
              Confidential parametric insurance powered by FHE.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-umbra-muted hover:text-white hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-umbra-muted hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-umbra-muted hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Discord"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-umbra-muted hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-umbra-muted hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Testnet disclaimer */}
        <div className="mt-8 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-[11px] text-amber-400/80 text-center leading-relaxed">
            <span className="font-semibold text-amber-400">Testnet Notice:</span>{" "}
            Umbra Protocol is currently deployed on Ethereum Sepolia testnet. All policies and
            transactions use test ETH only. Do not send real funds to any contract address.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-umbra-muted">
            © 2025 Umbra Protocol. Powered by CoFHE FHE + Chainlink.
          </p>
          <a
            href="https://sepolia.etherscan.io/address/0x39e14d328EbDe66E2137925EC1A0C77bf40e584e"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-umbra-muted hover:text-umbra-blue transition-colors font-mono"
          >
            0x39e1...584e
          </a>
        </div>
      </div>
    </footer>
  );
}
