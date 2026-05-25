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

export const ORACLE_FEEDS: Record<
  string,
  {
    name: string;
    /** On-chain feed address (Chainlink AggregatorV3 on Sepolia for real feeds) */
    address: string;
    /** Set when there is a real Chainlink AggregatorV3 address to query */
    chainlinkAddress?: string;
    unit: string;
    /** Fallback / initial display value */
    currentValue: number;
    trend: "up" | "down" | "stable";
    /** True for feeds that have no real on-chain data (testnet only) */
    simulated?: boolean;
  }
> = {
  ETH_USD: {
    name: "ETH / USD",
    address: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    chainlinkAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    unit: "USD",
    currentValue: 3200,
    trend: "up",
  },
  BTC_USD: {
    name: "BTC / USD",
    address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    chainlinkAddress: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    unit: "USD",
    currentValue: 65000,
    trend: "up",
  },
  LINK_USD: {
    name: "LINK / USD",
    address: "0xc59E3633BAAC79493d908e63626716e204a45EdF",
    chainlinkAddress: "0xc59E3633BAAC79493d908e63626716e204a45EdF",
    unit: "USD",
    currentValue: 14.5,
    trend: "stable",
  },
  USDC_USD: {
    name: "USDC / USD",
    address: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
    chainlinkAddress: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
    unit: "USD",
    currentValue: 1.0001,
    trend: "stable",
  },
  BALTIC_DRY: {
    name: "Baltic Dry Index",
    address: "0x0000000000000000000000000000000000000000",
    unit: "BDI Points",
    currentValue: 1247,
    trend: "up",
    simulated: true,
  },
  SHIPPING_FBX: {
    name: "Freightos FBX",
    address: "0x0000000000000000000000000000000000000000",
    unit: "USD/FEU",
    currentValue: 284,
    trend: "down",
    simulated: true,
  },
};

export const RISK_CATEGORIES = [
  {
    id: "SUPPLY_CHAIN",
    value: 0,
    label: "Supply Chain Delay",
    icon: "🚢",
    oracle: "Baltic Dry Index",
    fheOperator: "FHE.gte",
    description: "Coverage for logistics and shipping delay indices exceeding your hidden threshold.",
  },
  {
    id: "COMMODITY",
    value: 1,
    label: "Commodity Price",
    icon: "📊",
    oracle: "Chainlink Price Feed",
    fheOperator: "FHE.lte",
    description: "Protection against commodity price drops below your encrypted strike price.",
  },
  {
    id: "WEATHER",
    value: 2,
    label: "Weather Index",
    icon: "🌡️",
    oracle: "AccuWeather API",
    fheOperator: "FHE.gte",
    description: "Parametric coverage tied to temperature and precipitation risk indices.",
  },
  {
    id: "SHIPPING",
    value: 3,
    label: "Shipping Cost",
    icon: "📦",
    oracle: "Freightos FBX",
    fheOperator: "FHE.gte",
    description: "Freight rate spike protection using global container shipping indices.",
  },
  {
    id: "CURRENCY",
    value: 4,
    label: "Currency Volatility",
    icon: "💱",
    oracle: "Chainlink FX Feed",
    fheOperator: "FHE.gte",
    description: "FX volatility coverage for cross-border enterprise treasury operations.",
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

export const DEMO_POLICIES = [
  {
    id: BigInt(1),
    enterprise: "0xABcD000000000000000000000000000000001234" as `0x${string}`,
    beneficiary: "0xDEF0000000000000000000000000000000005678" as `0x${string}`,
    riskCategory: 0,
    status: 0,
    oracleFeed: "0x1111000000000000000000000000000000000001" as `0x${string}`,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 3),
    policyReferenceHash: "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" as `0x${string}`,
    coverageAmount: 2400000,
    triggerThreshold: 1200,
    premium: 48000,
    expiryBlock: 9999999,
  },
  {
    id: BigInt(2),
    enterprise: "0xABcD000000000000000000000000000000001234" as `0x${string}`,
    beneficiary: "0x9876000000000000000000000000000000005432" as `0x${string}`,
    riskCategory: 2,
    status: 1,
    oracleFeed: "0x1111000000000000000000000000000000000003" as `0x${string}`,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 7),
    policyReferenceHash: "0xf6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5" as `0x${string}`,
    coverageAmount: 5000000,
    triggerThreshold: 847,
    premium: 95000,
    expiryBlock: 9999999,
  },
  {
    id: BigInt(3),
    enterprise: "0xABcD000000000000000000000000000000001234" as `0x${string}`,
    beneficiary: "0xBBBB000000000000000000000000000000003333" as `0x${string}`,
    riskCategory: 3,
    status: 2,
    oracleFeed: "0x1111000000000000000000000000000000000002" as `0x${string}`,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
    policyReferenceHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as `0x${string}`,
    coverageAmount: 1200000,
    triggerThreshold: 300,
    premium: 24000,
    expiryBlock: 8888888,
  },
  {
    id: BigInt(4),
    enterprise: "0xABcD000000000000000000000000000000001234" as `0x${string}`,
    beneficiary: "0xCCCC000000000000000000000000000000004444" as `0x${string}`,
    riskCategory: 4,
    status: 3,
    oracleFeed: "0x1111000000000000000000000000000000000005" as `0x${string}`,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 86400 * 30),
    policyReferenceHash: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" as `0x${string}`,
    coverageAmount: 800000,
    triggerThreshold: 3500,
    premium: 16000,
    expiryBlock: 7777777,
  },
];
