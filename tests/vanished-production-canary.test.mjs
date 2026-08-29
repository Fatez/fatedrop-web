import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const canary = fs.readFileSync(path.join(root, "lib/push-canary.ts"), "utf8");
const route = fs.readFileSync(path.join(root, "app/api/dashboard/push-canary/route.ts"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/five-push-production-canary.yml"), "utf8");
const manualWorkflow = fs.readFileSync(path.join(root, ".github/workflows/manual-push-production-canary.yml"), "utf8");

test("production canary covers all four lifecycle pushes plus Local Radar", () => {
  for (const kind of ["whisper", "echo", "manifested", "vanished", "local-radar"]) {
    assert.ok(canary.includes(`kind: \"${kind}\"`), `missing ${kind} canary`);
  }
  for (const stage of ["WHISPER", "ECHO", "MANIFESTED", "VANISHED"]) {
    assert.ok(canary.includes(`stage: \"${stage}\"`), `missing ${stage} stage`);
  }
  assert.ok(canary.includes('route: "alerts"'));
  assert.ok(canary.includes('route: "local-radar"'));
  assert.ok(canary.includes("fatedrop_notification_outbox"));
  assert.ok(canary.includes("fatedrop_notification_delivery_attempts"));
  assert.ok(canary.includes("dispatchCanonicalPushAlerts"));
  assert.equal(canary.includes("exp.host"), false, "canary must reuse canonical Expo transport");
});

test("production canary uses approved beta entitlement and fails closed on ambiguity/preferences", () => {
  assert.ok(canary.includes("fatedrop_beta_access"));
  assert.ok(canary.includes("ba.status='approved'"));
  assert.ok(canary.includes("betaPremiumEnabled"));
  assert.ok(canary.includes("eligibleUsers.size !== 1"));
  assert.ok(canary.includes("ambiguous_eligible_push_users"));
  for (const preference of ["push_enabled", "whisper_enabled", "echo_enabled", "manifested_enabled", "vanished_enabled"]) {
    assert.ok(canary.includes(preference), `missing preference gate ${preference}`);
  }
});

test("canary endpoint stays server-authenticated and deploy canary still verifies all five", () => {
  assert.ok(route.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(route.includes("timingSafeEqual"));
  assert.ok(route.includes("runProductionPushCanarySuite"));
  assert.ok(workflow.includes('workflows: ["Deploy FateDrop Web Production"]'));
  assert.ok(workflow.includes("[five-push-canary]"));
  assert.ok(workflow.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(workflow.includes("/api/dashboard/push-canary"));
  assert.ok(workflow.includes("outcomes.length !== 5"));
  assert.ok(workflow.includes("providerMessageId"));
});

test("manual push QA can request exactly one allowed canary without changing canonical stock truth", () => {
  assert.ok(canary.includes("runProductionPushCanarySuite(selectedKind?: CanaryKind)"));
  assert.ok(canary.includes("selectedKind ? allSpecs.filter"));
  assert.ok(canary.includes("selectedKind: selectedKind ?? null"));
  assert.ok(canary.includes("test: true"));
  assert.ok(canary.includes("canary: true"));
  assert.ok(canary.includes("No physical stock claim occurred"));
  assert.ok(route.includes("isPushCanaryKind"));
  assert.ok(route.includes('searchParams.get("kind")'));
  assert.ok(route.includes("FATEDROP_PUSH_TEST_SECRET"));
});

test("manual production trigger is owner-gated, exact-kind limited and uses an isolated test secret", () => {
  assert.ok(manualWorkflow.includes("issues:"));
  assert.ok(manualWorkflow.includes("github.actor == 'Fatez'"));
  assert.ok(manualWorkflow.includes("[FATEDROP PUSH TEST]"));
  for (const kind of ["local-radar", "whisper", "echo", "manifested", "vanished"]) {
    assert.ok(manualWorkflow.includes(kind), `manual workflow missing ${kind}`);
  }
  assert.ok(manualWorkflow.includes("FATEDROP_PUSH_TEST_SECRET"));
  assert.equal(manualWorkflow.includes("wrangler secret put FATEDROP_PUSH_CRON_SECRET"), false, "manual QA must not rotate the production cron secret");
  assert.ok(manualWorkflow.includes("outcomes.length !== 1"));
  assert.ok(manualWorkflow.includes("providerMessageId"));
  assert.ok(manualWorkflow.includes("/api/dashboard/push-canary?kind=$CANARY_KIND"));
});
