import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const canary = fs.readFileSync(path.join(root, "lib/push-canary.ts"), "utf8");
const route = fs.readFileSync(path.join(root, "app/api/dashboard/push-canary/route.ts"), "utf8");
const workflow = fs.readFileSync(path.join(root, ".github/workflows/five-push-production-canary.yml"), "utf8");

test("production canary covers all four lifecycle pushes plus Local Radar", () => {
  for (const kind of ["whisper", "echo", "manifested", "vanished", "local-radar"]) {
    assert.ok(canary.includes(`kind: \"${kind}\"`), `missing ${kind} canary`);
  }
  for (const stage of ["WHISPER", "ECHO", "MANIFESTED", "VANISHED"]) {
    assert.ok(canary.includes(`stage: \"${stage}\"`), `missing ${stage} stage`);
  }
  assert.ok(canary.includes('route: "alerts"'));
  assert.ok(canary.includes('route: "local-radar-stock"'));
  assert.ok(canary.includes("fatedrop_notification_outbox"));
  assert.ok(canary.includes("fatedrop_notification_delivery_attempts"));
  assert.ok(canary.includes("dispatchCanonicalPushAlerts"));
  assert.equal(canary.includes("exp.host"), false, "canary must reuse canonical Expo transport");
});

test("Local Radar canary is unmistakably test-only and never asserts branch stock truth", () => {
  assert.ok(canary.includes('title: "TEST ALERT · LOCAL RADAR · PHYSICAL STOCK"'));
  assert.ok(canary.includes("No real branch stock claim occurred."));
  assert.ok(canary.includes('presentation: "manual-physical-stock"'));
  assert.ok(canary.includes('provenance: "manual-operator-canary"'));
  assert.ok(canary.includes("test: true"));
  assert.ok(canary.includes("canary: true"));
  assert.equal(canary.includes("verifiedBranchStock"), false);
  assert.equal(canary.includes("stockState: \"confirmed\""), false);
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
  assert.match(canary, /kind === "local-radar"\) && !recipient\.manifested_enabled/);
});

test("canary endpoint can select exactly one named canary and rejects unknown names", () => {
  assert.ok(route.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(route.includes("timingSafeEqual"));
  assert.ok(route.includes("runProductionPushCanarySuite"));
  assert.ok(route.includes("runSingleProductionPushCanary"));
  assert.ok(route.includes("isPushCanaryKind"));
  assert.ok(route.includes("Invalid push canary kind."));
  assert.ok(canary.includes('const scope = kind ? "single" : "suite"'));
  assert.ok(canary.includes("const specs = kind ? allSpecs.filter"));
});

test("full-suite capability remains marker-gated after production deploy", () => {
  assert.ok(workflow.includes('workflows: ["Deploy FateDrop Web Production"]'));
  assert.ok(workflow.includes("[five-push-canary]"));
  assert.ok(workflow.includes("kind=suite"));
  assert.ok(workflow.includes("FATEDROP_PUSH_CRON_SECRET"));
  assert.ok(workflow.includes("/api/dashboard/push-canary"));
});

test("workflow_dispatch exposes single-canary choices and verifies provider acceptance", () => {
  assert.ok(workflow.includes("workflow_dispatch:"));
  for (const kind of ["local-radar", "whisper", "echo", "manifested", "vanished", "suite"]) {
    assert.ok(workflow.includes(`- ${kind}`), `missing workflow choice ${kind}`);
  }
  assert.ok(workflow.includes('--data "{\\\"kind\\\":\\\"$CANARY_KIND\\\"}"'));
  assert.ok(workflow.includes("result.outcomes.length !== expectedKinds.size"));
  assert.ok(workflow.includes("providerMessageId"));
});
