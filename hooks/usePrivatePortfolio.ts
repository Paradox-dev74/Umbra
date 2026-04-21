"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useFhenix } from "@/hooks/useFhenix";

/** Batch-decrypt active policy coverages for private portfolio totals */
export function usePrivatePortfolio() {
  const { address } = useAccount();
  const { decryptValue, clientReady } = useFhenix();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [totals, setTotals] = useState<{
    totalCoverageUsdc: bigint;
    totalPremiumUsdc: bigint;
    policyCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decryptPortfolio = useCallback(
    async (
      policies: Array<{
        id: number;
        status: number;
        coverageHandle?: `0x${string}`;
        premiumHandle?: `0x${string}`;
      }>
    ) => {
      if (!clientReady || !address) {
        setError("Connect wallet and wait for CoFHE");
        return;
      }
      setIsDecrypting(true);
      setError(null);
      setTotals(null);

      try {
        const active = policies.filter((p) => p.status === 0);
        let totalCoverage = 0n;
        let totalPremium = 0n;
        let decrypted = 0;

        for (const p of active) {
          if (p.coverageHandle) {
            totalCoverage += await decryptValue(p.coverageHandle);
            decrypted++;
          }
          if (p.premiumHandle) {
            totalPremium += await decryptValue(p.premiumHandle);
          }
        }

        setTotals({
          totalCoverageUsdc: totalCoverage,
          totalPremiumUsdc: totalPremium,
          policyCount: decrypted,
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Portfolio decrypt failed");
      } finally {
        setIsDecrypting(false);
      }
    },
    [clientReady, address, decryptValue]
  );

  const reset = useCallback(() => {
    setTotals(null);
    setError(null);
  }, []);

  return { decryptPortfolio, isDecrypting, totals, error, reset, clientReady };
}
