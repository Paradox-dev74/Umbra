/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Smart Contract Interaction Hook
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useReadContract, useReadContracts, useWriteContract, useAccount } from "wagmi";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";

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
  policyMode: number;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

export function usePolicyCount() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getPolicyCount",
  });
}

export function useHolderPolicyCount() {
  const { address } = useAccount();
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getHolderPolicyCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useUserPolicies() {
  const { address } = useAccount();
  const { data: holderCount, isLoading: holderCountLoading } = useHolderPolicyCount();
  const { data: totalCountData, isLoading: totalLoading } = usePolicyCount();

  const count = holderCount !== undefined ? Number(holderCount) : 0;
  const useIndexed = count > 0 || holderCount !== undefined;

  const indexedContracts = Array.from({ length: count }, (_, i) => ({
    address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
    abi: UMBRA_ABI,
    functionName: "getHolderPolicyId" as const,
    args: [address!, BigInt(i)],
  }));

  const { data: idResults, isLoading: idsLoading } = useReadContracts({
    contracts: indexedContracts,
    query: { enabled: !!address && useIndexed && count > 0 },
  });

  const policyIds: number[] = [];
  if (idResults) {
    for (const r of idResults) {
      if (r.status === "success" && r.result !== undefined) {
        policyIds.push(Number(r.result));
      }
    }
  }

  const totalCount = totalCountData ? Number(totalCountData) : 0;
  const fallbackContracts = Array.from({ length: totalCount }, (_, i) => ({
    address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
    abi: UMBRA_ABI,
    functionName: "getPolicy" as const,
    args: [BigInt(i)],
  }));

  const { data: fallbackResults, isLoading: fallbackLoading } = useReadContracts({
    contracts: fallbackContracts,
    query: { enabled: !!address && !useIndexed && totalCount > 0 },
  });

  const policyContracts = policyIds.map((id) => ({
    address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
    abi: UMBRA_ABI,
    functionName: "getPolicy" as const,
    args: [BigInt(id)],
  }));

  const { data: policyResults, isLoading: policiesLoading, refetch } = useReadContracts({
    contracts: policyContracts,
    query: { enabled: policyIds.length > 0 },
  });

  const policies: OnChainPolicy[] = [];

  if (policyResults && address) {
    for (const r of policyResults) {
      if (r.status === "success" && r.result) {
        policies.push(r.result as OnChainPolicy);
      }
    }
  }

  if (fallbackResults && address && !useIndexed) {
    for (const r of fallbackResults) {
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
    isLoading: holderCountLoading || totalLoading || idsLoading || policiesLoading || fallbackLoading,
    refetch,
    totalCount: useIndexed ? count : totalCount,
  };
}

export function useAllActivePolicies() {
  const { data: countData } = usePolicyCount();
  const count = countData ? Number(countData) : 0;

  const contracts = Array.from({ length: count }, (_, i) => ({
    address: UMBRA_CONTRACT_ADDRESS as `0x${string}`,
    abi: UMBRA_ABI,
    functionName: "getPolicy" as const,
    args: [BigInt(i)],
  }));

  const { data: results, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: count > 0 },
  });

  const policies: OnChainPolicy[] = [];
  if (results) {
    for (const r of results) {
      if (r.status === "success" && r.result) {
        const p = r.result as OnChainPolicy;
        if (p.holder !== ZERO_ADDRESS && p.status === 0) {
          policies.push(p);
        }
      }
    }
  }

  return { policies, isLoading, refetch, totalCount: count };
}

export function usePolicy(policyId: number) {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getPolicy",
    args: [BigInt(policyId)],
    query: { enabled: !Number.isNaN(policyId) && policyId >= 0 },
  });
}

export function useDisputeArbitrator(policyId: number) {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "disputeArbitrator",
    args: [BigInt(policyId)],
    query: { enabled: !Number.isNaN(policyId) && policyId >= 0 },
  });
}

export function isValidPolicy(policy: OnChainPolicy | undefined): policy is OnChainPolicy {
  if (!policy) return false;
  return policy.holder.toLowerCase() !== ZERO_ADDRESS;
}

export function isPolicyNotFound(policy: OnChainPolicy | undefined): boolean {
  return !isValidPolicy(policy);
}

export function isIndexBandPolicy(policy: OnChainPolicy | undefined): boolean {
  return policy?.policyMode === 1;
}

export function usePolicyHandles(policyId: number) {
  const enabled = !Number.isNaN(policyId) && policyId >= 0;
  const args = [BigInt(policyId)] as const;
  const base = { address: UMBRA_CONTRACT_ADDRESS, abi: UMBRA_ABI, query: { enabled } };

  const { data: coverageHandle } = useReadContract({ ...base, functionName: "getCoverageHandle", args });
  const { data: premiumHandle } = useReadContract({ ...base, functionName: "getPremiumHandle", args });
  const { data: thresholdHandle } = useReadContract({ ...base, functionName: "getThresholdHandle", args });
  const { data: floorHandle } = useReadContract({ ...base, functionName: "getFloorHandle", args });
  const { data: ceilingHandle } = useReadContract({ ...base, functionName: "getCeilingHandle", args });
  const { data: triggerHandle } = useReadContract({ ...base, functionName: "getTriggerResultHandle", args });
  const { data: payoutHandle } = useReadContract({ ...base, functionName: "getPayoutHandle", args });
  const { data: deductibleHandle } = useReadContract({ ...base, functionName: "getDeductibleHandle", args });
  const { data: ratioValidHandle } = useReadContract({ ...base, functionName: "getPremiumRatioValidHandle", args });
  const { data: proximityHandle } = useReadContract({ ...base, functionName: "getProximityFlagHandle", args });

  const isValidHandle = (h: unknown) => typeof h === "string" && h !== ZERO_HASH;

  return {
    coverageHandle: coverageHandle as `0x${string}` | undefined,
    premiumHandle: premiumHandle as `0x${string}` | undefined,
    thresholdHandle: isValidHandle(thresholdHandle) ? (thresholdHandle as `0x${string}`) : undefined,
    floorHandle: isValidHandle(floorHandle) ? (floorHandle as `0x${string}`) : undefined,
    ceilingHandle: isValidHandle(ceilingHandle) ? (ceilingHandle as `0x${string}`) : undefined,
    triggerHandle: triggerHandle as `0x${string}` | undefined,
    payoutHandle: payoutHandle as `0x${string}` | undefined,
    deductibleHandle: isValidHandle(deductibleHandle) ? (deductibleHandle as `0x${string}`) : undefined,
    ratioValidHandle: ratioValidHandle as `0x${string}` | undefined,
    proximityHandle: isValidHandle(proximityHandle) ? (proximityHandle as `0x${string}`) : undefined,
  };
}

export function useMarkSettled() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const markSettled = async (policyId: number, settlementTxHash: `0x${string}`) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "markSettled",
      args: [BigInt(policyId), settlementTxHash],
    });
  return { markSettled, isPending, error };
}

export function useResolveWithOracle() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const resolveWithOracle = async (policyId: number, oracleValue: bigint) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "resolveWithOracle",
      args: [BigInt(policyId), oracleValue, true],
    });
  return { resolveWithOracle, isPending, error };
}

export function useCancelPolicy() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const cancelPolicy = async (policyId: number) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "cancelPolicy",
      args: [BigInt(policyId)],
    });
  return { cancelPolicy, isPending, error };
}

export function useExpirePolicy() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const expirePolicy = async (policyId: number) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "expirePolicy",
      args: [BigInt(policyId)],
    });
  return { expirePolicy, isPending, error };
}

export function useDisputePolicy() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const disputePolicy = async (policyId: number, arbitrator: `0x${string}`) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "disputePolicy",
      args: [BigInt(policyId), arbitrator],
    });
  return { disputePolicy, isPending, error };
}

export function useResolveDispute() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const resolveDispute = async (policyId: number, uphold: boolean) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "resolveDispute",
      args: [BigInt(policyId), uphold],
    });
  return { resolveDispute, isPending, error };
}
