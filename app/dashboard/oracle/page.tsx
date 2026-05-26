"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { LIVE_ORACLE_FEED_KEYS, ORACLE_FEEDS } from "@/lib/constants";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { formatOraclePrice, getOracleValueForFeed } from "@/lib/oracle-utils";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ExternalLink, Radio, AlertTriangle, Loader2 } from "lucide-react";

export default function OraclePage() {
  const livePrices = useChainlinkPrices();

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Oracle Feeds"
        description="Live Chainlink AggregatorV3 price feeds on Ethereum Sepolia — used for parametric policy resolution."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {LIVE_ORACLE_FEED_KEYS.map((key, i) => {
          const feed = ORACLE_FEEDS[key];
          const live = livePrices[key];
          const resolved = getOracleValueForFeed(key, livePrices);
          const isStale = live?.isStale ?? false;
          const isLoading = !live && resolved.value === null;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Card className="p-5 h-full hover:border-umbra-blue/25 transition-all">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{feed.name}</p>
                      <a
                        href={`https://sepolia.etherscan.io/address/${feed.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-umbra-muted hover:text-umbra-blue transition-colors font-mono flex items-center gap-1 truncate"
                      >
                        {feed.address.slice(0, 10)}…{feed.address.slice(-6)}
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-umbra-blue animate-spin" />
                        <span className="text-xs text-umbra-muted">Syncing</span>
                      </>
                    ) : isStale ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-umbra-warning" />
                        <span className="text-xs text-umbra-warning">Stale</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-umbra-success animate-pulse" />
                        <span className="text-xs text-umbra-success">Live</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-umbra-muted mb-1">Latest round</p>
                  <p className="text-3xl font-bold font-mono text-white tracking-tight">
                    {formatOraclePrice(resolved.value, feed.unit)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-umbra-muted">
                  <span>Chainlink Sepolia</span>
                  {live?.updatedAt ? (
                    <span>
                      Updated {Math.max(0, Math.round((Date.now() / 1000 - live.updatedAt) / 60))}m ago
                    </span>
                  ) : (
                    <span>Waiting for RPC…</span>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
