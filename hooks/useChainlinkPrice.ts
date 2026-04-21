/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Chainlink Price Feed Hook
   Reads latestRoundData from real Chainlink AggregatorV3 feeds on Sepolia.
   Only fires for feeds that have a chainlinkAddress set.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useReadContracts } from "wagmi";
import { CHAINLINK_AGGREGATOR_ABI } from "@/lib/chainlink-abi";
import { ORACLE_FEEDS } from "@/lib/constants";

export interface ChainlinkPriceData {
  price: number;
  decimals: number;
  updatedAt: number;
  /** True if the price hasn't been updated in over 1 hour */
  isStale: boolean;
}

/**
 * Returns live Chainlink prices for all feeds that have a `chainlinkAddress`.
 * Refreshes every 30 seconds. Falls back to null for simulated feeds.
 */
export function useChainlinkPrices(): Record<string, ChainlinkPriceData | null> {
  // All configured feeds use Chainlink on Sepolia
  const feeds = Object.entries(ORACLE_FEEDS);

  // Build a flat multicall: [latestRoundData, decimals] per feed
  const contracts = feeds.flatMap(([, feed]) => [
    {
      address: feed.chainlinkAddress as `0x${string}`,
      abi: CHAINLINK_AGGREGATOR_ABI,
      functionName: "latestRoundData" as const,
    },
    {
      address: feed.chainlinkAddress as `0x${string}`,
      abi: CHAINLINK_AGGREGATOR_ABI,
      functionName: "decimals" as const,
    },
  ]);

  const { data } = useReadContracts({
    contracts,
    query: { refetchInterval: 30_000 },
  });

  const result: Record<string, ChainlinkPriceData | null> = {};
  const NOW = Math.floor(Date.now() / 1000);

  feeds.forEach(([key], i) => {
    const roundData = data?.[i * 2];
    const decimalsData = data?.[i * 2 + 1];

    if (roundData?.status === "success" && decimalsData?.status === "success") {
      const [, answer, , updatedAt] = roundData.result as [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
      ];
      const decimals = Number(decimalsData.result as number);
      const price = Number(answer) / Math.pow(10, decimals);
      result[key] = {
        price,
        decimals,
        updatedAt: Number(updatedAt),
        isStale: NOW - Number(updatedAt) > 3600,
      };
    } else {
      result[key] = null;
    }
  });

  return result;
}
