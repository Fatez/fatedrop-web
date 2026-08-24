import { safeExternalHttpsUrl } from "./external-url";
import type { SignalTruePriceGroup } from "./signal-engine-client";

const DEFAULT_SIGNAL_ENGINE_URL = "https://fatedrop-cloud-production.up.railway.app";

export type FateVerdictPosition = {
  groupId: string;
  title: string;
  offerId: string;
  retailerId?: string;
  retailerName?: string;
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
};

export type FatePairVerdict = {
  left: FateVerdictPosition | null;
  right: FateVerdictPosition | null;
  winnerId: string | null;
  basis: "rrp_percent" | "unit_true_price" | null;
  gap: number | null;
  reason: string;
};

export type FateRankVerdict = {
  winnerId: string | null;
  basis: "rrp_percent" | "unit_true_price" | null;
  reason: string;
  provisional: boolean;
  ranking: FateVerdictPosition[];
};

export type FateVerdictResponse = {
  success: boolean;
  mode: "verdict";
  count: number;
  groups: SignalTruePriceGroup[];
  verdict: FateRankVerdict;
  pairVerdict: FatePairVerdict | null;
  source: "FATEDROP_CLOUD";
  rulesVersion: string;
  disclaimer: string;
  notice?: string;
};

function signalEngineBaseUrl() {
  return (process.env.FATEDROP_SIGNAL_ENGINE_URL || DEFAULT_SIGNAL_ENGINE_URL).replace(/\/+$/, "");
}

export async function requestFateVerdict(query: string, options: { leftId?: string; rightId?: string; timeoutMs?: number } = {}) {
  const clean = query.trim();
  if (clean.length < 2) return null;
  try {
    const response = await fetch(`${signalEngineBaseUrl()}/api/fatefind/matches`, {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "verdict",
        query: clean,
        ...(options.leftId && options.rightId ? { leftId: options.leftId, rightId: options.rightId } : {}),
      }),
      signal: AbortSignal.timeout(Math.max(250, options.timeoutMs ?? 8_000)),
    });
    if (!response.ok) return null;
    const result = await response.json() as FateVerdictResponse;
    if (result.mode !== "verdict" || result.source !== "FATEDROP_CLOUD") return null;
    const groups = result.groups.flatMap((group) => {
      const offers = group.offers.flatMap((offer) => {
        const productUrl = safeExternalHttpsUrl(offer.productUrl);
        return productUrl ? [{ ...offer, productUrl }] : [];
      });
      return offers.length ? [{ ...group, offers, retailerCount: offers.length }] : [];
    });
    return { ...result, groups, count: groups.length };
  } catch {
    return null;
  }
}
