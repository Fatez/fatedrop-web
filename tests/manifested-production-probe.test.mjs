import assert from "node:assert/strict";
import test from "node:test";

test("read-only production Manifested push diagnostic", async () => {
  const response = await fetch("https://fatedrop.co.uk/api/health/manifested-reminder", {
    headers: { accept: "application/json" },
  });

  assert.equal(response.status, 200, `production diagnostic returned HTTP ${response.status}`);
  const result = await response.json();
  assert.equal(result?.ok, true, "production diagnostic contract mismatch");

  console.log(`FATEDROP_MANIFESTED_PRODUCTION_DIAGNOSTIC ${JSON.stringify(result)}`);
});
