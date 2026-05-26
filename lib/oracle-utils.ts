/* ═══════════════════════════════════════════════════════════
   Oracle feed helpers — map feed addresses to live Chainlink data
   ═══════════════════════════════════════════════════════════ */

import { ORACLE_FEEDS } from "@/lib/constants";
import type { ChainlinkPriceData } from "@/hooks/useChainlinkPrice";

export function findFeedByAddress(address: string) {
  return Object.entries(ORACLE_FEEDS).find(
    ([, feed]) => feed.address.toLowerCase() === address.toLowerCase()
  );
}

export function getOracleValueForFeed(
  feedKey: string,
  chainlinkPrices: Record<string, ChainlinkPriceData | null>
): { value: number | null; source: "chainlink" | "unavailable" } {
  const feed = ORACLE_FEEDS[feedKey];
  if (!feed) return { value: null, source: "unavailable" };

  const live = chainlinkPrices[feedKey];
  if (live && !live.isStale) {
    return { value: live.price, source: "chainlink" };
  }

  return { value: null, source: "unavailable" };
}

export function formatOraclePrice(value: number | null, unit = "USD"): string {
  if (value === null) return "Unavailable";
  if (unit === "USD") {
    return value < 10
      ? `$${value.toFixed(4)}`
      : `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/** Convert display threshold/bound to on-chain uint64 (matches Chainlink scaling) */
export function thresholdToUint64(value: number, feedKey?: string): bigint {
  return oracleValueToUint64(value, feedKey);
}

/** Convert display threshold from oracle feed address */
export function thresholdToUint64FromAddress(value: number, oracleFeedAddress: string): bigint {
  const feedKey = resolveFeedKeyFromAddress(oracleFeedAddress);
  return oracleValueToUint64(value, feedKey);
}

/** Convert oracle display value to uint64 for on-chain FHE comparison */
export function oracleValueToUint64(value: number, feedKey?: string): bigint {
  const feed = feedKey ? ORACLE_FEEDS[feedKey] : undefined;
  if (feed?.chainlinkAddress) {
    return BigInt(Math.round(value * 1e8));
  }
  return BigInt(Math.round(value));
}

export function resolveFeedKeyFromAddress(address: string): string | undefined {
  const entry = findFeedByAddress(address);
  return entry?.[0];
}
