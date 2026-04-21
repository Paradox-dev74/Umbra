"use client";

import { useState, useCallback } from "react";
import { useWalletClient, usePublicClient, useChainId, useAccount } from "wagmi";
import {
  issueSharingAuditPermit,
  type IssuedAuditPermit,
} from "@/lib/permits";

export function useAuditPermit() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isIssuing, setIsIssuing] = useState(false);
  const [lastPermit, setLastPermit] = useState<IssuedAuditPermit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const issuePermit = useCallback(
    async (recipient: `0x${string}`, hours = 24) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error("Wallet not connected");
      }
      setIsIssuing(true);
      setError(null);
      try {
        const permit = await issueSharingAuditPermit(
          publicClient,
          walletClient,
          chainId,
          recipient,
          hours
        );
        setLastPermit(permit);
        return permit;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Permit issuance failed";
        setError(msg);
        throw e;
      } finally {
        setIsIssuing(false);
      }
    },
    [walletClient, publicClient, address, chainId]
  );

  return { issuePermit, isIssuing, lastPermit, error };
}
