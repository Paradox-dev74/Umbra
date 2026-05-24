/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Umbra Protocol â€” Oracle Feeds Page
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { ORACLE_FEEDS } from "@/lib/constants";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { TrendingUp, TrendingDown, Minus, Radio, AlertTriangle, ExternalLink } from "lucide-react";

export default function OraclePage() {
  const livePrices = useChainlinkPrices();

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Oracle Feeds</h1>
        <p className="text-umbra-muted text-sm mt-1">
          Live parametric data feeds powering Umbra insurance triggers on Ethereum Sepolia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(ORACLE_FEEDS).map(([key, feed], i) => {
          const live = livePrices[key] ?? null;
          const displayValue = live ? live.price : feed.currentValue;
          const isStale = live?.isStale ?? false;
          const hasLive = Boolean(feed.chainlinkAddress && !feed.simulated);

          // Determine trend from live price vs fallback
          const trend = feed.trend;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <Card className="p-5 hover:border-umbra-blue/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{feed.name}</p>
                      {hasLive ? (
                        <a
                          href={`https://sepolia.etherscan.io/address/${feed.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-umbra-muted hover:text-umbra-blue transition-colors font-mono flex items-center gap-1"
                        >
                          {feed.address.slice(0, 10)}â€¦
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <p className="text-xs text-umbra-muted font-mono">Simulated Â· Testnet</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasLive && !isStale ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-umbra-success animate-pulse" />
                        <span className="text-xs text-umbra-success">Live</span>
                      </>
                    ) : isStale ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-umbra-warning" />
                        <span className="text-xs text-umbra-warning">Stale</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-umbra-muted" />
                        <span className="text-xs text-umbra-muted">Simulated</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-umbra-muted mb-1">
                      {hasLive ? "Chainlink Price" : "Reference Value"}
                    </p>
                    <p className="text-2xl font-bold font-mono text-white">
                      {feed.unit === "USD"
                        ? displayValue < 10
                          ? `$${displayValue.toFixed(4)}`
                          : `$${displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                        : displayValue.toLocaleString()}
                      <span className="text-sm text-umbra-muted ml-1">{feed.unit !== "USD" ? feed.unit : ""}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5">
                    {trend === "up" ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5 text-umbra-success" />
                        <span className="text-xs text-umbra-success">Up</span>
                      </>
                    ) : trend === "down" ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-umbra-danger" />
                        <span className="text-xs text-umbra-danger">Down</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-umbra-muted" />
                        <span className="text-xs text-umbra-muted">Stable</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-umbra-muted">
                    {hasLive ? "Chainlink Sepolia" : "No on-chain feed"}
                  </span>
                  {live?.updatedAt ? (
                    <span className="text-xs text-umbra-muted">
                      Updated {Math.round((Date.now() / 1000 - live.updatedAt) / 60)}m ago
                    </span>
                  ) : (
                    <span className="text-xs text-umbra-muted font-mono">
                      {hasLive ? "Connectingâ€¦" : "Simulated data"}
                    </span>
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
