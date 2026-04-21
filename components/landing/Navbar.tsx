/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Floating Glass Navbar
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(2,8,23,0.85)] backdrop-blur-[20px] border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo — Far Left */}
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="w-7 h-7 rounded-full bg-umbra-blue flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Umbra</span>
        </Link>

        {/* Center Nav Links with Dividers */}
        <div className="hidden md:flex items-center">
          {navLinks.map((link, i) => (
            <div key={link.label} className="flex items-center">
              <Link
                href={link.href}
                className="relative px-4 py-2 text-sm text-white/80 hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-umbra-blue scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
              {i < navLinks.length - 1 && (
                <span className="w-[1px] h-4 bg-white/10" />
              )}
            </div>
          ))}
        </div>

        {/* Right — Wallet Connect */}
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
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white border border-white/15 hover:bg-[rgba(59,130,246,0.15)] transition-all duration-200"
                      >
                        Dashboard
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-mono text-umbra-blue border border-umbra-blue/20 hover:bg-umbra-blue/10 transition-all"
                      >
                        <span className="w-2 h-2 rounded-full bg-umbra-success" />
                        {account.displayName}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openConnectModal}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white border border-white/15 hover:bg-[rgba(59,130,246,0.15)] transition-all duration-200"
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

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          aria-label="Open menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
}
