/**
 * ACL policy matrix unit tests — deterministic privacy guarantees.
 * Run: npm run test:acl
 */

import assert from "node:assert/strict";
import {
  canDecryptField,
  allowedFieldsForRole,
  getAccessExplanation,
  grantedFieldsFromFlags,
  PolicyLifecycle,
  DELEGATION_PRESETS,
} from "../lib/acl-policy";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}`);
    throw e;
  }
}

console.log("acl-policy matrix");

test("holder views coverage while Active", () => {
  assert.equal(canDecryptField("holder", PolicyLifecycle.Active, "coverage", "view"), true);
});

test("holder cannot view trigger while Active", () => {
  assert.equal(canDecryptField("holder", PolicyLifecycle.Active, "trigger", "view"), false);
});

test("holder views trigger and payout after oracle resolve", () => {
  assert.equal(canDecryptField("holder", PolicyLifecycle.OracleTriggered, "trigger", "view"), true);
  assert.equal(canDecryptField("holder", PolicyLifecycle.OracleTriggered, "payout", "view"), true);
});

test("holder uses tx path on payout for settlement prep", () => {
  assert.equal(canDecryptField("holder", PolicyLifecycle.OracleTriggered, "payout", "tx"), true);
});

test("oracle limited to trigger only after resolve", () => {
  assert.equal(canDecryptField("oracle", PolicyLifecycle.OracleTriggered, "trigger", "view"), true);
  assert.equal(canDecryptField("oracle", PolicyLifecycle.OracleTriggered, "payout", "view"), false);
  assert.equal(canDecryptField("oracle", PolicyLifecycle.OracleTriggered, "coverage", "view"), false);
});

test("privara router tx-only on payout", () => {
  assert.equal(canDecryptField("privaraRouter", PolicyLifecycle.OracleTriggered, "payout", "tx"), true);
  assert.equal(canDecryptField("privaraRouter", PolicyLifecycle.OracleTriggered, "payout", "view"), false);
  const explain = getAccessExplanation(
    "privaraRouter",
    PolicyLifecycle.OracleTriggered,
    "payout",
    "view"
  );
  assert.equal(explain.allowed, false);
});

test("arbitrator sees dispute handles during Disputed", () => {
  assert.equal(canDecryptField("arbitrator", PolicyLifecycle.Disputed, "trigger", "view"), true);
  assert.equal(canDecryptField("arbitrator", PolicyLifecycle.Disputed, "payout", "view"), true);
  assert.equal(canDecryptField("arbitrator", PolicyLifecycle.Disputed, "ratioValid", "view"), true);
  assert.equal(canDecryptField("arbitrator", PolicyLifecycle.Disputed, "proximity", "view"), true);
  assert.equal(canDecryptField("arbitrator", PolicyLifecycle.Disputed, "coverage", "view"), false);
});

test("reinsurer global exposure only", () => {
  const fields = allowedFieldsForRole("reinsurer", PolicyLifecycle.Active, "view");
  assert.deepEqual(fields, ["globalExposure"]);
});

test("auditor requires delegation flags", () => {
  assert.equal(canDecryptField("auditor", PolicyLifecycle.Active, "coverage", "view"), false);
  assert.equal(
    canDecryptField("auditor", PolicyLifecycle.Active, "coverage", "view", { coverage: true }),
    true
  );
});

test("grantViewerAccess flags map to encrypted fields", () => {
  const fields = grantedFieldsFromFlags({
    allowCoverage: true,
    allowPremium: false,
    allowThreshold: true,
    allowDeductible: false,
    allowRatioValid: true,
    allowTrigger: false,
    allowPayout: false,
    allowProximity: false,
  });
  assert.ok(fields.includes("coverage"));
  assert.ok(fields.includes("threshold"));
  assert.ok(fields.includes("floor"));
  assert.ok(fields.includes("ceiling"));
  assert.ok(fields.includes("ratioValid"));
  assert.equal(fields.includes("payout"), false);
});

test("delegation presets declare view path only", () => {
  for (const preset of Object.values(DELEGATION_PRESETS)) {
    assert.equal(preset.path, "view");
  }
});

test("view path allowed when base ACL is tx", () => {
  assert.equal(canDecryptField("privaraRouter", PolicyLifecycle.OracleTriggered, "payout", "view"), false);
  assert.equal(canDecryptField("holder", PolicyLifecycle.OracleTriggered, "payout", "view"), true);
});

console.log("\nAll acl-policy tests passed.");
