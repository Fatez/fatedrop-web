import { safeExternalHttpsUrl } from "./external-url";
import { compareCompatGroups, rankCompatGroups } from "./fate-verdict-compat";
import { searchSignalTruePrice, type SignalTruePriceGroup } from "./signal-engine-client";

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

function safeGroups(groups: SignalTruePriceGroup[]) {
  return groups.flatMap((group) => {
    const offers = group.offers.flatMap((offer) => {
      const productUrl = safeExternalHttpsUrl(offer.productUrl);
      return productUrl ? [{ ...offer, productUrl }] : [];
    });
    return offers.length ? [{ ...group, offers, retailerCount: offers.length }] : [];
  });
}

export async function requestFateVerdict(query: string, options: { leftId?: string; rightId?: string; timeoutMs?: number } = {}) {
  const clean = query.trim();
  if (clean.length < 2) return null;

  // Preferred path: the canonical Railway engine owns both grouping and the
  // Fate Verdict. Keep this first so the compatibility bridge disappears from
  // the request path automatically once the live runtime is on the new contract.
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
    if (response.ok) {
      const result = await response.json() as FateVerdictResponse;
      if (result.mode === "verdict" && result.source === "FATEDROP_CLOUD") {
        const groups = safeGroups(result.groups);
        return { ...result, groups, count: groups.length };
      }
    }
  } catch {
    // Fall through to the server-side compatibility bridge below.
  }

  // Deployment-compatibility path. Data still comes from the live FateDrop
  // Cloud True Price feed. The locked Fate Verdict v2 rules execute here on
  // the FateDrop server, never on the phone/browser, so App and Web receive
  // the same canonical answer while Railway catches up.
  const live = await searchSignalTruePrice(clean);
  if (!live) return null;
  const groups = safeGroups(live.groups);
  const verdict = rankCompatGroups(groups);
  let pairVerdict: FatePairVerdict | null = null;
  if (options.leftId && options.rightId) {
    const left = groups.find((group) => group.id === options.leftId);
    const right = groups.find((group) => group.id === options.rightId);
    if (left && right) pairVerdict = compareCompatGroups(left, right);
  }

  return {
    success: true,
    mode: "verdict" as const,
    count: groups.length,
    groups,
    verdict,
    pairVerdict,
    source: "FATEDROP_CLOUD" as const,
    rulesVersion: "fate-verdict-v2",
    disclaimer: live.disclaimer,
    notice: "FateDrop Cloud compatibility gateway is serving the canonical Fate Verdict while the Railway verdict contract rolls out.",
  } satisfies FateVerdictResponse;
}
