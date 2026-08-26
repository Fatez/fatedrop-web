import assert from "node:assert/strict";
import test from "node:test";

test("production mobile signal health gateway serves canonical lifecycle data", async () => {
  const response = await fetch("https://fatedrop.co.uk/api/mobile/signal-health?days=7", {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);

  assert.equal(response.status, 200, `production signal health returned HTTP ${response.status}`);
  assert.equal(body?.available, true, "production signal health is not available");
  assert.ok(body?.lifecycle && typeof body.lifecycle === "object", "production lifecycle payload is missing");
  for (const state of ["whisper", "echo", "manifested", "vanished"]) {
    assert.ok(body.lifecycle[state] && Number.isFinite(Number(body.lifecycle[state].total)), `missing ${state} lifecycle total`);
  }
});
