import { createHash } from "node:crypto";
import { aggregateAnonymousDemand } from "@/lib/demand-aggregation";
import type { FateMatch } from "@/lib/fate-match";
import { fateDropPostgres } from "@/lib/postgres";

function idFor(productIdentityId: string, measuredAt: number) {
  return `demand_${createHash("sha256").update(`${productIdentityId}:${measuredAt}`).digest("hex").slice(0,24)}`;
}

export async function persistAnonymousDemandSnapshot(matches: FateMatch[], measuredAt = Math.floor(Date.now() / 1000)) {
  const sql = await fateDropPostgres();
  const aggregates = aggregateAnonymousDemand(matches);
  for (const item of aggregates) {
    await sql`INSERT INTO fatedrop_demand_snapshots (id,product_identity_id,demand_count,online_demand_count,local_demand_count,price_tolerance_json,radius_bands_json,trend_direction,measured_at)
      VALUES (${idFor(item.productIdentityId, measuredAt)},${item.productIdentityId},${item.demandCount},${item.onlineDemandCount},${item.localDemandCount},${JSON.stringify(item.maxTruePriceBands)}::jsonb,${JSON.stringify(item.radiusBandsKm)}::jsonb,NULL,${measuredAt})
      ON CONFLICT (id) DO NOTHING`;
  }
  return aggregates;
}
