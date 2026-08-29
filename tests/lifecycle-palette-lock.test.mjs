import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const paletteSource = await readFile(new URL("../app/lifecycle-palette.css", import.meta.url), "utf8");
const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const alertsSource = await readFile(new URL("../app/dashboard/alerts/page.tsx", import.meta.url), "utf8");

test("locked FateDrop lifecycle companion palette keeps the approved exact hex values", () => {
  assert.match(paletteSource, /--fd-signal-whisper:\s*#D2B66F;/);
  assert.match(paletteSource, /--fd-signal-echo:\s*#D9CDBB;/);
  assert.match(paletteSource, /--fd-signal-manifested:\s*#7C6EFF;/);
  assert.match(paletteSource, /--fd-signal-vanished:\s*#EF4D5A;/);
});

test("dashboard lifecycle surfaces consume the canonical palette variables", () => {
  for (const stage of ["whisper", "echo", "manifested", "vanished"]) {
    assert.match(paletteSource, new RegExp(`\\.fd-lifecycle-card\\.${stage}\\s*\\{[^}]*var\\(--fd-signal-${stage}\\)`, "s"));
    assert.match(paletteSource, new RegExp(`\\.fd-ledger-stages \\.${stage} span\\s*\\{[^}]*var\\(--fd-signal-${stage}\\)`, "s"));
    assert.match(paletteSource, new RegExp(`\\.fd-stage-trend\\.${stage}\\s*\\{[^}]*var\\(--fd-signal-${stage}\\)`, "s"));
    assert.match(paletteSource, new RegExp(`\\.fd-ledger-row\\.${stage} \\.fd-ledger-state i\\s*\\{[^}]*var\\(--fd-signal-${stage}\\)`, "s"));
  }
  assert.match(layoutSource, /import "\.\/lifecycle-palette\.css";/);
});

test("companion ownership remains Oru Whisper, Fenn Echo, Koru Manifested and Nyxen Vanished", () => {
  assert.match(alertsSource, /state: "whisper", stage: "WHISPER", companion: "ORU"/);
  assert.match(alertsSource, /state: "echo", stage: "ECHO", companion: "FENN"/);
  assert.match(alertsSource, /state: "manifested", stage: "MANIFESTED", companion: "KORU"/);
  assert.match(alertsSource, /state: "vanished", stage: "VANISHED", companion: "NYXEN"/);
});
