/**
 * Umbra ACL policy matrix — who can decrypt what, when, and via which path.
 * Single source of truth for UI gating, decrypt intent, and tests.
 */

import type { UmbraRole } from "@/hooks/useUserRole";

/** Matches IUmbra.PolicyStatus enum on-chain */
export enum PolicyLifecycle {
  Active = 0,
  OracleTriggered = 1,
  Settled = 2,
  Expired = 3,
  Disputed = 4,
  Cancelled = 5,
}

export type EncryptedField =
  | "coverage"
  | "premium"
  | "threshold"
  | "floor"
  | "ceiling"
  | "deductible"
  | "ratioValid"
  | "proximity"
  | "trigger"
  | "payout"
  | "holderExposure"
  | "globalExposure";

export type DecryptPath = "view" | "tx" | "none";

export type AclRole =
  | UmbraRole
  | "auditor"
  | "privaraRouter";

export interface FieldAccessRule {
  field: EncryptedField;
  path: DecryptPath;
  /** Human-readable lifecycle window */
  when: string;
}

type MatrixEntry = Partial<Record<EncryptedField, DecryptPath>>;

/** Base on-chain ACL by role + policy status (before holder delegation) */
const BASE_MATRIX: Record<
  AclRole,
  Partial<Record<PolicyLifecycle, MatrixEntry>>
> = {
  guest: {},
  holder: {
    [PolicyLifecycle.Active]: {
      coverage: "view",
      premium: "view",
      threshold: "view",
      floor: "view",
      ceiling: "view",
      deductible: "view",
      ratioValid: "view",
      holderExposure: "view",
    },
    [PolicyLifecycle.OracleTriggered]: {
      coverage: "view",
      premium: "view",
      threshold: "view",
      floor: "view",
      ceiling: "view",
      deductible: "view",
      ratioValid: "view",
      trigger: "view",
      payout: "view",
      proximity: "view",
      holderExposure: "view",
    },
    [PolicyLifecycle.Settled]: {
      coverage: "view",
      premium: "view",
      trigger: "view",
      payout: "view",
      holderExposure: "view",
    },
    [PolicyLifecycle.Disputed]: {
      coverage: "view",
      premium: "view",
      trigger: "view",
      payout: "view",
      ratioValid: "view",
      proximity: "view",
    },
  },
  beneficiary: {
    [PolicyLifecycle.Active]: {
      coverage: "view",
      premium: "view",
      threshold: "view",
      floor: "view",
      ceiling: "view",
      deductible: "view",
      ratioValid: "view",
    },
    [PolicyLifecycle.OracleTriggered]: {
      coverage: "view",
      trigger: "view",
      payout: "view",
      proximity: "view",
    },
    [PolicyLifecycle.Settled]: {
      trigger: "view",
      payout: "view",
    },
    [PolicyLifecycle.Disputed]: {
      trigger: "view",
      payout: "view",
      ratioValid: "view",
      proximity: "view",
    },
  },
  oracle: {
    [PolicyLifecycle.OracleTriggered]: {
      trigger: "view",
    },
    [PolicyLifecycle.Settled]: {
      trigger: "view",
    },
  },
  privaraRouter: {
    [PolicyLifecycle.OracleTriggered]: {
      payout: "tx",
    },
  },
  arbitrator: {
    [PolicyLifecycle.Disputed]: {
      trigger: "view",
      payout: "view",
      ratioValid: "view",
      proximity: "view",
    },
  },
  auditor: {
    /** Effective only after holder grantViewerAccess + CoFHE sharing permit */
  },
  reinsurer: {
    [PolicyLifecycle.Active]: { globalExposure: "view" },
    [PolicyLifecycle.OracleTriggered]: { globalExposure: "view" },
    [PolicyLifecycle.Settled]: { globalExposure: "view" },
  },
  owner: {
    [PolicyLifecycle.Active]: { globalExposure: "view" },
    [PolicyLifecycle.OracleTriggered]: { globalExposure: "view" },
    [PolicyLifecycle.Settled]: { globalExposure: "view" },
    [PolicyLifecycle.Disputed]: { globalExposure: "view" },
  },
};

/** Holder delegation presets → on-chain grantViewerAccess field flags */
export const DELEGATION_PRESETS = {
  auditor: {
    label: "Auditor (read-only)",
    description: "Coverage, premium, bounds — view path only; requires CoFHE sharing permit.",
    path: "view" as DecryptPath,
    fields: {
      coverage: true,
      premium: true,
      threshold: true,
      deductible: true,
      ratioValid: true,
      trigger: false,
      payout: false,
      proximity: false,
    },
    issuePermit: true,
  },
  beneficiaryReview: {
    label: "Beneficiary review",
    description: "Post-resolve trigger + payout for beneficiary wallet verification.",
    path: "view" as DecryptPath,
    fields: {
      coverage: true,
      trigger: true,
      payout: true,
      premium: false,
      threshold: false,
      deductible: false,
      ratioValid: false,
      proximity: true,
    },
    issuePermit: false,
  },
  arbitratorReview: {
    label: "Arbitrator review",
    description: "Dispute phase: trigger, payout, ratio, proximity.",
    path: "view" as DecryptPath,
    fields: {
      trigger: true,
      payout: true,
      ratioValid: true,
      proximity: true,
      coverage: false,
      premium: false,
      threshold: false,
      deductible: false,
    },
    issuePermit: false,
  },
  reinsurerSummary: {
    label: "Reinsurer summary",
    description: "Global exposure only — owner must grant global exposure viewer.",
    path: "view" as DecryptPath,
    fields: {
      coverage: false,
      premium: false,
      threshold: false,
      deductible: false,
      ratioValid: false,
      trigger: false,
      payout: false,
      proximity: false,
    },
    issuePermit: false,
    globalExposureOnly: true,
  },
} as const;

export type DelegationPresetId = keyof typeof DELEGATION_PRESETS;

export function normalizeRole(role: UmbraRole | AclRole): AclRole {
  return role as AclRole;
}

export function getBasePathForField(
  role: AclRole,
  status: PolicyLifecycle | number,
  field: EncryptedField
): DecryptPath {
  const lifecycle = status as PolicyLifecycle;
  const roleMatrix = BASE_MATRIX[role];
  if (!roleMatrix) return "none";
  const statusEntry = roleMatrix[lifecycle];
  if (!statusEntry) return "none";
  return statusEntry[field] ?? "none";
}

export function canDecryptField(
  role: AclRole,
  status: PolicyLifecycle | number,
  field: EncryptedField,
  path: DecryptPath,
  delegatedFields?: Partial<Record<EncryptedField, boolean>>
): boolean {
  const lifecycle = status as PolicyLifecycle;

  if (role === "auditor" && delegatedFields?.[field]) {
    return path === "view";
  }

  if (role === "privaraRouter" && field === "payout" && path === "view") {
    return false;
  }

  // Holder/beneficiary: payout supports view reveal and tx-path settlement prep
  if (
    (role === "holder" || role === "beneficiary") &&
    field === "payout" &&
    lifecycle === PolicyLifecycle.OracleTriggered &&
    (path === "view" || path === "tx")
  ) {
    return true;
  }

  const basePath = getBasePathForField(role, lifecycle, field);

  if (basePath === "none") return false;
  if (path === "view") return basePath === "view" || basePath === "tx";
  if (path === "tx") return basePath === "tx";
  return false;
}

export function allowedFieldsForRole(
  role: AclRole,
  status: PolicyLifecycle | number,
  path: DecryptPath = "view"
): EncryptedField[] {
  const fields: EncryptedField[] = [
    "coverage",
    "premium",
    "threshold",
    "floor",
    "ceiling",
    "deductible",
    "ratioValid",
    "proximity",
    "trigger",
    "payout",
    "holderExposure",
    "globalExposure",
  ];
  return fields.filter((f) => canDecryptField(role, status, f, path));
}

export function getAccessExplanation(
  role: AclRole,
  status: PolicyLifecycle | number,
  field: EncryptedField,
  path: DecryptPath
): { allowed: boolean; reason: string } {
  const allowed = canDecryptField(role, status, field, path);
  if (allowed) {
    const base = getBasePathForField(role, status, field);
    return {
      allowed: true,
      reason:
        base === "tx"
          ? `On-chain ACL allows ${path} decrypt for settlement/action flows.`
          : `On-chain ACL allows sealed ${path} decrypt for ${field}.`,
    };
  }

  if (role === "auditor") {
    return {
      allowed: false,
      reason: "Auditor requires holder grantViewerAccess + active CoFHE sharing permit.",
    };
  }
  if (role === "oracle" && field !== "trigger") {
    return { allowed: false, reason: "Oracle ACL is limited to trigger ebool after resolution." };
  }
  if (role === "privaraRouter" && field === "payout" && path === "view") {
    return { allowed: false, reason: "Privara router uses tx-path decrypt for payout, not view reveal." };
  }
  if (path === "tx" && getBasePathForField(role, status, field) === "view") {
    return { allowed: false, reason: `${field} is view-only for this role at this lifecycle stage.` };
  }

  return {
    allowed: false,
    reason: `No on-chain ACL for ${role} on ${field} while status=${PolicyLifecycle[status as number] ?? status}.`,
  };
}

export function policyStatusLabel(status: number): string {
  return PolicyLifecycle[status] ?? `Unknown(${status})`;
}

export function decryptPathLabel(path: DecryptPath): string {
  switch (path) {
    case "view":
      return "decryptForView";
    case "tx":
      return "decryptForTx";
    default:
      return "none";
  }
}

/** Map grantViewerAccess booleans to encrypted fields */
export function grantedFieldsFromFlags(flags: {
  allowCoverage: boolean;
  allowPremium: boolean;
  allowThreshold: boolean;
  allowDeductible: boolean;
  allowRatioValid: boolean;
  allowTrigger: boolean;
  allowPayout: boolean;
  allowProximity: boolean;
}): EncryptedField[] {
  const out: EncryptedField[] = [];
  if (flags.allowCoverage) out.push("coverage");
  if (flags.allowPremium) out.push("premium");
  if (flags.allowThreshold) out.push("threshold", "floor", "ceiling");
  if (flags.allowDeductible) out.push("deductible");
  if (flags.allowRatioValid) out.push("ratioValid");
  if (flags.allowTrigger) out.push("trigger");
  if (flags.allowPayout) out.push("payout");
  if (flags.allowProximity) out.push("proximity");
  return out;
}
