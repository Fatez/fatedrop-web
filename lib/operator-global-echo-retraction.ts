import { fateDropPostgres } from "@/lib/postgres";
import { getCloudGlobalEchoRetractions, type GlobalEchoRetractionStatus } from "@/lib/operator-global-echo-retraction-cloud";

export const RETRACTED_ECHO_MESSAGE = "This Echo was retracted by FateDrop.";

export function isManualGlobalEchoAlert(alert: { signalKind?: string | null; operatorIntelligence?: { sourceType?: string | null; availabilityScope?: string | null } | null }) {
  return alert.signalKind === "operator_readiness"
    && alert.operatorIntelligence?.sourceType === "operator_manual"
    && alert.operatorIntelligence?.availabilityScope === "online_retailer_readiness";
}

export function toRetractedEchoTombstone<T extends Record<string, any>>(alert: T, retraction: GlobalEchoRetractionStatus): T {
  return {
    ...alert,
    status: "retracted",
    retraction,
    interruptEligible: false,
    deliveryPolicy: "history_only",
    title: "Echo retracted",
    message: RETRACTED_ECHO_MESSAGE,
    productUrl: "",
    product: { ...(alert.product || {}), title: "Echo retracted", url: "", stockStatus: null },
    preparedLinks: {
      primary: null,
      lowestKnown: null,
      officialReference: null,
      alternatives: [],
      compareQuery: "",
      fateFindQuery: "",
    },
    notification: {
      ...(alert.notification || {}),
      title: "FateDrop · Echo retracted",
      body: RETRACTED_ECHO_MESSAGE,
      data: {
        ...((alert.notification || {}).data || {}),
        productUrl: "",
        lowestKnownUrl: null,
        compareQuery: "",
        retracted: true,
      },
    },
  };
}

export async function projectGlobalEchoRetractions<T extends Record<string, any>>(alerts: T[], { requestedId = null }: { requestedId?: string | null } = {}) {
  const manual = alerts.filter(isManualGlobalEchoAlert);
  if (!manual.length) return alerts;
  const retractions = await getCloudGlobalEchoRetractions(manual.map((alert) => String(alert.id)));
  return alerts.flatMap((alert) => {
    const retraction = retractions.get(String(alert.id));
    if (!retraction) return [alert];
    if (requestedId && requestedId === String(alert.id)) return [toRetractedEchoTombstone(alert, retraction)];
    return [];
  });
}

export async function cancelPendingGlobalEchoPushes(eventId: string, reason: string) {
  const cleanEventId = eventId.trim();
  if (!cleanEventId) return { cancelled: 0 };
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const detail = `Manual Global Echo retracted before delivery: ${reason.trim().slice(0, 300)}`;
  const rows = await sql`
    UPDATE fatedrop_notification_outbox
    SET state='cancelled',last_error=${detail},next_attempt_at=${now},updated_at=${now}
    WHERE event_id=${cleanEventId}
      AND channel='push'
      AND event_type='operator_readiness_echo'
      AND state IN ('pending','failed','sending')
    RETURNING id`;
  return { cancelled: rows.length };
}

export async function markClaimedGlobalEchoCancelled(outboxIds: string[], detail = "Manual Global Echo was retracted before Expo delivery.") {
  const ids = [...new Set(outboxIds.map((value) => value.trim()).filter(Boolean))];
  if (!ids.length) return { cancelled: 0 };
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const rows = await sql`
    UPDATE fatedrop_notification_outbox
    SET state='cancelled',last_error=${detail},next_attempt_at=${now},updated_at=${now}
    WHERE id = ANY(${ids}::text[])
      AND channel='push'
      AND state='sending'
    RETURNING id`;
  return { cancelled: rows.length };
}

export async function markClaimedGlobalEchoHeld(outboxIds: string[], detail = "Global Echo retraction status could not be verified before Expo delivery.") {
  const ids = [...new Set(outboxIds.map((value) => value.trim()).filter(Boolean))];
  if (!ids.length) return { held: 0 };
  const sql = await fateDropPostgres();
  const now = Math.floor(Date.now() / 1000);
  const rows = await sql`
    UPDATE fatedrop_notification_outbox
    SET state='failed',attempts=GREATEST(attempts-1,0),last_error=${detail},next_attempt_at=${now + 30},updated_at=${now}
    WHERE id = ANY(${ids}::text[])
      AND channel='push'
      AND state='sending'
    RETURNING id`;
  return { held: rows.length };
}
