/**
 * Umbra privacy data classification — single source of truth for UI labels and docs.
 */

export type PrivacyTier =
  | "encrypted_on_chain"
  | "public_on_chain"
  | "local_sealed_decrypt"
  | "external_settlement"
  | "static_copy";

export interface PrivacyField {
  id: string;
  label: string;
  tier: PrivacyTier;
  description: string;
}

export const PRIVACY_FIELDS: PrivacyField[] = [
  {
    id: "coverage",
    label: "Coverage amount",
    tier: "encrypted_on_chain",
    description: "Stored as euint64; decrypt only with CoFHE permit + on-chain ACL.",
  },
  {
    id: "premium",
    label: "Premium",
    tier: "encrypted_on_chain",
    description: "Encrypted premium and ratio validation handles on-chain.",
  },
  {
    id: "threshold",
    label: "Trigger threshold / band",
    tier: "encrypted_on_chain",
    description: "Single threshold or index band bounds remain sealed on-chain.",
  },
  {
    id: "payout",
    label: "Payout amount",
    tier: "encrypted_on_chain",
    description: "Homomorphic select after oracle resolution; Privara router ACL for settlement.",
  },
  {
    id: "policy_meta",
    label: "Policy ID, status, blocks",
    tier: "public_on_chain",
    description: "Existence and lifecycle status are public by design.",
  },
  {
    id: "oracle_feed",
    label: "Oracle feed address",
    tier: "public_on_chain",
    description: "Parametric feed source is public; comparison against encrypted threshold is FHE.",
  },
  {
    id: "oracle_round",
    label: "Chainlink round metadata",
    tier: "public_on_chain",
    description: "Feed address and round ID may be public; encrypted terms stay sealed.",
  },
  {
    id: "portfolio_totals",
    label: "Portfolio totals",
    tier: "local_sealed_decrypt",
    description: "Revealed only in your browser session via decryptForView + permit.",
  },
  {
    id: "escrow_status",
    label: "Privara escrow status",
    tier: "external_settlement",
    description: "ReineiraOS escrow funding and redemption on Arbitrum testnet.",
  },
  {
    id: "marketing",
    label: "Landing copy",
    tier: "static_copy",
    description: "Non-numeric product descriptions; no fabricated live metrics.",
  },
];

export const TIER_LABELS: Record<PrivacyTier, string> = {
  encrypted_on_chain: "Encrypted on-chain",
  public_on_chain: "Public on-chain",
  local_sealed_decrypt: "Sealed local decrypt",
  external_settlement: "Privara settlement",
  static_copy: "Informational",
};

export const TIER_COLORS: Record<PrivacyTier, string> = {
  encrypted_on_chain: "text-umbra-violet",
  public_on_chain: "text-umbra-cyan",
  local_sealed_decrypt: "text-umbra-blue",
  external_settlement: "text-umbra-success",
  static_copy: "text-umbra-muted",
};
