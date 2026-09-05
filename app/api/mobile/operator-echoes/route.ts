import { getSnapshotForRequest } from "@/lib/auth";
import { betaAccessDeniedResponse, betaAccessIsApproved } from "@/lib/beta-access";
import { listCanonicalAlerts } from "@/lib/canonical-alerts";
import { getOperatorCapabilities } from "@/lib/operator-capabilities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const snapshot = await getSnapshotForRequest(request, { allowPending: true });
  if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "private, no-store" } });
  if (!betaAccessIsApproved(snapshot.betaAccess)) return betaAccessDeniedResponse(snapshot.betaAccess);

  const capabilities = await getOperatorCapabilities(snapshot.account.id);
  if (!capabilities.canRetractGlobalEcho) {
    return Response.json({ error: "Operator Echo access is not authorised." }, { status: 403, headers: { "cache-control": "private, no-store" } });
  }

  try {
    const alerts = await listCanonicalAlerts({ state: "echo", limit: 100 });
    const echoes = alerts.flatMap((alert) => {
      const operatorIssue = alert.operatorIntelligence?.operatorIssue;
      if (alert.signalKind !== "operator_readiness"
        || alert.operatorIntelligence?.availabilityScope !== "online_retailer_readiness"
        || alert.operatorIntelligence?.availabilityVerified !== false
        || alert.operatorIntelligence?.sourceType !== "operator_manual"
        || !Number.isInteger(operatorIssue)
        || Number(operatorIssue) <= 0
        || alert.id !== `local-radar-operator:${operatorIssue}`) return [];
      return [{
        eventId: alert.id,
        operatorIssue: Number(operatorIssue),
        headline: alert.title,
        retailerName: alert.retailer,
        expectedLabel: alert.operatorIntelligence?.expectedLabel ?? null,
        sourceUrl: alert.productUrl || null,
        createdAt: alert.detectedAt,
      }];
    });
    return Response.json({ success: true, count: echoes.length, echoes }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Operator Echo history is temporarily unavailable." }, { status: 503, headers: { "cache-control": "private, no-store" } });
  }
}
