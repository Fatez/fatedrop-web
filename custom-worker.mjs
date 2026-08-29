import handler from "./.open-next/worker.js";

const PUSH_DISPATCH_URL = "https://fatedrop.co.uk/api/dashboard/push-dispatch";
const LOCAL_RADAR_CANARY_URL = "https://fatedrop.co.uk/api/dashboard/local-radar-push-canary";

async function invokeProtectedPost(url, secret, env, ctx, label) {
  const request = new Request(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
    },
  });

  const response = await handler.fetch(request, env, ctx);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${label} failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`);
  }
  return response;
}

export default {
  fetch: handler.fetch,

  async scheduled(_controller, env, ctx) {
    const secret = String(env?.FATEDROP_PUSH_CRON_SECRET || "").trim();
    if (!secret) throw new Error("FATEDROP_PUSH_CRON_SECRET is required for scheduled push dispatch");

    await invokeProtectedPost(PUSH_DISPATCH_URL, secret, env, ctx, "Scheduled push dispatch");

    const localRadarCanaryKey = String(env?.FATEDROP_LOCAL_RADAR_CANARY_KEY || "").trim();
    if (localRadarCanaryKey) {
      await invokeProtectedPost(LOCAL_RADAR_CANARY_URL, secret, env, ctx, "Local Radar production canary");
    }
  },
};
