/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Constants & Chain Configuration
   ═══════════════════════════════════════════════════════════ */

import { defineChain } from "viem";
import { sepolia } from "viem/chains";

export { sepolia };

export const UMBRA_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_UMBRA_CONTRACT ??
  "0xb424205202228CbC385A8A5E73569A0eA41d3a06") as `0x${string}`;

/** Deployed trusted oracle — must use this wallet to resolve policies */
export const UMBRA_TRUSTED_ORACLE = (process.env.NEXT_PUBLIC_UMBRA_ORACLE ??
  "0x5c56148a9a5E9FA1038243850b5B8242C8D4F1B1") as `0x${string}`;

/** V2 privacy features (deductible, exposure, ACL) — enabled after redeploying latest contract */
export const UMBRA_V2_FEATURES =
  process.env.NEXT_PUBLIC_UMBRA_V2 !== "false";

/** V3: index bands, exposure FHE.sub, proximity ebool, extended ACL, global viewers */
export const UMBRA_V3_FEATURES =
  process.env.NEXT_PUBLIC_UMBRA_V3 !== "false";

/** V4: hardened ACL, dispute arbitrator, holder indexing, oracle-only proximity */
export const UMBRA_V4_FEATURES =
  process.env.NEXT_PUBLIC_UMBRA_V4 !== "false";

export const PolicyMode = {
  SingleThreshold: 0,
  IndexBand: 1,
} as const;

// Fhenix Helium kept as legacy reference (CoFHE coprocessor now live on Ethereum Sepolia)
export const FHENIX_HELIUM_CHAIN = defineChain({
  id: 8008135,
  name: "Fhenix Helium",
  network: "fhenix-helium",
  nativeCurrency: { name: "tFHE", symbol: "tFHE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.helium.fhenix.zone"] },
    public: { http: ["https://api.helium.fhenix.zone"] },
  },
  blockExplorers: {
    default: {
      name: "Fhenix Explorer",
      url: "https://explorer.helium.fhenix.zone",
    },
  },
  testnet: true,
});

export type OracleFeedConfig = {
  name: string;
  /** On-chain feed address (Chainlink AggregatorV3 on Sepolia) */
  address: string;
  chainlinkAddress: string;
  unit: string;
};

export const ORACLE_FEEDS: Record<string, OracleFeedConfig> = {
  ETH_USD: {
    name: "ETH / USD",
    address: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    chainlinkAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    unit: "USD",
  },
  BTC_USD: {
    name: "BTC / USD",
    address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    chainlinkAddress: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    unit: "USD",
  },
  LINK_USD: {
    name: "LINK / USD",
    address: "0xc59E3633BAAC79493d908e63626716e204a45EdF",
    chainlinkAddress: "0xc59E3633BAAC79493d908e63626716e204a45EdF",
    unit: "USD",
  },
  USDC_USD: {
    name: "USDC / USD",
    address: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
    chainlinkAddress: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
    unit: "USD",
  },
};

/** Default Chainlink feed per risk category when creating a policy */
export const RISK_CATEGORY_DEFAULT_FEED: Record<number, keyof typeof ORACLE_FEEDS> = {
  0: "ETH_USD",
  1: "BTC_USD",
  2: "LINK_USD",
  3: "LINK_USD",
  4: "USDC_USD",
};

export function isLiveOracleFeed(key: string): boolean {
  return key in ORACLE_FEEDS;
}

export const LIVE_ORACLE_FEED_KEYS = Object.keys(ORACLE_FEEDS);

export const RISK_CATEGORIES = [
  {
    id: "SUPPLY_CHAIN",
    value: 0,
    label: "Supply Chain Delay",
    icon: "🚢",
    oracle: "Chainlink ETH/USD",
    fheOperator: "FHE.gte",
    description: "Parametric coverage when ETH/USD crosses your encrypted threshold (testnet proxy for logistics indices).",
  },
  {
    id: "COMMODITY",
    value: 1,
    label: "Commodity Price",
    icon: "📊",
    oracle: "Chainlink BTC/USD",
    fheOperator: "FHE.lte",
    description: "Protection against BTC price drops below your encrypted strike price.",
  },
  {
    id: "WEATHER",
    value: 2,
    label: "Weather Index",
    icon: "🌡️",
    oracle: "Chainlink LINK/USD",
    fheOperator: "FHE.gte",
    description: "Parametric coverage tied to LINK/USD index movement on Sepolia testnet.",
  },
  {
    id: "SHIPPING",
    value: 3,
    label: "Shipping Cost",
    icon: "📦",
    oracle: "Chainlink LINK/USD",
    fheOperator: "FHE.gte",
    description: "Freight-rate spike protection using LINK/USD as the on-chain parametric feed.",
  },
  {
    id: "CURRENCY",
    value: 4,
    label: "Currency Volatility",
    icon: "💱",
    oracle: "Chainlink USDC/USD",
    fheOperator: "FHE.gte",
    description: "FX peg deviation coverage using the USDC/USD Chainlink feed.",
  },
];

export const POLICY_STATUS_CONFIG: Record<
  number,
  { label: string; color: string; dotColor: string; bgColor: string }
> = {
  0: {
    label: "Active",
    color: "text-umbra-success",
    dotColor: "bg-umbra-success",
    bgColor: "bg-umbra-success/10",
  },
  1: {
    label: "Triggered",
    color: "text-umbra-warning",
    dotColor: "bg-umbra-warning",
    bgColor: "bg-umbra-warning/10",
  },
  2: {
    label: "Settled",
    color: "text-umbra-blue",
    dotColor: "bg-umbra-blue",
    bgColor: "bg-umbra-blue/10",
  },
  3: {
    label: "Expired",
    color: "text-gray-500",
    dotColor: "bg-gray-500",
    bgColor: "bg-gray-500/10",
  },
  4: {
    label: "Disputed",
    color: "text-umbra-danger",
    dotColor: "bg-umbra-danger",
    bgColor: "bg-umbra-danger/10",
  },
  5: {
    label: "Cancelled",
    color: "text-gray-600",
    dotColor: "bg-gray-600",
    bgColor: "bg-gray-600/10",
  },
};
