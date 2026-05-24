/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Smart Contract Interaction Hook
   Uses wagmi v2 readContract / writeContract for real on-chain data.
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useReadContract, useReadContracts, useWriteContract, useAccount } from "wagmi";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";

/* ── Types ─────────────────────────────────────────────── */
export interface OnChainPolicy {
  id: bigint;
  holder: `0x${string}`;
  beneficiary: `0x${string}`;
  riskCategory: number;
  oracleFeed: `0x${string}`;
  status: number;
  createdBlock: bigint;
  expiryBlock: bigint;
  policyHash: `0x${string}`;
  resolvedBlock: bigint;
  settlementTx: `0x${string}`;
}

/* ── Hook: read total policy count ─────────────────────── */
export function usePolicyCount() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getPolicyCount",
  });
}

/* ── Hook: read all policies for the connected wallet ──── */
export function useUserPolicies() {
  const { address } = useAccount();
  const { data: countData, isLoading: countLoading } = usePolicyCount();
  const count = countData ? Number(countData) : 0;

  // Build a multicall for all getPolicy(id) calls
  const contracts = Array.from({ length: count }, (_, i) => ({
    address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
    abi: UMBRA_ABI,
    functionName: "getPolicy" as const,
    args: [BigInt(i + 1)],
  }));

  const { data: results, isLoading: policiesLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: count > 0 },
  });

  // Filter to policies where holder === connected wallet
  const policies: OnChainPolicy[] = [];
  if (results && address) {
    for (const r of results) {
      if (r.status === "success" && r.result) {
        const p = r.result as OnChainPolicy;
        if (p.holder.toLowerCase() === address.toLowerCase()) {
          policies.push(p);
        }
      }
    }
  }

  return {
    policies,
    isLoading: countLoading || policiesLoading,
    refetch,
    totalCount: count,
  };
}

/* ── Hook: read a single policy ─────────────────────────── */
export function usePolicy(policyId: number) {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getPolicy",
    args: [BigInt(policyId)],
    query: { enabled: policyId > 0 },
  });
}

/* ── Hook: read FHE handles for a policy ────────────────── */
export function usePolicyHandles(policyId: number) {
  const enabled = policyId > 0;
  const { data: coverageHandle } = useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getCoverageHandle",
    args: [BigInt(policyId)],
    query: { enabled },
  });
  const { data: premiumHandle } = useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getPremiumHandle",
    args: [BigInt(policyId)],
    query: { enabled },
  });
  const { data: thresholdHandle } = useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getThresholdHandle",
    args: [BigInt(policyId)],
    query: { enabled },
  });
  const { data: triggerHandle } = useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getTriggerResultHandle",
    args: [BigInt(policyId)],
    query: { enabled },
  });

  return {
    coverageHandle: coverageHandle as `0x${string}` | undefined,
    premiumHandle: premiumHandle as `0x${string}` | undefined,
    thresholdHandle: thresholdHandle as `0x${string}` | undefined,
    triggerHandle: triggerHandle as `0x${string}` | undefined,
  };
}

/* ── Hook: write — mark settled ─────────────────────────── */
export function useMarkSettled() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const markSettled = async (policyId: number, settlementTxHash: `0x${string}`) => {
    return writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "markSettled",
      args: [BigInt(policyId), settlementTxHash],
    });
  };

  return { markSettled, isPending, error };
}

/* ── Hook: write — resolve with oracle ─────────────────── */
export function useResolveWithOracle() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const resolveWithOracle = async (policyId: number, oracleValue: bigint) => {
    return writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "resolveWithOracle",
      args: [BigInt(policyId), oracleValue, true],
    });
  };

  return { resolveWithOracle, isPending, error };
}

/* ── Hook: write — cancel policy (holder only) ──────────── */
export function useCancelPolicy() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const cancelPolicy = async (policyId: number) => {
    return writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "cancelPolicy",
      args: [BigInt(policyId)],
    });
  };

  return { cancelPolicy, isPending, error };
}
