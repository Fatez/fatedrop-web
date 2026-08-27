import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const palette = fs.readFileSync(path.join(process.cwd(), "app/signal-stage-colours.css"), "utf8");
const layout = fs.readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
const beam = fs.readFileSync(path.join(process.cwd(), "components/signal-beam.tsx"), "utf8");

test("Echo is owned by the warm Fenn signal palette across dashboard and ledger surfaces", () => {
  assert.match(layout, /signal-stage-colours\.css/);
  assert.match(palette, /--fd-echo: #d2a16b/);
  assert.match(palette, /fd-ledger-stages \.echo span/);
  assert.match(palette, /fd-stage-trend\.echo/);
  assert.match(palette, /fd-ledger-row\.echo \.fd-ledger-state i/);
  assert.match(palette, /fd-signal-thumb\.echo/);
  assert.match(palette, /fd-mini-thumb\.echo/);
  assert.match(palette, /fd-lifecycle-card\.echo/);
  assert.match(palette, /fd-signal-row aside b\.echo/);
});

test("Echo signal beam uses warm sand and amber rather than hue-shifted cyan", () => {
  assert.match(beam, /state-echo.*rgba\(210,161,107/);
  assert.match(beam, /fdCardPingEcho/);
  assert.doesNotMatch(beam, /state-echo\{filter:hue-rotate/);
});
