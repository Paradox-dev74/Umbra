"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";
import { UmbraLogo } from "@/components/ui/UmbraLogo";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "glass-dark border-b border-white/[0.06] shadow-lg shadow-black/20" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-white">
          <UmbraLogo size={28} showText />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative px-4 py-2 text-sm text-white/75 hover:text-white transition-colors group"
            >
              {link.label}
              <span className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-umbra-cyan to-umbra-violet scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <div
                  {...(!mounted && {
                    "aria-hidden": true,
                    style: { opacity: 0, pointerEvents: "none" as const, userSelect: "none" as const },
                  })}
                >
                  {connected ? (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white border border-umbra-cyan/25 hover:bg-umbra-cyan/10 transition-all"
                      >
                        Dashboard
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-mono text-umbra-cyan border border-umbra-cyan/20 hover:bg-umbra-cyan/10 transition-all"
                      >
                        <span className="w-2 h-2 rounded-full bg-umbra-success" />
                        {account.displayName}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openConnectModal}
                      className="flex items-center gap-2 px-5 py-2 rounded-full text-sm text-umbra-bg font-medium bg-gradient-to-r from-umbra-cyan to-umbra-cyan-dim hover:shadow-cyan-glow-sm transition-all"
                    >
                      Connect Wallet
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>

        <button className="md:hidden text-white p-2" aria-label="Open menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
}
