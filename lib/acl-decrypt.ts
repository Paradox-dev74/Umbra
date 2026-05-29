/**
 * ACL-aware decrypt orchestration with view vs tx path validation.
 */

import type { CofheClient } from "@cofhe/sdk";
import {
  canDecryptField,
  getAccessExplanation,
  type AclRole,
  type DecryptPath,
  type EncryptedField,
  PolicyLifecycle,
} from "@/lib/acl-policy";
import {
  decryptBoolHandle,
  decryptHandle,
  decryptHandleForTx,
} from "@/lib/fhenix";

export class AclDecryptError extends Error {
  constructor(
    message: string,
    public readonly field: EncryptedField,
    public readonly path: DecryptPath,
    public readonly role: AclRole
  ) {
    super(message);
    this.name = "AclDecryptError";
  }
}

export interface DecryptIntent {
  field: EncryptedField;
  path: DecryptPath;
  role: AclRole;
  policyStatus: number;
  ctHash: `0x${string}`;
  valueType?: "uint64" | "bool";
}

function assertDecryptAllowed(intent: DecryptIntent): void {
  const { allowed, reason } = getAccessExplanation(
    intent.role,
    intent.policyStatus,
    intent.field,
    intent.path
  );
  if (!allowed) {
    throw new AclDecryptError(reason, intent.field, intent.path, intent.role);
  }
}

export async function decryptWithIntent(
  client: CofheClient,
  intent: DecryptIntent
): Promise<bigint | boolean | { value: bigint; signature: `0x${string}` }> {
  assertDecryptAllowed(intent);

  if (intent.path === "tx") {
    const { value, signature } = await decryptHandleForTx(client, intent.ctHash);
    return { value, signature };
  }

  if (intent.valueType === "bool") {
    return decryptBoolHandle(client, intent.ctHash);
  }
  return decryptHandle(client, intent.ctHash);
}

/** Settlement: holder/beneficiary decrypt payout via tx path before Privara funding */
export async function decryptPayoutForSettlementTx(
  client: CofheClient,
  role: AclRole,
  policyStatus: number,
  payoutHandle: `0x${string}`
): Promise<{ value: bigint; signature: `0x${string}` }> {
  const result = await decryptWithIntent(client, {
    field: "payout",
    path: "tx",
    role,
    policyStatus,
    ctHash: payoutHandle,
    valueType: "uint64",
  });
  if (typeof result === "bigint") {
    return { value: result, signature: "0x" + "0".repeat(130) as `0x${string}` };
  }
  if (typeof result === "boolean") {
    throw new AclDecryptError("Expected uint64 payout", "payout", "tx", role);
  }
  return result;
}

export async function decryptFieldForView(
  client: CofheClient,
  role: AclRole,
  policyStatus: number,
  field: EncryptedField,
  ctHash: `0x${string}`,
  valueType: "uint64" | "bool" = "uint64"
): Promise<bigint | boolean> {
  const result = await decryptWithIntent(client, {
    field,
    path: "view",
    role,
    policyStatus,
    ctHash,
    valueType,
  });
  if (typeof result === "object") {
    throw new AclDecryptError("View path returned tx signature payload", field, "view", role);
  }
  return result;
}

export function canViewField(role: AclRole, policyStatus: number, field: EncryptedField): boolean {
  return canDecryptField(role, policyStatus, field, "view");
}

export function canTxField(role: AclRole, policyStatus: number, field: EncryptedField): boolean {
  return canDecryptField(role, policyStatus, field, "tx");
}

export function requiresTriggeredStatus(field: EncryptedField): boolean {
  return field === "trigger" || field === "payout" || field === "proximity";
}

export function isLifecycleCompatible(field: EncryptedField, status: number): boolean {
  if (status === PolicyLifecycle.Active) {
    return !requiresTriggeredStatus(field) || field === "proximity";
  }
  if (status === PolicyLifecycle.OracleTriggered || status === PolicyLifecycle.Disputed) {
    return true;
  }
  if (status === PolicyLifecycle.Settled) {
    return field !== "proximity";
  }
  return false;
}
