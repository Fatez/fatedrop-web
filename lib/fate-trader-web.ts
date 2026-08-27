export type FateTraderSeries = {
  id: string;
  tcgCode: string;
  name: string;
  verificationStatus: string;
};

export type FateTraderSet = {
  id: string;
  tcgCode: string;
  seriesId: string;
  seriesName: string | null;
  name: string;
  printedTotal: number | null;
  total: number | null;
  releasedAt: number | null;
  verificationStatus: string;
};

export type FateTraderCard = {
  id: string;
  fateCardId: string;
  tcgCode: string;
  seriesId: string;
  seriesName: string | null;
  setId: string;
  setName: string | null;
  printingId: string;
  name: string | null;
  collectorNumber: string;
  rarity: string | null;
  supertype: string | null;
  variantCode: string;
  languageCode: string;
  verificationStatus: string;
  verifiedAt: number | null;
};

export type FateTraderEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
    details?: Record<string, unknown>;
  };
  meta?: { requestId?: string | null; apiVersion?: string };
};

const safeSingle = /^[A-Za-z0-9_.:-]+$/;

export function fateTraderCloudPath(parts: string[]) {
  if (!Array.isArray(parts) || parts.length === 0 || parts.some((part) => !safeSingle.test(part))) return null;
  const joined = parts.join("/");

  if (/^cards(?:\/[A-Za-z0-9_.:-]+)?$/.test(joined)) return `/v1/${joined}`;
  if (joined === "card-series") return "/v1/card-series";
  if (/^card-sets(?:\/[A-Za-z0-9_.:-]+\/cards)?$/.test(joined)) return `/v1/${joined}`;
  if (/^collection(?:\/items(?:\/[A-Za-z0-9_.:-]+(?:\/media)?)?)?$/.test(joined)) return `/v1/${joined}`;
  if (/^wants(?:\/[A-Za-z0-9_.:-]+)?$/.test(joined)) return `/v1/${joined}`;
  if (joined === "finder") return "/v1/trader/finder";
  if (/^binder(?:\/items(?:\/[A-Za-z0-9_.:-]+)?)?$/.test(joined)) return `/v1/trader/${joined}`;
  if (/^structured-wants(?:\/[A-Za-z0-9_.:-]+)?$/.test(joined)) {
    return `/v1/trader/wants${joined === "structured-wants" ? "" : `/${joined.slice("structured-wants/".length)}`}`;
  }
  return null;
}

export function fateTraderCardLabel(card: FateTraderCard) {
  const name = card.name || "Unknown card";
  const number = card.collectorNumber ? ` #${card.collectorNumber}` : "";
  const variant = card.variantCode && card.variantCode !== "standard"
    ? ` · ${card.variantCode.replaceAll("-", " ")}`
    : "";
  return `${name}${number}${variant}`;
}
