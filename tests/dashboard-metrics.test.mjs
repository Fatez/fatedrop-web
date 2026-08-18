import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const tempDirectory = await mkdtemp(path.join(tmpdir(), "fatedrop-dashboard-"));
process.env.FATEDROP_METRIC_STORE = "file";
process.env.FATEDROP_METRIC_FILE = path.join(tempDirectory, "dashboard.json");

const storage = await import("../lib/dashboard-storage.ts");

test("dashboard activity and network metrics are persisted idempotently", async () => {
  const now = Math.floor(Date.now() / 1000);
  try {
    const event = {
      id: "activity-1",
      userId: "user-1",
      sourceEventId: "cloud-event-1",
      type: "signal_seen",
      signalState: "manifested",
      title: "Tracked product",
      subtitle: "Evidence-backed confirmation",
      retailer: "Example Retailer",
      storeId: "store-1",
      amountPence: null,
      source: "cloud",
      occurredAt: now,
      recordedAt: now,
    };
    assert.equal(await storage.recordDashboardActivity(event), true);
    assert.equal(await storage.recordDashboardActivity({ ...event, id: "activity-2" }), false);
    assert.equal((await storage.listDashboardActivity("user-1")).length, 1);

    const snapshot = {
      id: "snapshot-1",
      sourceEventId: "network-1",
      source: "FateDrop Cloud test",
      measuredAt: now,
      recordedAt: now,
      metrics: { whisper: 1, manifested: 2, vanished: 3, echo: 4, changes24h: 10, productsTracked: 100, inStock: 50, catalogueRetailers: 4, healthyMonitors: 3 },
      recentSignals: [],
      upcomingEvents: [],
    };
    assert.equal(await storage.saveNetworkMetricSnapshot(snapshot), true);
    assert.equal(await storage.saveNetworkMetricSnapshot({ ...snapshot, id: "snapshot-2" }), false);
    assert.equal((await storage.getLatestNetworkMetricSnapshot()).metrics.manifested, 2);

    const audit = { eventId: "evt_stripe_1", eventType: "customer.subscription.updated", userId: "user-1", customerId: "cus_1", subscriptionId: "sub_1", stripeCreatedAt: now, processedAt: now };
    assert.equal(await storage.hasProcessedBillingEvent(audit.eventId), false);
    assert.equal(await storage.recordBillingAudit(audit), true);
    assert.equal(await storage.hasProcessedBillingEvent(audit.eventId), true);
    assert.equal(await storage.recordBillingAudit(audit), false);
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
});
