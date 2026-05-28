"use client";

import { useAccount, useReadContract } from "wagmi";
import { UMBRA_CONTRACT_ADDRESS, UMBRA_TRUSTED_ORACLE } from "@/lib/constants";
import { UMBRA_ABI } from "@/lib/abi";
import { useContractOwner } from "@/hooks/usePrivacyFeatures";

export type UmbraRole =
  | "guest"
  | "holder"
  | "oracle"
  | "owner"
  | "beneficiary"
  | "arbitrator"
  | "reinsurer";

export function useUserRoles(policy?: {
  holder?: `0x${string}`;
  beneficiary?: `0x${string}`;
  status?: number;
}) {
  const { address, isConnected } = useAccount();
  const { data: contractOwner } = useContractOwner();

  const { data: isReinsurer } = useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "isGlobalExposureViewer",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const roles: UmbraRole[] = [];

  if (!isConnected || !address) {
    return { roles: ["guest"] as UmbraRole[], primaryRole: "guest" as UmbraRole, address };
  }

  if (address.toLowerCase() === UMBRA_TRUSTED_ORACLE.toLowerCase()) {
    roles.push("oracle");
  }
  if (contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase()) {
    roles.push("owner");
  }
  if (isReinsurer) roles.push("reinsurer");
  if (policy?.holder && address.toLowerCase() === policy.holder.toLowerCase()) {
    roles.push("holder");
  }
  if (policy?.beneficiary && address.toLowerCase() === policy.beneficiary.toLowerCase()) {
    roles.push("beneficiary");
  }
  if (roles.length === 0) roles.push("holder");

  const priority: UmbraRole[] = ["owner", "oracle", "arbitrator", "reinsurer", "holder", "beneficiary", "guest"];
  const primaryRole = priority.find((r) => roles.includes(r)) ?? "holder";

  return { roles, primaryRole, address };
}

export function useIsAssignedArbitrator(policyId: number) {
  const { address } = useAccount();
  const { data: arbitrator } = useReadContract({
    address: UMBRA_CONTRACT_ADDRESS,
    abi: UMBRA_ABI,
    functionName: "disputeArbitrator",
    args: [BigInt(policyId)],
    query: { enabled: policyId >= 0 && !!address },
  });

  return (
    !!address &&
    !!arbitrator &&
    (arbitrator as string).toLowerCase() === address.toLowerCase()
  );
}
