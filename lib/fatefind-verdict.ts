import { safeExternalHttpsUrl } from "./external-url";
import type { SignalTruePriceGroup, SignalTruePriceOffer } from "./signal-engine-client";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

export type SignalFateVerdictReference = {
  rrpGbp: number;
  directRrpGbp: number | null;
  unitRrpGbp: number | null;
  unitCount: number | null;
  unitKind: string | null;
  source: string;
  kind: string;
  observedAt: string | null;
  basis: string | null;
  scaledFromUnit: boolean;
};

export type SignalFateVerdictPosition = {
  groupId: string;
  canonicalProductId: string | null;
  configurationId: string | null;
  title: string;
  identityKey: string | null;
  valueFamilyKey: string | null;
  offerId: string;
  retailerId: string | null;
  retailerName: string | null;
  itemPrice: number | null;
  truePrice: number | null;
  checkoutCost: number | null;
  rrpGbp: number | null;
  rrpPercent: number | null;
  unitCount: number | null;
  unitKind: string | null;
  unitCost: number | null;
  deliveryKnown: boolean;
  provisional: boolean;
  reference: SignalFateVerdictReference | null;
  truePriceEvidence?: {
    itemPriceGbp: number | null;
    deliveryGbp: number | null;
    totalGbp: number | null;
    deliveryKnown: boolean;
    retailerName: string | null;
    observedAt: string | null;
    stockStatus: string | null;
  };
};

export type SignalFateVerdict = {
  winnerId: string | null;
  basis: string | null;
  gap?: number | null;
  reasonCode: string;
  reason: string;
  provisional?: boolean;
  ranking: SignalFateVerdictPosition[];
};

export type SignalFatePairVerdict = {
  left: SignalFateVerdictPosition | null;
  right: SignalFateVerdictPosition | null;
  winnerId: string | null;
  basis: string | null;
  gap: number | null;
  reasonCode: string;
  reason: string;
};

export type SignalFateVerdictResponse = {
  success: boolean;
  available?: boolean;
  mode: "verdict";
  tcgCode?: string;
  count: number;
  groups: SignalTruePriceGroup[];
  verdict: SignalFateVerdict;
  pairVerdict: SignalFatePairVerdict | null;
  source: "FATEDROP_CLOUD";
  rulesVersion: string;
  runtime?: {
    gitCommitSha: string | null;
    deploymentId?: string | null;
  };
  disclaimer?: string;
  notice?: string;
};

function signalEngineBaseUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

function safeOffer(offer: SignalTruePriceOffer): SignalTruePriceOffer | null {
  const productUrl = safeExternalHttpsUrl(offer.productUrl);
  return productUrl ? { ...offer, productUrl } : null;
}

function safeGroup(group: SignalTruePriceGroup): SignalTruePriceGroup | null {
  const offers = Array.isArray(group.offers)
    ? group.offers.flatMap((offer) => {
        const safe = safeOffer(offer);
        return safe ? [safe] : [];
      })
    : [];
  if (!offers.length) return null;
  return { ...group, offers, retailerCount: new Set(offers.map((offer) => offer.retailerId)).size };
}

export async function searchSignalFateVerdict(
  query: string,
  options: { tcgCode?: string; leftId?: string; rightId?: string; timeoutMs?: number } = {},
): Promise<SignalFateVerdictResponse | null> {
  const clean = query.trim();
  if (clean.length < 2) return null;

  const body: Record<string, string> = { mode: "verdict", query: clean, tcgCode: options.tcgCode || "pokemon" };
  if (options.leftId?.trim()) body.leftId = options.leftId.trim();
  if (options.rightId?.trim()) body.rightId = options.rightId.trim();

  try {
    const response = await fetch(new URL("/api/fatefind/matches", `${signalEngineBaseUrl()}/`), {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(Math.max(250, options.timeoutMs ?? 8_000)),
    });
    if (!response.ok) return null;
    const result = await response.json() as SignalFateVerdictResponse;
    if (!result?.success || result.mode !== "verdict" || result.source !== "FATEDROP_CLOUD" || !result.verdict) return null;

    const groups = (Array.isArray(result.groups) ? result.groups : []).flatMap((group) => {
      const safe = safeGroup(group);
      return safe ? [safe] : [];
    });
    const safeGroupIds = new Set(groups.map((group) => group.id));
    const ranking = (Array.isArray(result.verdict.ranking) ? result.verdict.ranking : [])
      .filter((position) => safeGroupIds.has(position.groupId));
    const winnerId = result.verdict.winnerId && safeGroupIds.has(result.verdict.winnerId)
      ? result.verdict.winnerId
      : null;

    return {
      ...result,
      groups,
      count: groups.length,
      verdict: { ...result.verdict, winnerId, ranking },
    };
  } catch {
    return null;
  }
}
