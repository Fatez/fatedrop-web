import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { expoAndroidIcon, pushNotificationBranding } from "../lib/push-notification-branding.ts";

const canonicalPush = fs.readFileSync(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");

test("canonical alert stages map to locked FateDrop companions and Android drawables", () => {
  const expected = {
    WHISPER: ["oru", "fatedrop_oru"],
    ECHO: ["fenn", "fatedrop_fenn"],
    MANIFESTED: ["koru", "fatedrop_koru"],
    VANISHED: ["nyxen", "fatedrop_nyxen"],
  };

  for (const [stage, [companion, icon]] of Object.entries(expected)) {
    const branding = pushNotificationBranding({ stage, route: "alerts" });
    assert.equal(branding.companion, companion);
    assert.equal(branding.androidIcon, icon);
    assert.equal(expoAndroidIcon("android", branding), icon);
    assert.equal(expoAndroidIcon("ios", branding), null);
  }
});

test("Local Radar remains visually separate from signal lifecycle companions", () => {
  for (const stage of ["WHISPER", "ECHO"]) {
    const branding = pushNotificationBranding({ stage, route: "local-radar" });
    assert.deepEqual(branding, { companion: "radar", androidIcon: "fatedrop_radar" });
  }
});

test("push dispatcher selects icons only after endpoint platform is known", () => {
  assert.match(canonicalPush, /pe\.platform/);
  assert.match(canonicalPush, /pushPlatform: recipient\.platform/);
  assert.match(canonicalPush, /expoAndroidIcon\(data\.pushPlatform, branding\)/);
  assert.match(canonicalPush, /\.\.\.\(icon \? \{ icon \} : \{\}\)/);
  assert.match(canonicalPush, /notificationCompanion: branding\.companion/);
  assert.match(canonicalPush, /\["expoPushToken", "endpointId", "pushPlatform"\]/);
});
