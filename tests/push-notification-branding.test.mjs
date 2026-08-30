import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const brandingSource = fs.readFileSync(new URL("../lib/push-notification-branding.ts", import.meta.url), "utf8");
const canonicalPush = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

test("canonical alert stages map to locked FateDrop companions and Android drawables", () => {
  const expectedMappings = [
    ["WHISPER", "oru", "fatedrop_oru"],
    ["ECHO", "fenn", "fatedrop_fenn"],
    ["MANIFESTED", "koru", "fatedrop_koru"],
    ["VANISHED", "nyxen", "fatedrop_nyxen"],
  ];

  for (const [stage, companion, icon] of expectedMappings) {
    assert.match(
      brandingSource,
      new RegExp(`${stage}: \\{ companion: "${companion}", androidIcon: "${icon}" \\}`),
      `${stage} must keep its locked companion/icon mapping`,
    );
  }
});

test("Local Radar remains visually separate from signal lifecycle companions", () => {
  assert.match(brandingSource, /route === "local-radar" \|\| route === "local-radar-stock"/);
  assert.match(brandingSource, /return \{ companion: "radar", androidIcon: "fatedrop_radar" \}/);
});

test("stage-specific Android icons are rollout-gated and off by default", () => {
  assert.match(brandingSource, /FATEDROP_ANDROID_STAGE_NOTIFICATION_ICONS === "true"/);
  assert.match(brandingSource, /if \(!enabled\) return null/);
  assert.match(brandingSource, /trim\(\)\.toLowerCase\(\) === "android" \? branding\.androidIcon : null/);
});

test("push dispatcher selects icons only after endpoint platform is known", () => {
  assert.match(canonicalPush, /pe\.platform/);
  assert.match(canonicalPush, /pushPlatform: recipient\.platform/);
  assert.match(canonicalPush, /expoAndroidIcon\(data\.pushPlatform, branding\)/);
  assert.match(canonicalPush, /\.\.\.\(icon \? \{ icon \} : \{\}\)/);
  assert.match(canonicalPush, /notificationCompanion: branding\.companion/);
  assert.match(canonicalPush, /\["expoPushToken", "endpointId", "pushPlatform"\]/);
});
