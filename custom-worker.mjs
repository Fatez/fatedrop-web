import handler from "./.open-next/worker.js";

const PUSH_DISPATCH_URL = "https://fatedrop.co.uk/api/dashboard/push-dispatch";

export default {
  fetch: handler.fetch,

  async scheduled(_controller, env, ctx) {
    const secret = String(env?.FATEDROP_METRICS_INGEST_SECRET || "").trim();
    if (!secret) throw new Error("FATEDROP_METRICS_INGEST_SECRET is required for scheduled push dispatch");

    const request = new Request(PUSH_DISPATCH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        Accept: "application/json",
      },
    });

    const response = await handler.fetch(request, env, ctx);
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Scheduled push dispatch failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`);
    }
  },
};
