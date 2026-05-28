"use client";

import { useReadContract } from "wagmi";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";

export interface ProtocolStats {
  totalPolicies: number;
  activePolicies: number;
  triggeredPolicies: number;
  settledPolicies: number;
  riskCategories: number;
  isLoading: boolean;
}

export function useProtocolStats(): ProtocolStats {
  const { data: countData, isLoading: countLoading } = useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getPolicyCount",
  });

  const totalPolicies = countData ? Number(countData) : 0;

  return {
    totalPolicies,
    activePolicies: totalPolicies,
    triggeredPolicies: 0,
    settledPolicies: 0,
    riskCategories: 5,
    isLoading: countLoading,
  };
}

export function usePolicyCountStat() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getPolicyCount",
  });
}
