/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Dashboard Main Page
   ═══════════════════════════════════════════════════════════ */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PolicyTable } from "@/components/dashboard/PolicyTable";
import { PrivatePortfolioCard } from "@/components/dashboard/PrivatePortfolioCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ORACLE_FEEDS } from "@/lib/constants";
import { useUserPolicies } from "@/hooks/useUmbraContract";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { getOracleValueForFeed } from "@/lib/oracle-utils";
import { formatAddress } from "@/lib/utils";
import { Plus, Lock, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { PolicyStatus } from "@/lib/types";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { policies, isLoading, refetch } = useUserPolicies();
  const chainlinkPrices = useChainlinkPrices();

  const displayAddress = isConnected && address ? formatAddress(address) : "—";

  // Derive stats from on-chain policies
  const activeCount = policies.filter((p) => p.status === PolicyStatus.Active).length;
  const triggeredCount = policies.filter((p) => p.status === PolicyStatus.Triggered).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Policy Dashboard
          </h1>
          <p className="text-umbra-muted text-sm mt-1">
            Welcome back, {displayAddress}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg text-umbra-muted hover:text-white border border-white/10 hover:bg-white/5 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/dashboard/create">
            <Button variant="primary" pill>
              <Plus className="w-4 h-4" />
              Create New Policy
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Policies",
            value: isLoading ? "—" : String(activeCount),
            dotColor: "bg-umbra-success",
            encrypted: false,
          },
          {
            label: "Total Coverage",
            value: "Encrypted",
            dotColor: null,
            encrypted: true,
          },
          {
            label: "Pending Settlement",
            value: isLoading ? "—" : String(triggeredCount),
            dotColor: "bg-umbra-warning",
            encrypted: false,
          },
          {
            label: "Total Policies",
            value: isLoading ? "—" : String(policies.length),
            dotColor: "bg-umbra-blue",
            encrypted: false,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="p-5">
              <p className="text-xs text-umbra-muted mb-2">{stat.label}</p>
              <div className="flex items-center gap-2">
                {stat.dotColor && (
                  <span className={`w-2 h-2 rounded-full ${stat.dotColor}`} />
                )}
                {stat.encrypted ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-white/40 tracking-widest">
                      ████████
                    </span>
                    <span className="text-sm text-umbra-muted">USDC</span>
                    <Lock className="w-3.5 h-3.5 text-umbra-violet" />
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {stat.value}
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Private Portfolio + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <PrivatePortfolioCard />
          </motion.div>
        </div>
        <Card className="p-5 flex flex-col justify-center">
          <p className="text-xs text-umbra-muted uppercase tracking-wider mb-2">FHE Privacy</p>
          <p className="text-sm text-white/80 leading-relaxed">
            Policy terms stay encrypted on-chain. Oracle values are public at resolution (parametric design); payout settlement uses sealed decrypt in your session.
          </p>
          <Link href="/dashboard/privacy" className="text-xs text-umbra-blue hover:underline mt-3">
            Explore Privacy Lab →
          </Link>
        </Card>
      </div>

      <div className="mb-8">
        <ActivityFeed />
      </div>

      {/* Oracle Feeds Live Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-8 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-umbra-success animate-pulse" />
            <span className="text-xs text-umbra-muted font-medium uppercase tracking-wider">
              Live Oracle Feeds
            </span>
          </div>
          <div className="overflow-hidden">
            <div className="flex animate-ticker whitespace-nowrap py-3 px-4">
              {[
                ...Object.entries(ORACLE_FEEDS),
                ...Object.entries(ORACLE_FEEDS),
              ].map(([key, feed], i) => {
                const live = getOracleValueForFeed(key, chainlinkPrices);
                return (
                  <div
                    key={`${key}-${i}`}
                    className="inline-flex items-center gap-2 mx-6 shrink-0"
                  >
                    <span className="text-xs text-umbra-muted">
                      {feed.name}:
                    </span>
                    <span className="text-sm text-umbra-blue font-mono font-medium">
                      {live.value.toLocaleString()}
                    </span>
                    {feed.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-umbra-success" />
                    ) : feed.trend === "down" ? (
                      <TrendingDown className="w-3 h-3 text-umbra-danger" />
                    ) : (
                      <span className="text-xs text-umbra-muted">→</span>
                    )}
                    {live.source === "chainlink" && (
                      <span className="text-[10px] text-umbra-success">●</span>
                    )}
                    <span className="text-white/10 mx-4">|</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Policy Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Policies</h2>
            <Badge variant="info">
              {isLoading ? "Loading…" : `${policies.length} total`}
            </Badge>
          </div>
          {isLoading ? (
            <div className="text-center py-16 text-umbra-muted">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
              Loading policies from chain…
            </div>
          ) : (
            <PolicyTable policies={policies} isLoading={isLoading} />
          )}
        </Card>
      </motion.div>
    </div>
  );
}
