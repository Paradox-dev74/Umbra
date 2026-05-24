/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Dashboard Layout with Sidebar
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard",    href: "/dashboard",         exact: true },
  { icon: Shield,     label: "My Policies",  href: "/dashboard/policies",exact: false },
  { icon: Plus,       label: "Create Policy",href: "/dashboard/create",  exact: false },
  { icon: Zap,        label: "Oracle Feeds", href: "/dashboard/oracle",  exact: false },
  { icon: Settings,   label: "Settings",     href: "/dashboard/settings",exact: false },
];

function SidebarContent({
  pathname,
  address,
  isConnected,
  onNavClick,
}: {
  pathname: string;
  address?: `0x${string}`;
  isConnected: boolean;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5 text-white group" onClick={onNavClick}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="14" fill="#3B82F6" fillOpacity="0.15"/>
            <circle cx="14" cy="14" r="10" fill="#3B82F6" fillOpacity="0.25"/>
            <path d="M14 6C14 6 8 10 8 15.5C8 18.5376 10.6863 21 14 21C17.3137 21 20 18.5376 20 15.5C20 10 14 6 14 6Z" fill="#3B82F6"/>
            <circle cx="14" cy="15" r="3" fill="white" fillOpacity="0.9"/>
          </svg>
          <span className="text-lg font-bold tracking-tight">Umbra</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-umbra-blue/10 text-umbra-blue"
                  : "text-umbra-muted hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
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
                      Ethereum Sepolia
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
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-umbra-bg">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-white/[0.06] bg-umbra-card/50">
        <SidebarContent pathname={pathname} address={address} isConnected={isConnected} />
      </aside>

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer panel */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, type: "tween" }}
              className="fixed inset-y-0 left-0 w-[260px] flex flex-col bg-umbra-card border-r border-white/[0.06] z-50 lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-umbra-muted hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>

              <SidebarContent
                pathname={pathname}
                address={address}
                isConnected={isConnected}
                onNavClick={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main content ─── */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/[0.06] bg-umbra-card/50 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-umbra-muted hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 text-white">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="14" fill="#3B82F6" fillOpacity="0.15"/>
              <circle cx="14" cy="14" r="10" fill="#3B82F6" fillOpacity="0.25"/>
              <path d="M14 6C14 6 8 10 8 15.5C8 18.5376 10.6863 21 14 21C17.3137 21 20 18.5376 20 15.5C20 10 14 6 14 6Z" fill="#3B82F6"/>
              <circle cx="14" cy="15" r="3" fill="white" fillOpacity="0.9"/>
            </svg>
            <span className="font-bold tracking-tight">Umbra</span>
          </Link>

          <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
        </div>

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

