"use client";

import {
  useReadContract,
  useWriteContract,
  useAccount,
} from "wagmi";
import { UMBRA_CONTRACT_ADDRESS } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";

export function useHolderExposureHandle() {
  const { address } = useAccount();
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getHolderExposureHandle",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useGlobalExposureHandle() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "getGlobalExposureHandle",
  });
}

export function useMaxPremiumRatioDivisor() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "maxPremiumRatioDivisor",
  });
}

export function useOracleMaxStaleness() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "oracleMaxStaleness",
  });
}

export function useContractOwner() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "owner",
  });
}

export function useContractPaused() {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "paused",
  });
}

export function useIsGlobalExposureViewer(viewer?: `0x${string}`) {
  return useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "isGlobalExposureViewer",
    args: viewer ? [viewer] : undefined,
    query: { enabled: !!viewer },
  });
}

export function useGrantViewerAccess() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const grantAccess = async (params: {
    policyId: number;
    viewer: `0x${string}`;
    allowCoverage: boolean;
    allowPremium: boolean;
    allowThreshold: boolean;
    allowDeductible: boolean;
    allowRatioValid?: boolean;
    allowTrigger?: boolean;
    allowPayout?: boolean;
    allowProximity?: boolean;
  }) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "grantViewerAccess",
      args: [
        BigInt(params.policyId),
        params.viewer,
        params.allowCoverage,
        params.allowPremium,
        params.allowThreshold,
        params.allowDeductible,
        params.allowRatioValid ?? false,
        params.allowTrigger ?? false,
        params.allowPayout ?? false,
        params.allowProximity ?? false,
      ],
    });

  return { grantAccess, isPending, error };
}

export function useGrantGlobalExposureViewer() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const grantGlobalViewer = async (viewer: `0x${string}`) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "grantGlobalExposureViewer",
      args: [viewer],
    });
  return { grantGlobalViewer, isPending, error };
}

export function useRefreshProximityFromChainlink() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const refreshProximity = async (policyId: number) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "refreshProximityFromChainlink",
      args: [BigInt(policyId)],
    });
  return { refreshProximity, isPending, error };
}

export function useResolveWithChainlink() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const resolveWithChainlink = async (policyId: number) =>
    writeContractAsync({
      address: UMBRA_CONTRACT_ADDRESS,
      abi: UMBRA_ABI,
      functionName: "resolveWithChainlink",
      args: [BigInt(policyId)],
    });
  return { resolveWithChainlink, isPending, error };
}

export function useOwnerAdmin() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  return {
    setPaused: (paused: boolean) =>
      writeContractAsync({
        address: UMBRA_CONTRACT_ADDRESS,
        abi: UMBRA_ABI,
        functionName: "setPaused",
        args: [paused],
      }),
    setTrustedOracle: (oracle: `0x${string}`) =>
      writeContractAsync({
        address: UMBRA_CONTRACT_ADDRESS,
        abi: UMBRA_ABI,
        functionName: "setTrustedOracle",
        args: [oracle],
      }),
    setPrivaraRouter: (router: `0x${string}`) =>
      writeContractAsync({
        address: UMBRA_CONTRACT_ADDRESS,
        abi: UMBRA_ABI,
        functionName: "setPrivaraRouter",
        args: [router],
      }),
    setOracleMaxStaleness: (seconds: bigint) =>
      writeContractAsync({
        address: UMBRA_CONTRACT_ADDRESS,
        abi: UMBRA_ABI,
        functionName: "setOracleMaxStaleness",
        args: [seconds],
      }),
    isPending,
    error,
  };
}

export interface ViewerAccessLogEntry {
  policyId: bigint;
  viewer: `0x${string}`;
  coverage: boolean;
  premium: boolean;
  threshold: boolean;
  deductible: boolean;
  ratioValid: boolean;
  trigger: boolean;
  payout: boolean;
  proximity: boolean;
}
