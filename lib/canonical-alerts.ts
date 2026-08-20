import { fateDropPostgres } from "@/lib/postgres";

export type FatePriceVerdict = "LOWEST_KNOWN" | "BETTER_OFFER_FOUND" | "NO_FAIR_COMPARISON";

export type CanonicalAlert = {
  id: string;
  type: string;
  fateStage: string;
  title: string;
  message: string;
  retailer: string;
  detectedAt: string;
  confirmed: boolean;
  confirmedRestock: boolean;
  productUrl: string;
  product: {
    title: string;
    url: string;
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
      retailer: string | null;
      url: string | null;
      itemPricePence: number | null;
      deliveredPricePence: number | null;
      comparisonPricePence: number | null;
    } | null;
    savingsPence: number | null;
    savingsPercent: number | null;
  };
  notification: {
    title: string;
    body: string;
    data: {
      route: "alerts";
      alertId: string;
      productUrl: string;
      stage: string;
      verdict: FatePriceVerdict;
    };
  };
  confidence: number;
};

type SignalRow = {
  id: string;
  state: string;
  product_id: string;
  offer_id: string;
  retailer_name: string;
  title: string;
  url: string;
  price_pence: number | null;
  signal_rrp_pence: number | null;
  canonical_rrp_pence: number | null;
  delivered_price_pence: number | null;
  confidence: number;
  detected_at: number;
  reason: string;
  lowest_offer_id: string | null;
  lowest_retailer_name: string | null;
  lowest_url: string | null;
  lowest_item_price_pence: number | null;
  lowest_delivered_price_pence: number | null;
};

function publicStage(state: string) {
  if (state === "whisper") return "ECHO";
  if (state === "manifested" || state === "echo") return "MANIFESTED";
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

function intelligence(row: SignalRow): CanonicalAlert["priceIntelligence"] {
  const rrpPence = row.signal_rrp_pence ?? row.canonical_rrp_pence;
  // RRP describes the item itself. Postage is intentionally excluded from this percentage.
  const rrpDeltaPercent = roundOne(percentage(row.price_pence, rrpPence));

  // True Price comparison uses delivered totals only when both sides have known delivery.
  // When the alert itself has no delivered total, the fallback is explicitly labelled item-price comparison.
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
      retailer: row.lowest_retailer_name,
      url: row.lowest_url,
      itemPricePence: row.lowest_item_price_pence,
      deliveredPricePence: row.lowest_delivered_price_pence,
      comparisonPricePence: lowestComparisonPence,
    } : null,
    savingsPence,
    savingsPercent,
  };
}

function notificationCopy(row: SignalRow, priceIntelligence: CanonicalAlert["priceIntelligence"]): CanonicalAlert["notification"] {
  const stage = publicStage(row.state);
  const stageLabel = stage === "MANIFESTED" ? "Manifested" : stage === "ECHO" ? "Echo" : stage === "VANISHED" ? "Vanished" : "Signal";
  const price = pounds(row.price_pence);
  const rrp = pounds(priceIntelligence.rrpPence);
  const delta = priceIntelligence.rrpDeltaPercent;

  const lines: string[] = [];
  lines.push(price ? `${row.retailer_name} · ${price}` : row.retailer_name);

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
    },
  };
}

function toCanonicalAlert(row: SignalRow): CanonicalAlert {
  const fateStage = publicStage(row.state);
  const confirmed = fateStage === "MANIFESTED";
  const priceIntelligence = intelligence(row);
  return {
    id: row.id,
    type: row.state.toUpperCase(),
    fateStage,
    title: row.title,
    message: row.reason,
    retailer: row.retailer_name,
    detectedAt: new Date(Number(row.detected_at) * 1000).toISOString(),
    confirmed,
    confirmedRestock: confirmed,
    productUrl: row.url,
    product: {
      title: row.title,
      url: row.url,
      pricePence: row.price_pence,
      rrpPence: priceIntelligence.rrpPence,
      deliveredPricePence: row.delivered_price_pence,
    },
    priceIntelligence,
    notification: notificationCopy(row, priceIntelligence),
    confidence: Number(row.confidence),
  };
}

export async function listCanonicalAlerts({ id, limit = 50 }: { id?: string | null; limit?: number } = {}) {
  const sql = await fateDropPostgres();
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const rows = id
    ? await sql`
        SELECT
          s.id,s.state,s.product_id,s.offer_id,s.retailer_name,s.title,s.url,s.price_pence,
          s.rrp_pence AS signal_rrp_pence,p.official_rrp_pence AS canonical_rrp_pence,
          s.delivered_price_pence,s.confidence,s.detected_at,s.reason,
          best.offer_id AS lowest_offer_id,best.retailer_name AS lowest_retailer_name,best.url AS lowest_url,
          best.price_pence AS lowest_item_price_pence,
          CASE WHEN best.postage_pence IS NOT NULL AND best.price_pence IS NOT NULL THEN best.price_pence + best.postage_pence ELSE NULL END AS lowest_delivered_price_pence
        FROM fatedrop_signals s
        LEFT JOIN fatedrop_products p ON p.id=s.product_id
        LEFT JOIN LATERAL (
          SELECT ro.offer_id,ro.retailer_name,ro.url,ro.price_pence,ro.postage_pence
          FROM fatedrop_retail_offers ro
          WHERE ro.product_id=s.product_id
            AND ro.stock_status IN ('in_stock','low_stock','preorder')
            AND ro.price_pence IS NOT NULL
            AND (s.delivered_price_pence IS NULL OR ro.postage_pence IS NOT NULL)
          ORDER BY CASE WHEN s.delivered_price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence ELSE ro.price_pence END ASC, ro.last_seen_at DESC
          LIMIT 1
        ) best ON true
        WHERE s.id=${id}
        LIMIT 1`
    : await sql`
        SELECT
          s.id,s.state,s.product_id,s.offer_id,s.retailer_name,s.title,s.url,s.price_pence,
          s.rrp_pence AS signal_rrp_pence,p.official_rrp_pence AS canonical_rrp_pence,
          s.delivered_price_pence,s.confidence,s.detected_at,s.reason,
          best.offer_id AS lowest_offer_id,best.retailer_name AS lowest_retailer_name,best.url AS lowest_url,
          best.price_pence AS lowest_item_price_pence,
          CASE WHEN best.postage_pence IS NOT NULL AND best.price_pence IS NOT NULL THEN best.price_pence + best.postage_pence ELSE NULL END AS lowest_delivered_price_pence
        FROM fatedrop_signals s
        LEFT JOIN fatedrop_products p ON p.id=s.product_id
        LEFT JOIN LATERAL (
          SELECT ro.offer_id,ro.retailer_name,ro.url,ro.price_pence,ro.postage_pence
          FROM fatedrop_retail_offers ro
          WHERE ro.product_id=s.product_id
            AND ro.stock_status IN ('in_stock','low_stock','preorder')
            AND ro.price_pence IS NOT NULL
            AND (s.delivered_price_pence IS NULL OR ro.postage_pence IS NOT NULL)
          ORDER BY CASE WHEN s.delivered_price_pence IS NOT NULL THEN ro.price_pence + ro.postage_pence ELSE ro.price_pence END ASC, ro.last_seen_at DESC
          LIMIT 1
        ) best ON true
        ORDER BY s.detected_at DESC
        LIMIT ${safeLimit}`;

  return rows.map((row) => toCanonicalAlert(row as SignalRow));
}
