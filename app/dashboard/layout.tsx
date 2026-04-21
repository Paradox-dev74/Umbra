/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Dashboard Layout with Sidebar
   ═══════════════════════════════════════════════════════════ */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { cn, formatAddress } from "@/lib/utils";
import {
  LayoutGrid,
  Shield,
  Plus,
  Zap,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: Shield, label: "My Policies", href: "/dashboard" },
  { icon: Plus, label: "Create Policy", href: "/dashboard/create" },
  { icon: Zap, label: "Oracle Feeds", href: "/dashboard" },
  { icon: Settings, label: "Settings", href: "/dashboard" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  return (
    <div className="flex min-h-screen bg-umbra-bg">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.06] bg-umbra-card/50">
        {/* Logo */}
        <div className="px-6 h-16 flex items-center border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-full bg-umbra-blue flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Umbra</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-umbra-blue/10 text-umbra-blue"
                    : "text-umbra-muted hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section — Wallet */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          {isConnected && address ? (
            <ConnectButton.Custom>
              {({ account, openAccountModal }) => (
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 w-full hover:bg-white/5 rounded-lg p-1.5 -m-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-umbra-elevated flex items-center justify-center">
                    <span className="text-xs font-mono text-umbra-muted">0x</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-white font-mono truncate">
                      {account?.displayName ?? formatAddress(address)}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-umbra-success" />
                      <span className="text-[10px] text-umbra-muted">
                        Fhenix Helium
                      </span>
                    </div>
                  </div>
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-umbra-blue border border-umbra-blue/20 hover:bg-umbra-blue/10 transition-all"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
