import assert from "node:assert/strict";
import test from "node:test";

const { POST } = await import("../app/api/dashboard/local-radar-operator-alert/route.ts");

const secret = "test-operator-bridge-secret";

function request(payload) {
  return new Request("https://fatedrop.co.uk/api/dashboard/local-radar-operator-alert", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

function readiness(overrides = {}) {
  return {
    eventId: "local-radar-operator:901",
    tcgCode: "pokemon",
    testOnly: false,
    stage: "ECHO",
    route: "alerts",
    presentationType: "readiness_echo",
    availabilityScope: "online_retailer_readiness",
    availabilityVerified: false,
    title: "FateDrop · Echo · Be ready",
    body: "Pokémon Centre traffic movement · Traffic movement observed. This is readiness evidence, not confirmed stock.",
    retailerId: "pokemon-center-uk",
    retailerName: "Pokémon Center UK",
    productTitle: "Pokémon Centre traffic movement",
    expectedFrom: null,
    expectedTo: null,
    expectedLabel: "Traffic movement observed",
    sourceUrl: "https://www.pokemoncenter.com/en-gb",
    evidenceObservedAt: "2026-09-01T20:00:00.000Z",
    operatorIssue: 901,
    languageGroup: "unknown",
    setKey: null,
    ...overrides,
  };
}

test("online readiness Echo reaches the authenticated Web contract before dispatch gating", async () => {
  const previousSecret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  const previousDispatch = process.env.FATEDROP_PUSH_DISPATCH_ENABLED;
  process.env.FATEDROP_METRICS_INGEST_SECRET = secret;
  process.env.FATEDROP_PUSH_DISPATCH_ENABLED = "false";
  try {
    const response = await POST(request(readiness()));
    const payload = await response.json();
    assert.equal(response.status, 503);
    assert.equal(payload.error, "Push dispatch is not enabled.");
  } finally {
    if (previousSecret === undefined) delete process.env.FATEDROP_METRICS_INGEST_SECRET;
    else process.env.FATEDROP_METRICS_INGEST_SECRET = previousSecret;
    if (previousDispatch === undefined) delete process.env.FATEDROP_PUSH_DISPATCH_ENABLED;
    else process.env.FATEDROP_PUSH_DISPATCH_ENABLED = previousDispatch;
  }
});

test("physical Big Fate cannot enter the chain-wide Web interrupt route", async () => {
  const previousSecret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  process.env.FATEDROP_METRICS_INGEST_SECRET = secret;
  try {
    const response = await POST(request(readiness({
      route: "local-radar",
      presentationType: "big_fate_signal",
      availabilityScope: "physical_branch",
      branchCount: 20,
      title: "FateDrop · Big Fate Signal · Echo",
      body: "Expected branch allocation. Physical availability is not confirmed.",
    })));
    assert.equal(response.status, 400);
  } finally {
    if (previousSecret === undefined) delete process.env.FATEDROP_METRICS_INGEST_SECRET;
    else process.env.FATEDROP_METRICS_INGEST_SECRET = previousSecret;
  }
});

test("online readiness cannot claim confirmed availability or Manifested lifecycle", async () => {
  const previousSecret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  process.env.FATEDROP_METRICS_INGEST_SECRET = secret;
  try {
    assert.equal((await POST(request(readiness({ availabilityVerified: true })))).status, 400);
    assert.equal((await POST(request(readiness({ stage: "MANIFESTED" })))).status, 400);
  } finally {
    if (previousSecret === undefined) delete process.env.FATEDROP_METRICS_INGEST_SECRET;
    else process.env.FATEDROP_METRICS_INGEST_SECRET = previousSecret;
  }
});

test("online readiness cannot bypass an inactive TCG gate", async () => {
  const previousSecret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  process.env.FATEDROP_METRICS_INGEST_SECRET = secret;
  try {
    assert.equal((await POST(request(readiness({ tcgCode: "one-piece" })))).status, 400);
  } finally {
    if (previousSecret === undefined) delete process.env.FATEDROP_METRICS_INGEST_SECRET;
    else process.env.FATEDROP_METRICS_INGEST_SECRET = previousSecret;
  }
});
