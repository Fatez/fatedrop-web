import { fateDropPostgres } from "@/lib/postgres";

export type CanonicalAlertPresentation = {
  referenceKind: string | null;
  referenceBasis: string | null;
  sourceMarket: string | null;
  sourceCurrency: string | null;
  sourceMsrp: string | null;
};

type EvidenceEntry = { kind?: unknown; value?: unknown };
type SignalPresentationRow = { id: string; evidence: unknown };

function evidenceEntries(value: unknown): EvidenceEntry[] {
  if (Array.isArray(value)) return value as EvidenceEntry[];
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as EvidenceEntry[] : [];
  } catch {
    return [];
  }
}

function evidenceValue(entries: EvidenceEntry[], kind: string) {
  const value = entries.find((entry) => entry?.kind === kind)?.value;
  return typeof value === "string" && value.trim() ? value.trim() : value == null ? null : String(value);
}

export function presentationFromEvidence(value: unknown): CanonicalAlertPresentation {
  const entries = evidenceEntries(value);
  return {
    referenceKind: evidenceValue(entries, "rrp_value_kind"),
    referenceBasis: evidenceValue(entries, "rrp_reference_basis"),
    sourceMarket: evidenceValue(entries, "rrp_source_market"),
    sourceCurrency: evidenceValue(entries, "rrp_source_currency"),
    sourceMsrp: evidenceValue(entries, "rrp_source_msrp"),
  };
}

function marketCode(value: string | null | undefined) {
  const code = String(value || "").trim().toUpperCase();
  if (["JP", "KR", "CN", "TW", "HK"].includes(code)) return code;
  return null;
}

export function referenceLabel(presentation?: CanonicalAlertPresentation | null) {
  const kind = presentation?.referenceKind;
  const market = marketCode(presentation?.sourceMarket);
  if (kind === "source_market_msrp") return market ? `Official ${market} MSRP` : "Official source-market MSRP";
  if (kind === "source_market_component_reference") return market ? `${market} MSRP reference` : "Source-market MSRP reference";
  if (kind === "component_reference") return "Component RRP reference";
  if (kind === "pack_reference") return "Pack RRP reference";
  if (kind === "official") return "Verified RRP";
  return "Verified reference";
}

export function humanStockStatus(value?: string | null) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "in_stock") return "In stock";
  if (key === "low_stock") return "Low stock";
  if (key === "preorder") return "Pre-order";
  if (key === "coming_soon") return "Coming soon";
  if (key === "out_of_stock") return "Out of stock";
  return key ? key.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : "Observed";
}

export function confidenceLabel(value?: number | null) {
  if (!Number.isFinite(value)) return "Not rated";
  const score = Math.max(0, Math.min(1, Number(value)));
  const band = score >= 0.85 ? "High" : score >= 0.65 ? "Moderate" : "Developing";
  return `${band} · ${Math.round(score * 100)}%`;
}

export async function listCanonicalAlertPresentations(input: { id?: string | null; limit?: number } = {}) {
  const sql = await fateDropPostgres();
  const id = input.id?.trim() || null;
  const limit = Math.max(1, Math.min(250, Math.trunc(input.limit ?? 120)));
  const rows = id
    ? await sql`SELECT id, evidence FROM fatedrop_signals WHERE id = ${id} LIMIT 1` as SignalPresentationRow[]
    : await sql`
        SELECT id, evidence
        FROM fatedrop_signals
        WHERE state IN ('whisper','echo','manifested','vanished')
        ORDER BY detected_at DESC
        LIMIT ${limit}
      ` as SignalPresentationRow[];
  return new Map(rows.map((row) => [row.id, presentationFromEvidence(row.evidence)]));
}
