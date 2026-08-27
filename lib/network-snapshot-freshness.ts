import { getLatestNetworkMetricSnapshot, type NetworkMetricSnapshot } from "./dashboard-storage";

export const NETWORK_SNAPSHOT_FRESH_SECONDS = 15 * 60;

export async function getLatestFreshNetworkMetricSnapshot(
  staleAfterSeconds = NETWORK_SNAPSHOT_FRESH_SECONDS,
): Promise<NetworkMetricSnapshot | null> {
  const snapshot = await getLatestNetworkMetricSnapshot().catch(() => null);
  if (!snapshot) return null;

  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = Math.max(0, now - snapshot.measuredAt);
  return ageSeconds <= Math.max(60, staleAfterSeconds) ? snapshot : null;
}
