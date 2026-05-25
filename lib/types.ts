/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — TypeScript Type Definitions
   ═══════════════════════════════════════════════════════════ */

export enum PolicyStatus {
  Active = 0,
  Triggered = 1,
  Settled = 2,
  Expired = 3,
  Disputed = 4,
  Cancelled = 5,
}

export enum RiskCategory {
  SupplyChainDelay = 0,
  CommodityPrice = 1,
  WeatherIndex = 2,
  ShippingCost = 3,
  CurrencyVolatility = 4,
}

export interface Policy {
  id: bigint;
  enterprise: `0x${string}`;
  beneficiary: `0x${string}`;
  riskCategory: RiskCategory;
  status: PolicyStatus;
  oracleFeed: `0x${string}`;
  createdAt: bigint;
  policyReferenceHash: `0x${string}`;
}

export interface EncryptedPolicyTerms {
  encCoverage: Uint8Array;
  encThreshold: Uint8Array;
  encPremium: Uint8Array;
  encExpiry: Uint8Array;
}

export interface SettlementRequest {
  policyId: string;
  enterpriseAddress: string;
  beneficiaryAddress: string;
  encryptedCoverageAmount: string;
  policyReferenceHash: string;
  riskCategory: string;
}

export interface SettlementResult {
  transactionHash: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
  privacyNote: string;
}

export interface OracleFeed {
  id: string;
  name: string;
  address: string;
  unit: string;
  currentValue: number;
  lastUpdated: number;
  trend: "up" | "down" | "stable";
}

export interface OracleReading {
  feedAddress: string;
  value: number;
  timestamp: number;
  blockNumber: number;
}

export interface UIPolicy extends Policy {
  categoryLabel: string;
  categoryIcon: string;
  statusLabel: string;
  statusColor: string;
  formattedDate: string;
  oracleFeedName: string;
  truncatedEnterprise: string;
  truncatedBeneficiary: string;
}

export interface CreatePolicyFormData {
  beneficiaryAddress: string;
  riskCategory: RiskCategory;
  policyReferenceName: string;
  policyMode: "single" | "band";
  coverageAmountUsdc: string;
  triggerThreshold: string;
  ceilingThreshold: string;
  premiumUsdc: string;
  deductibleUsdc: string;
  coverageDurationDays: string;
  oracleFeed: string;
  resolutionMode: "automatic" | "manual";
  resolverAddress: string;
}

export type FormStep = 1 | 2 | 3 | 4;

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  radius: number;
  opacityDirection: number;
}

export interface StatItem {
  value: string;
  numericValue: number;
  prefix: string;
  suffix: string;
  label: string;
}

export interface EncryptedValueProps {
  value: string | null;
  unit: string;
  onDecryptRequest: () => Promise<string>;
  className?: string;
}
