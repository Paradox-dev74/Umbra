"use client";

import { Card } from "@/components/ui/Card";
import { LIVE_ORACLE_FEED_KEYS, ORACLE_FEEDS } from "@/lib/constants";
import { useChainlinkPrices } from "@/hooks/useChainlinkPrice";
import { formatOraclePrice, getOracleValueForFeed } from "@/lib/oracle-utils";
import { Loader2 } from "lucide-react";

export function OracleTicker() {
  const chainlinkPrices = useChainlinkPrices();
  const items = LIVE_ORACLE_FEED_KEYS.map((key) => {
    const feed = ORACLE_FEEDS[key];
    const live = getOracleValueForFeed(key, chainlinkPrices);
    return { key, feed, live };
  });

  const allLoading = items.every(({ live }) => live.value === null);

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-umbra-success animate-pulse" />
          <span className="text-xs text-umbra-muted font-medium uppercase tracking-wider">
            Chainlink Sepolia
          </span>
        </div>
        {allLoading && (
          <span className="text-[10px] text-umbra-muted flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Syncing…
          </span>
        )}
      </div>
      <div className="overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap py-3 px-4">
          {[...items, ...items].map(({ key, feed, live }, i) => (
            <div key={`${key}-${i}`} className="inline-flex items-center gap-2 mx-6 shrink-0">
              <span className="text-xs text-umbra-muted">{feed.name}:</span>
              <span
                className={`text-sm font-mono font-medium ${
                  live.value !== null ? "text-umbra-blue" : "text-umbra-muted"
                }`}
              >
                {formatOraclePrice(live.value, feed.unit)}
              </span>
              {live.source === "chainlink" && (
                <span className="text-[10px] text-umbra-success uppercase tracking-wide">live</span>
              )}
              <span className="text-white/10 mx-4">|</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
