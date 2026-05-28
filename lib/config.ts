/**
 * Runtime configuration with explicit validation — fail loudly in dev when misconfigured.
 */

import { UMBRA_CONTRACT_ADDRESS, UMBRA_TRUSTED_ORACLE } from "./constants";

export interface UmbraConfig {
  contractAddress: `0x${string}`;
  trustedOracle: `0x${string}`;
  walletConnectProjectId: string;
  sepoliaRpcUrl: string;
  privaraEnabled: boolean;
  contractVersion: string;
}

function requireAddress(value: string | undefined, name: string): `0x${string}` {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    if (typeof window === "undefined") {
      return "0x0000000000000000000000000000000000000000";
    }
    console.warn(`[Umbra] Missing or invalid ${name}`);
    return "0x0000000000000000000000000000000000000000";
  }
  return value as `0x${string}`;
}

export function getUmbraConfig(): UmbraConfig {
  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

  if (
    typeof window !== "undefined" &&
    (!walletConnectProjectId || walletConnectProjectId === "PLACEHOLDER_PROJECT_ID")
  ) {
    console.warn(
      "[Umbra] Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for reliable wallet connections."
    );
  }

  return {
    contractAddress: requireAddress(
      process.env.NEXT_PUBLIC_UMBRA_CONTRACT ?? UMBRA_CONTRACT_ADDRESS,
      "NEXT_PUBLIC_UMBRA_CONTRACT"
    ),
    trustedOracle: requireAddress(
      process.env.NEXT_PUBLIC_UMBRA_ORACLE ?? UMBRA_TRUSTED_ORACLE,
      "NEXT_PUBLIC_UMBRA_ORACLE"
    ),
    walletConnectProjectId,
    sepoliaRpcUrl:
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
      "https://ethereum-sepolia-rpc.publicnode.com",
    privaraEnabled: process.env.NEXT_PUBLIC_PRIVARA_ENABLED !== "false",
    contractVersion: process.env.NEXT_PUBLIC_UMBRA_VERSION ?? "V5",
  };
}

export const umbraConfig = getUmbraConfig();
