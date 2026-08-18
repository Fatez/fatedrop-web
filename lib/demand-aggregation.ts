import type { FateMatch } from "@/lib/fate-match";

export type DemandAggregate = {
  productIdentityId: string;
  demandCount: number;
  onlineDemandCount: number;
  localDemandCount: number;
  maxTruePriceBands: { underRrp: number; upToFivePercent: number; upToTenPercent: number; aboveTenPercent: number; unknown: number };
  radiusBandsKm: { local10: number; local25: number; local50: number; local100Plus: number };
};

export function aggregateAnonymousDemand(matches: FateMatch[]): DemandAggregate[] {
  const grouped = new Map<string, DemandAggregate>();
  for (const match of matches) {
    if (!match.enabled || !match.productIdentityId) continue;
    const aggregate = grouped.get(match.productIdentityId) ?? {
      productIdentityId: match.productIdentityId,
      demandCount: 0,
      onlineDemandCount: 0,
      localDemandCount: 0,
      maxTruePriceBands: { underRrp: 0, upToFivePercent: 0, upToTenPercent: 0, aboveTenPercent: 0, unknown: 0 },
      radiusBandsKm: { local10: 0, local25: 0, local50: 0, local100Plus: 0 },
    };
    aggregate.demandCount += 1;
    if (match.scope === "online" || match.scope === "either") aggregate.onlineDemandCount += 1;
    if (match.scope === "local" || match.scope === "either") aggregate.localDemandCount += 1;
    if (match.maxPercentAboveRrp === null) aggregate.maxTruePriceBands.unknown += 1;
    else if (match.maxPercentAboveRrp <= 0) aggregate.maxTruePriceBands.underRrp += 1;
    else if (match.maxPercentAboveRrp <= 5) aggregate.maxTruePriceBands.upToFivePercent += 1;
    else if (match.maxPercentAboveRrp <= 10) aggregate.maxTruePriceBands.upToTenPercent += 1;
    else aggregate.maxTruePriceBands.aboveTenPercent += 1;

    const radius = match.radiusKm;
    if (radius !== null && (match.scope === "local" || match.scope === "either")) {
      if (radius <= 10) aggregate.radiusBandsKm.local10 += 1;
      else if (radius <= 25) aggregate.radiusBandsKm.local25 += 1;
      else if (radius <= 50) aggregate.radiusBandsKm.local50 += 1;
      else aggregate.radiusBandsKm.local100Plus += 1;
    }
    grouped.set(match.productIdentityId, aggregate);
  }
  return [...grouped.values()].sort((a, b) => b.demandCount - a.demandCount);
}

export function retailerDemandOverlap(demand: DemandAggregate[], stockedProductIdentityIds: Iterable<string>) {
  const stocked = new Set(stockedProductIdentityIds);
  return demand.filter((item) => stocked.has(item.productIdentityId));
}
