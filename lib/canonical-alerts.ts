import { fateDropPostgres } from "@/lib/postgres";
import { classifyProductAlert, type ProductAlertClassification } from "@/lib/product-alert-intelligence";

export type FatePriceVerdict = "LOWEST_KNOWN" | "BETTER_OFFER_FOUND" | "NO_FAIR_COMPARISON";
export type CanonicalSignalStage = "WHISPER" | "ECHO" | "MANIFESTED" | "VANISHED" | "NETWORK";

export type CanonicalOfferLink = {
  offerId: string;
  retailerId: string;
  retailer: string;
  url: string;
  itemPricePence: number | null;
  deliveredPricePence: number | null;
  stockStatus: string | null;
};

export type CanonicalSignalThreadEntry = {
  id: string;
  state: string;
  fateStage: CanonicalSignalStage;
  retailer: string;
  occurredAt: string;
  reason: string;
  pricePence: number | null;
  stockStatus: string | null;
  previousStockStatus: string | null;
  url: string;
};

export type CanonicalPreparedLinks = {
  primary: CanonicalOfferLink & {
    intent: "inspect" | "buy";
    label: string;
  };
  lowestKnown: CanonicalOfferLink | null;
  officialReference: CanonicalOfferLink | null;
  alternatives: CanonicalOfferLink[];
  compareQuery: string;
  fateFindQuery: string;
};

export type CanonicalAlert = {
  id: string;
  type: string;
  fateStage: CanonicalSignalStage;
  productId: string;
  offerId: string;
  retailerId: string;
  title: string;
  message: string;
  retailer: string;
  detectedAt: string;
  observedDurationSeconds: number | null;
  productIntelligence: ProductAlertClassification;
  confirmed: boolean;
  confirmedRestock: boolean;
  productUrl: string;
  product: {
    title: string;
    productType: string | null;
    url: string;
    imageUrl: string | null;
    pricePence: number | null;
    rrpPence: number | null;
    deliveredPricePence: number | null;
  };
  priceIntelligence: {
    rrpPence: number | null;
    rrpDeltaPercent: number | null;
    comparisonBasis: "item" | "delivered";
    verdict: FatePriceVerdict;
    currentComparisonPence: number | null;
    lowestKnown: {
      offerId: string | null;
      retailerId: string | null;
      retailer: string | null;
      url: string | null;
      itemPricePence: number | null;
      deliveredPricePence: number | null;
      comparisonPricePence: number | null;
      stockStatus: string | null;
    } | null;
    savingsPence: number | null;
    savingsPercent: number | null;
  };
  signalThread: CanonicalSignalThreadEntry[];
  preparedLinks: CanonicalPreparedLinks;
  notification: {
    title: string;
    body: string;
    data: {
      route: "alerts";
      alertId: string;
      productUrl: string;
      stage: CanonicalSignalStage;
      verdict: FatePriceVerdict;
      lowestKnownUrl: string | null;
      compareQuery: string;
      productCategory: ProductAlertClassification["category"];
      observedDurationSeconds: number | null;
      linksPrepared: true;
    };
  };
  confidence: number;
};

type JsonThreadRow = {
  id?: unknown;
  state?: unknown;
  retailer?: unknown;
  detectedAt?: unknown;
  reason?: unknown;
  pricePence?: unknown;
  stockStatus?: unknown;
  previousStockStatus?: unknown;
  url?: unknown;
};

type JsonOfferRow = {
  offerId?: unknown;
  retailerId?: unknown;
  retailer?: unknown;
  url?: unknown;
  itemPricePence?: unknown;
  deliveredPricePence?: unknown;
  stockStatus?: unknown;
};

type SignalRow = {
  id: string;
  state: string;
  product_id: string;
  offer_id: string;
  retailer_id: string;
  retailer_name: string;
  title: string;
  product_type: string | null;
  url: string;
  image_url: string | null;
  price_pence: number | null;
  signal_rrp_pence: number | null;
  canonical_rrp_pence: number | null;
  delivered_price_pence: number | null;
  stock_status: string | null;
  confidence: number;
  detected_at: number;
  observed_duration_seconds: number | null;
  reason: string;
  lowest_offer_id: string | null;
  lowest_retailer_id: string | null;
  lowest_retailer_name: string | null;
  lowest_url: string | null;
  lowest_item_price_pence: number | null;
  lowest_delivered_price_pence: number | null;
  lowest_stock_status: string | null;
  official_offer_id: string | null;
  official_retailer_id: string | null;
  official_retailer_name: string | null;
  official_url: string | null;
  official_item_price_pence: number | null;
  official_delivered_price_pence: number | null;
  official_stock_status: string | null;
  history_json: unknown;
  alternatives_json: unknown;
};

export function publicStage(state: string): CanonicalSignalStage {
  if (state === "whisper") return "WHISPER";
  if (state === "echo") return "ECHO";
  if (state === "manifested") return "MANIFESTED";
  if (state === "vanished") return "VANISHED";
  return "NETWORK";
}

function percentage(value: number | null, reference: number | null) {
  if (value == null || reference == null || reference <= 0) return null;
  return ((value - reference) / reference) * 100;
}

function roundOne(value: number | null) {
  return value == null || !Number.isFinite(value) ? null : Math.round(value * 10) / 10;
}

function pounds(pence: number | null) {
  return pence == null ? null : `£${(pence / 100).toFixed(2)}`;
}

function observedDuration(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const whole = Math.floor(seconds);
  if (whole < 60) return `${whole}s`;
  const minutes = Math.floor(whole / 60);
  const remainderSeconds = whole % 60;
  if (minutes < 60) return remainderSeconds ? `${minutes}m ${remainderSeconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;
  if (hours < 24) return remainderMinutes ? `${hours}h ${remainderMinutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainderHours = hours % 24;
  return remainderHours ? `${days}d ${remainderHours}h` : `${days}d`;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableText(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function nullableNumber(value: unknown) {
  if (value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function jsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function offerLink(input: {
  offerId: string | null;
  retailerId: string | null;
  retailer: string | null;
  url: string | null;
  itemPricePence: number | null;
  deliveredPricePence: number | null;
  stockStatus: string | null;
}): CanonicalOfferLink | null {
  if (!input.offerId || !input.retailerId || !input.retailer || !input.url) return null;
  return {
    offerId: input.offerId,
    retailerId: input.retailerId,
    retailer: input.retailer,
    url: input.url,
    itemPricePence: input.itemPricePence,
    deliveredPricePence: input.deliveredPricePence,
    stockStatus: input.stockStatus,
  };
}

function intelligence(row: SignalRow): CanonicalAlert["priceIntelligence"] {
  const rrpPence = row.signal_rrp_pence ?? row.canonical_rrp_pence;
  const rrpDeltaPercent = roundOne(percentage(row.price_pence, rrpPence));
  const comparisonBasis = row.delivered_price_pence != null ? "delivered" as const : "item" as const;
  const currentComparisonPence = comparisonBasis === "delivered" ? row.delivered_price_pence : row.price_pence;
  const lowestComparisonPence = comparisonBasis === "delivered" ? row.lowest_delivered_price_pence : row.lowest_item_price_pence;
  const comparable = currentComparisonPence != null && lowestComparisonPence != null;
  const savingsPence = comparable ? Math.max(0, currentComparisonPence - lowestComparisonPence) : null;
  const savingsPercent = comparable && currentComparisonPence > 0
    ? roundOne((savingsPence! / currentComparisonPence) * 100)
    : null;

  let verdict: FatePriceVerdict = "NO_FAIR_COMPARISON";
  if (comparable) verdict = currentComparisonPence <= lowestComparisonPence ? "LOWEST_KNOWN" : "BETTER_OFFER_FOUND";

  return {
    rrpPence,
    rrpDeltaPercent,
    comparisonBasis,
    verdict,
    currentComparisonPence,
    lowestKnown: row.lowest_offer_id ? {
      offerId: row.lowest_offer_id,
      retailerId: row.lowest_retailer_id,
      retailer: row.lowest_retailer_name,
      url: row.lowest_url,
      itemPricePence: row.lowest_item_price_pence,
      deliveredPricePence: row.lowest_delivered_price_pence,
      comparisonPricePence: lowestComparisonPence,
      stockStatus: row.lowest_stock_status,
    } : null,
    savingsPence,
    savingsPercent,
  };
}

function signalThread(row: SignalRow): CanonicalSignalThreadEntry[] {
  return jsonArray<JsonThreadRow>(row.history_json).flatMap((entry) => {
    const id = text(entry.id);
    const state = text(entry.state);
    const retailer = text(entry.retailer);
    const url = text(entry.url);
    const detectedAt = nullableNumber(entry.detectedAt);
    if (!id || !state || !retailer || !url || detectedAt == null) return [];
    return [{
      id,
      state,
      fateStage: publicStage(state),
      retailer,
      occurredAt: new Date(detectedAt * 1000).toISOString(),
      reason: text(entry.reason),
      pricePence: nullableNumber(entry.pricePence),
      stockStatus: nullableText(entry.stockStatus),
      previousStockStatus: nullableText(entry.previousStockStatus),
      url,
    }];
  });
}

function preparedLinks(row: SignalRow, stage: CanonicalSignalStage, priceIntelligence: CanonicalAlert["priceIntelligence"]): CanonicalPreparedLinks {
  const primary: CanonicalPreparedLinks["primary"] = {
    offerId: row.offer_id,
    retailerId: row.retailer_id,
    retailer: row.retailer_name,
    url: row.url,
    itemPricePence: row.price_pence,
    deliveredPricePence: row.delivered_price_pence,
    stockStatus: row.stock_status,
    intent: stage === "MANIFESTED" ? "buy" : "inspect",
    label: stage === "MANIFESTED" ? "BUY / VIEW PRODUCT" : stage === "VANISHED" ? "VIEW LAST PRODUCT PAGE" : "INSPECT PRODUCT",
  };

  const lowestKnown = offerLink({
    offerId: row.lowest_offer_id,
    retailerId: row.lowest_retailer_id,
    retailer: row.lowest_retailer_name,
    url: row.lowest_url,
    itemPricePence: row.lowest_item_price_pence,
    deliveredPricePence: row.lowest_delivered_price_pence,
    stockStatus: row.lowest_stock_status,
  });

  const officialReference = offerLink({
    offerId: row.official_offer_id,
    retailerId: row.official_retailer_id,
    retailer: row.official_retailer_name,
    url: row.official_url,
    itemPricePence: row.official_item_price_pence,
    deliveredPricePence: row.official_delivered_price_pence,
    stockStatus: row.official_stock_status,
  });

  const alternatives = jsonArray<JsonOfferRow>(row.alternatives_json).flatMap((entry) => {
    const link = offerLink({
      offerId: nullableText(entry.offerId),
      retailerId: nullableText(entry.retailerId),
      retailer: nullableText(entry.retailer),
      url: nullableText(entry.url),
      itemPricePence: nullableNumber(entry.itemPricePence),
      deliveredPricePence: nullableNumber(entry.deliveredPricePence),
      stockStatus: nullableText(entry.stockStatus),
    });
    return link ? [link] : [];
  });

  return {
    primary,
    lowestKnown,
    officialReference,
    alternatives,
    compareQuery: row.title,
    fateFindQuery: row.title,
  };
}

function notificationCopy(
  row: SignalRow,
  priceIntelligence: CanonicalAlert["priceIntelligence"],
  links: CanonicalPreparedLinks,
  productIntelligence: ProductAlertClassification,
): CanonicalAlert["notification"] {
  const stage = publicStage(row.state);
  const stageLabel = stage === "WHISPER" ? "Whisper" : stage === "ECHO" ? "Echo" : stage === "MANIFESTED" ? "Manifested" : stage === "VANISHED" ? "Vanished" : "Signal";
  const price = pounds(row.price_pence);
  const rrp = pounds(priceIntelligence.rrpPence);
  const delta = priceIntelligence.rrpDeltaPercent;

  const lines: string[] = [];
  lines.push(price ? `${row.retailer_name} · ${price}` : row.retailer_name);

  if (stage === "WHISPER") lines.push("Catalogue or product movement detected · stock is not confirmed");
  if (stage === "ECHO") lines.push("Queue, traffic or security readiness changed · get ready · stock is not confirmed");
  if (stage === "VANISHED") {
    lines.push("Observed availability is no longer verified");
    const duration = observedDuration(row.observed_duration_seconds);
    if (duration) lines.push(`Observed live for ${duration}`);
  }

  if (rrp && delta != null) {
    const direction = delta === 0 ? "at RRP" : delta > 0 ? `${delta.toFixed(1)}% over RRP` : `${Math.abs(delta).toFixed(1)}% below RRP`;
    lines.push(`${direction} · RRP ${rrp}`);
  }

  if (priceIntelligence.verdict === "BETTER_OFFER_FOUND" && priceIntelligence.lowestKnown?.comparisonPricePence != null) {
    const lowest = pounds(priceIntelligence.lowestKnown.comparisonPricePence);
    const saving = pounds(priceIntelligence.savingsPence);
    const basis = priceIntelligence.comparisonBasis === "delivered" ? "delivered" : "item price";
    lines.push(`Better offer: ${lowest} at ${priceIntelligence.lowestKnown.retailer}${saving ? ` · save ${saving}` : ""} · ${basis}`);
  } else if (priceIntelligence.verdict === "LOWEST_KNOWN") {
    lines.push("FateDrop verdict: lowest known comparable offer");
  } else if (stage === "VANISHED" && links.alternatives.length) {
    lines.push(`${links.alternatives.length} live alternative${links.alternatives.length === 1 ? "" : "s"} prepared`);
  } else {
    lines.push("FateDrop verdict: no fair price comparison yet");
  }

  return {
    title: `FateDrop · ${stageLabel} · ${row.title}`,
    body: lines.join("\n"),
    data: {
      route: "alerts",
      alertId: row.id,
      productUrl: row.url,
      stage,
      verdict: priceIntelligence.verdict,
      lowestKnownUrl: links.lowestKnown?.url ?? null,
      compareQuery: links.compareQuery,
      productCategory: productIntelligence.category,
      observedDurationSeconds: row.observed_duration_seconds,
      linksPrepared: true,
    },
  };
}

function toCanonicalAlert(row: SignalRow): CanonicalAlert {
  const fateStage = publicStage(row.state);
  const confirmed = fateStage === "MANIFESTED";
  const priceIntelligence = intelligence(row);
  const links = preparedLinks(row, fateStage, priceIntelligence);
  const productIntelligence = classifyProductAlert({ title: row.title, productType: row.product_type });
  return {
    id: row.id,
    type: row.state.toUpperCase(),
    fateStage,
    productId: row.product_id,
    offerId: row.offer_id,
    retailerId: row.retailer_id,
    title: row.title,
    message: row.reason,
    retailer: row.retailer_name,
    detectedAt: new Date(Number(row.detected_at) * 1000).toISOString(),
    observedDurationSeconds: row.state === "vanished" ? row.observed_duration_seconds : null,
    productIntelligence,
    confirmed,
    confirmedRestock: confirmed,
    productUrl: row.url,
    product: {
      title: row.title,
      productType: row.product_type,
      url: row.url,
      imageUrl: row.image_url,
      pricePence: row.price_pence,
      rrpPence: priceIntelligence.rrpPence,
      deliveredPricePence: row.delivered_price_pence,
    },
    priceIntelligence,
    signalThread: signalThread(row),
    preparedLinks: links,
    notification: notificationCopy(row, priceIntelligence, links, productIntelligence),
    confidence: Number(row.confidence),
  };
}

const selectColumns = `unused-at-runtime`;
void selectColumns;

export async function listCanonicalAlerts({ id, limit = 50 }: { id?: string | null; limit?: number } = {}) {
  const sql = await fateDropPostgres();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const rows = id
    ? await sql`
        SELECT
          s.id,s.state,s.product_id,s.offer_id,s.retailer_id,s.retailer_name,s.title,s.product_type,s.url,s.image_url,s.price_pence,
          s.rrp_pence AS signal_rrp_pence,p.official_rrp_pence AS canonical_rrp_pence,
          s.delivered_price_pence,s.stock_status,s.confidence,s.detected_at,
          (CASE WHEN s.state='vanished' AND live_window.manifested_at IS NOT NULL THEN GREATEST(0,s.detected_at-live_window.manifested_at) ELSE NULL END)::integer AS observed_duration_seconds,
          s.reason,
          best.offer_id AS lowest_offer_id,best.retailer_id AS lowest_retailer_id,best.retailer_name AS lowest_retailer_name,best.url AS lowest_url,
          best.price_pence AS lowest_item_price_pence,best.stock_status AS lowest_stock_status,
          CASE WHEN best.postage_pence IS NOT NULL AND best.price_pence IS NOT NULL THEN best.price_pence + best.postage_pence ELSE NULL END AS lowest_delivered_price_pence,
          official.offer_id AS official_offer_id,official.retailer_id AS official_retailer_id,official.retailer_name AS official_retailer_name,official.url AS official_url,
          official.price_pence AS official_item_price_pence,official.stock_status AS official_stock_status,
          CASE WHEN official.postage_pence IS NOT NULL AND official.price_pence IS NOT NULL THEN official.price_pence + official.postage_pence ELSE NULL END AS official_delivered_price_pence,
          history.history_json,alternatives.alternatives_json
        FROM fatedrop_signals s
        LEFT JOIN fatedrop_products p ON p.id=s.product_id
        LEFT JOIN LATERAL (
          SELECT ro.offer_id,ro.retailer_id,ro.retailer_name,ro.url,ro.price_pence,ro.postage_pence,ro.stock_status
          FROM fatedrop_retail_offers ro
          WHERE ro.product_id=s.product_id
            AND ro.stock_status IN ('in_stock','low_stock','preorder')
            AND ro.price_pence IS NOT NULL
            AND (s.delivered_price_pence IS NULL OR ro.postage_pence IS NOT NULL)
          ORDER BY CASE WHEN s.delivered_price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence ELSE ro.price_pence END ASC, ro.last_seen_at DESC
          LIMIT 1
        ) best ON true
        LEFT JOIN LATERAL (
          SELECT ro.offer_id,ro.retailer_id,ro.retailer_name,ro.url,ro.price_pence,ro.postage_pence,ro.stock_status
          FROM fatedrop_retail_offers ro
          WHERE ro.product_id=s.product_id AND ro.retailer_id='pokemon-center-uk'
          ORDER BY ro.last_seen_at DESC
          LIMIT 1
        ) official ON true
        LEFT JOIN LATERAL (
          SELECT hs.detected_at AS manifested_at
          FROM fatedrop_signals hs
          WHERE s.state='vanished'
            AND hs.offer_id=s.offer_id
            AND hs.state='manifested'
            AND hs.detected_at < s.detected_at
            AND NOT EXISTS (
              SELECT 1
              FROM fatedrop_signals hv
              WHERE hv.offer_id=s.offer_id
                AND hv.state='vanished'
                AND hv.detected_at > hs.detected_at
                AND hv.detected_at < s.detected_at
            )
          ORDER BY hs.detected_at DESC
          LIMIT 1
        ) live_window ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id',h.id,'state',h.state,'retailer',h.retailer_name,'detectedAt',h.detected_at,'reason',h.reason,
            'pricePence',h.price_pence,'stockStatus',h.stock_status,'previousStockStatus',h.previous_stock_status,'url',h.url
          ) ORDER BY h.detected_at ASC),'[]'::jsonb) AS history_json
          FROM (
            SELECT hs.id,hs.state,hs.retailer_name,hs.detected_at,hs.reason,hs.price_pence,hs.stock_status,hs.previous_stock_status,hs.url
            FROM fatedrop_signals hs
            WHERE hs.offer_id=s.offer_id
            ORDER BY hs.detected_at DESC
            LIMIT 12
          ) h
        ) history ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'offerId',a.offer_id,'retailerId',a.retailer_id,'retailer',a.retailer_name,'url',a.url,
            'itemPricePence',a.price_pence,'deliveredPricePence',a.delivered_price_pence,'stockStatus',a.stock_status
          ) ORDER BY a.sort_price ASC,a.last_seen_at DESC),'[]'::jsonb) AS alternatives_json
          FROM (
            SELECT ro.offer_id,ro.retailer_id,ro.retailer_name,ro.url,ro.price_pence,ro.stock_status,ro.last_seen_at,
              CASE WHEN ro.postage_pence IS NOT NULL AND ro.price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence ELSE NULL END AS delivered_price_pence,
              COALESCE(CASE WHEN ro.postage_pence IS NOT NULL AND ro.price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence END,ro.price_pence) AS sort_price
            FROM fatedrop_retail_offers ro
            WHERE ro.product_id=s.product_id AND ro.offer_id<>s.offer_id
              AND ro.stock_status IN ('in_stock','low_stock','preorder') AND ro.price_pence IS NOT NULL
            ORDER BY CASE WHEN ro.postage_pence IS NULL THEN 1 ELSE 0 END ASC,
              COALESCE(CASE WHEN ro.postage_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence END,ro.price_pence) ASC,
              ro.last_seen_at DESC
            LIMIT 8
          ) a
        ) alternatives ON true
        WHERE s.id=${id}
        LIMIT 1`
    : await sql`
        SELECT
          s.id,s.state,s.product_id,s.offer_id,s.retailer_id,s.retailer_name,s.title,s.product_type,s.url,s.image_url,s.price_pence,
          s.rrp_pence AS signal_rrp_pence,p.official_rrp_pence AS canonical_rrp_pence,
          s.delivered_price_pence,s.stock_status,s.confidence,s.detected_at,
          (CASE WHEN s.state='vanished' AND live_window.manifested_at IS NOT NULL THEN GREATEST(0,s.detected_at-live_window.manifested_at) ELSE NULL END)::integer AS observed_duration_seconds,
          s.reason,
          best.offer_id AS lowest_offer_id,best.retailer_id AS lowest_retailer_id,best.retailer_name AS lowest_retailer_name,best.url AS lowest_url,
          best.price_pence AS lowest_item_price_pence,best.stock_status AS lowest_stock_status,
          CASE WHEN best.postage_pence IS NOT NULL AND best.price_pence IS NOT NULL THEN best.price_pence + best.postage_pence ELSE NULL END AS lowest_delivered_price_pence,
          official.offer_id AS official_offer_id,official.retailer_id AS official_retailer_id,official.retailer_name AS official_retailer_name,official.url AS official_url,
          official.price_pence AS official_item_price_pence,official.stock_status AS official_stock_status,
          CASE WHEN official.postage_pence IS NOT NULL AND official.price_pence IS NOT NULL THEN official.price_pence + official.postage_pence ELSE NULL END AS official_delivered_price_pence,
          history.history_json,alternatives.alternatives_json
        FROM fatedrop_signals s
        LEFT JOIN fatedrop_products p ON p.id=s.product_id
        LEFT JOIN LATERAL (
          SELECT ro.offer_id,ro.retailer_id,ro.retailer_name,ro.url,ro.price_pence,ro.postage_pence,ro.stock_status
          FROM fatedrop_retail_offers ro
          WHERE ro.product_id=s.product_id
            AND ro.stock_status IN ('in_stock','low_stock','preorder')
            AND ro.price_pence IS NOT NULL
            AND (s.delivered_price_pence IS NULL OR ro.postage_pence IS NOT NULL)
          ORDER BY CASE WHEN s.delivered_price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence ELSE ro.price_pence END ASC, ro.last_seen_at DESC
          LIMIT 1
        ) best ON true
        LEFT JOIN LATERAL (
          SELECT ro.offer_id,ro.retailer_id,ro.retailer_name,ro.url,ro.price_pence,ro.postage_pence,ro.stock_status
          FROM fatedrop_retail_offers ro
          WHERE ro.product_id=s.product_id AND ro.retailer_id='pokemon-center-uk'
          ORDER BY ro.last_seen_at DESC
          LIMIT 1
        ) official ON true
        LEFT JOIN LATERAL (
          SELECT hs.detected_at AS manifested_at
          FROM fatedrop_signals hs
          WHERE s.state='vanished'
            AND hs.offer_id=s.offer_id
            AND hs.state='manifested'
            AND hs.detected_at < s.detected_at
            AND NOT EXISTS (
              SELECT 1
              FROM fatedrop_signals hv
              WHERE hv.offer_id=s.offer_id
                AND hv.state='vanished'
                AND hv.detected_at > hs.detected_at
                AND hv.detected_at < s.detected_at
            )
          ORDER BY hs.detected_at DESC
          LIMIT 1
        ) live_window ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id',h.id,'state',h.state,'retailer',h.retailer_name,'detectedAt',h.detected_at,'reason',h.reason,
            'pricePence',h.price_pence,'stockStatus',h.stock_status,'previousStockStatus',h.previous_stock_status,'url',h.url
          ) ORDER BY h.detected_at ASC),'[]'::jsonb) AS history_json
          FROM (
            SELECT hs.id,hs.state,hs.retailer_name,hs.detected_at,hs.reason,hs.price_pence,hs.stock_status,hs.previous_stock_status,hs.url
            FROM fatedrop_signals hs
            WHERE hs.offer_id=s.offer_id
            ORDER BY hs.detected_at DESC
            LIMIT 12
          ) h
        ) history ON true
        LEFT JOIN LATERAL (
          SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'offerId',a.offer_id,'retailerId',a.retailer_id,'retailer',a.retailer_name,'url',a.url,
            'itemPricePence',a.price_pence,'deliveredPricePence',a.delivered_price_pence,'stockStatus',a.stock_status
          ) ORDER BY a.sort_price ASC,a.last_seen_at DESC),'[]'::jsonb) AS alternatives_json
          FROM (
            SELECT ro.offer_id,ro.retailer_id,ro.retailer_name,ro.url,ro.price_pence,ro.stock_status,ro.last_seen_at,
              CASE WHEN ro.postage_pence IS NOT NULL AND ro.price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence ELSE NULL END AS delivered_price_pence,
              COALESCE(CASE WHEN ro.postage_pence IS NOT NULL AND ro.price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence END,ro.price_pence) AS sort_price
            FROM fatedrop_retail_offers ro
            WHERE ro.product_id=s.product_id AND ro.offer_id<>s.offer_id
              AND ro.stock_status IN ('in_stock','low_stock','preorder') AND ro.price_pence IS NOT NULL
            ORDER BY CASE WHEN ro.postage_pence IS NULL THEN 1 ELSE 0 END ASC,
              COALESCE(CASE WHEN ro.postage_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence END,ro.price_pence) ASC,
              ro.last_seen_at DESC
            LIMIT 8
          ) a
        ) alternatives ON true
        ORDER BY s.detected_at DESC
        LIMIT ${safeLimit}`;

  return rows.map((row) => toCanonicalAlert(row as SignalRow));
}
