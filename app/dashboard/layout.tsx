"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { cn, formatAddress } from "@/lib/utils";
import { CofheStatusBanner } from "@/components/dashboard/CofheStatusBanner";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { UmbraLogo } from "@/components/ui/UmbraLogo";
import {
  LayoutGrid,
  Shield,
  Plus,
  Zap,
  Settings,
  Menu,
  X,
  FlaskConical,
  Radio,
  Globe,
  Eye,
  Scale,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard", exact: true },
  { icon: Shield, label: "My Policies", href: "/dashboard/policies", exact: false },
  { icon: Plus, label: "Create Policy", href: "/dashboard/create", exact: false },
  { icon: FlaskConical, label: "Privacy Lab", href: "/dashboard/privacy", exact: false },
  { icon: Radio, label: "Oracle Ops", href: "/dashboard/oracle/ops", exact: false },
  { icon: Zap, label: "Oracle Feeds", href: "/dashboard/oracle", exact: false },
  { icon: Globe, label: "Reinsurance", href: "/dashboard/reinsurance", exact: false },
  { icon: Eye, label: "Audit Portal", href: "/dashboard/audit", exact: false },
  { icon: Scale, label: "Arbitrator", href: "/dashboard/arbitrator", exact: false },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", exact: false },
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
      <div className="px-6 h-16 flex items-center border-b border-white/[0.06]">
        <Link href="/" className="text-white group" onClick={onNavClick}>
          <UmbraLogo size={30} showText />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                isActive ? "text-umbra-cyan" : "text-umbra-muted hover:text-white"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-umbra-cyan/10 border border-umbra-cyan/20"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/[0.06]">
        {isConnected && address ? (
          <ConnectButton.Custom>
            {({ account, openAccountModal }) => (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={openAccountModal}
                className="flex items-center gap-2 w-full hover:bg-white/5 rounded-xl p-2 transition-colors border border-transparent hover:border-white/10"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-umbra-cyan/20 to-umbra-violet/20 flex items-center justify-center ring-1 ring-white/10">
                  <span className="text-[10px] font-mono text-umbra-cyan">FHE</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-white font-mono truncate">
                    {account?.displayName ?? formatAddress(address)}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-umbra-success animate-pulse" />
                    <span className="text-[10px] text-umbra-muted">Sepolia · CoFHE</span>
                  </div>
                </div>
              </motion.button>
            )}
          </ConnectButton.Custom>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-umbra-cyan border border-umbra-cyan/25 hover:bg-umbra-cyan/10 transition-all"
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-umbra-bg">
      <MeshBackground intensity="subtle" className="fixed inset-0" />

      <aside className="hidden lg:flex flex-col w-[268px] border-r border-white/[0.06] glass-dark relative z-10">
        <SidebarContent pathname={pathname} address={address} isConnected={isConnected} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 w-[268px] flex flex-col glass-dark border-r border-white/[0.08] z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-umbra-muted hover:text-white hover:bg-white/10"
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

      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/[0.06] glass-dark sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-umbra-muted hover:text-white hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="text-white">
            <UmbraLogo size={24} showText />
          </Link>
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen"
          >
            <div className="px-4 md:px-8 pt-4 md:pt-6 max-w-7xl mx-auto">
              <CofheStatusBanner />
            </div>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
