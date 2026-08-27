import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const palette = fs.readFileSync(path.join(process.cwd(), "app/signal-stage-colours.css"), "utf8");
const layout = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");

test("Web lifecycle colours match the companion-owned App palette", () => {
  assert.match(layout, /signal-stage-colours\.css/);
  assert.match(palette, /--fd-whisper: #D2B66F/);
  assert.match(palette, /--fd-echo: #D9CDBB/);
  assert.match(palette, /--fd-manifested: #7C6EFF/);
  assert.match(palette, /--fd-vanished: #EF4D5A/);
});

test("all four lifecycle states apply across dashboard, alert ledger and signal-beam surfaces", () => {
  for (const state of ["whisper", "echo", "manifested", "vanished"]) {
    assert.match(palette, new RegExp(`fd-signal-thumb\\.${state}`));
    assert.match(palette, new RegExp(`fd-mini-thumb\\.${state}`));
    assert.match(palette, new RegExp(`fd-lifecycle-card\\.${state}`));
    assert.match(palette, new RegExp(`fd-ledger-row\\.${state}`));
    assert.match(palette, new RegExp(`fd-signal-row aside b\\.${state}`));
    assert.match(palette, new RegExp(`fd-signal-beam\\.state-${state}`));
  }
});
