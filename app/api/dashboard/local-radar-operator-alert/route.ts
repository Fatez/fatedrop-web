import { timingSafeEqual } from "node:crypto";

import { dispatchLocalRadarOperatorPush, type LocalRadarOperatorPush } from "@/lib/canonical-push";
import { readPushProductionHealth } from "@/lib/push-dispatch-health";
import { isTcgCode, TCG_REGISTRY } from "@/lib/tcg-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

function nullableIso(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const clean = text(value, 80);
  if (!clean || !Number.isFinite(Date.parse(clean))) return undefined;
  return new Date(clean).toISOString();
}

const languageGroups = new Set(["english", "japanese", "korean", "simplified_chinese", "traditional_chinese", "other", "unknown"]);

function optionalLanguageGroup(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  return typeof value === "string" && languageGroups.has(value) ? value as LocalRadarOperatorPush["languageGroup"] : null;
}

function optionalSetKey(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const clean = text(value, 120);
  return clean && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean) ? clean : undefined;
}

function optionalHttpsUrl(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const clean = text(value, 700);
  if (!clean) return undefined;
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || !parsed.hostname) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function activeTcgCode(value: unknown) {
  if (!isTcgCode(value)) return null;
  return TCG_REGISTRY.some((entry) => entry.code === value && entry.live) ? value : null;
}

function authorized(request: Request) {
  const secret = process.env.FATEDROP_METRICS_INGEST_SECRET;
  const authorization = request.headers.get("authorization") || "";
  if (!secret || !authorization.startsWith("Bearer ")) return false;
  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function parseOperatorPush(payload: unknown): LocalRadarOperatorPush | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  if (value.testOnly !== undefined && typeof value.testOnly !== "boolean") return null;

  const testOnly = value.testOnly === true;
  const operatorIssue = Number(value.operatorIssue);
  const branchCount = Number(value.branchCount);
  const eventId = text(value.eventId, 180);
  const tcgCode = activeTcgCode(value.tcgCode);
  const stage = value.stage === "WHISPER" || value.stage === "ECHO" ? value.stage : null;
  const title = text(value.title, 180);
  const body = text(value.body, 600);
  const retailerId = text(value.retailerId, 120);
  const retailerName = text(value.retailerName, 140);
  const productTitle = text(value.productTitle, 240);
  const expectedFrom = nullableIso(value.expectedFrom);
  const expectedTo = nullableIso(value.expectedTo);
  const expectedLabel = value.expectedLabel === null || value.expectedLabel === undefined ? null : text(value.expectedLabel, 140);
  const availabilityScope = value.availabilityScope === "physical_branch" || value.availabilityScope === "online_retailer_readiness"
    ? value.availabilityScope
    : null;
  const route = value.route === "local-radar" || value.route === "alerts" ? value.route : null;
  const presentationType = value.presentationType === "readiness_echo" ? "readiness_echo" : null;
  const availabilityVerified = value.availabilityVerified;
  const sourceUrl = optionalHttpsUrl(value.sourceUrl);
  const evidenceObservedAt = nullableIso(value.evidenceObservedAt);
  const languageGroup = optionalLanguageGroup(value.languageGroup);
  const setKey = optionalSetKey(value.setKey);

  if (!Number.isInteger(operatorIssue) || operatorIssue <= 0) return null;
  if (!tcgCode || !stage || !title || !body || !retailerId || !retailerName || !productTitle) return null;
  if (!availabilityScope || !route || availabilityVerified !== false) return null;
  if (sourceUrl === undefined || evidenceObservedAt === undefined) return null;
  if (languageGroup === null || setKey === undefined) return null;

  if (testOnly) {
    if (availabilityScope !== "physical_branch" || route !== "local-radar") return null;
    if (!Number.isInteger(branchCount) || branchCount < 1 || branchCount > 100) return null;
    if (eventId !== `local-radar-operator-test:${operatorIssue}`) return null;
    if (title !== "FateDrop · Local Radar · TEST ONLY") return null;
    if (!body.startsWith("TEST ONLY · Operator transport verification matched ")) return null;
    if (!body.endsWith("No stock or Local Radar history has been created.")) return null;
  } else if (availabilityScope === "online_retailer_readiness") {
    if (eventId !== `local-radar-operator:${operatorIssue}`) return null;
    if (stage !== "ECHO" || route !== "alerts" || presentationType !== "readiness_echo") return null;
    if (Number.isFinite(branchCount) && branchCount !== 0) return null;
    if (title !== "FateDrop · Echo · Be ready") return null;
    if (!body.endsWith("This is readiness evidence, not confirmed stock.")) return null;
  } else {
    // Physical Big Fate intelligence is consumed from Cloud through radius-filtered
    // Local Radar. It must never enter this chain-wide interrupt endpoint.
    return null;
  }

  if (expectedFrom === undefined || expectedTo === undefined) return null;
  if (expectedFrom && expectedTo && Date.parse(expectedTo) < Date.parse(expectedFrom)) return null;
  if (expectedLabel === null && !expectedFrom && !expectedTo) return null;

  return {
    eventId,
    tcgCode,
    stage,
    route,
    presentationType: testOnly ? "test_only" : "readiness_echo",
    availabilityScope,
    availabilityVerified: false,
    title,
    body,
    retailerId,
    retailerName,
    productTitle,
    expectedFrom,
    expectedTo,
    expectedLabel,
    branchCount: testOnly ? branchCount : 0,
    operatorIssue,
    sourceUrl,
    evidenceObservedAt,
    languageGroup,
    setKey,
  };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return new Response(null, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    const health = await readPushProductionHealth();
    return new Response(null, {
      status: health.ok ? 204 : 503,
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return new Response(null, { status: 503, headers: { "cache-control": "no-store" } });
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Local Radar operator delivery is not authorised." }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const payload = await request.json().catch(() => null);
  const event = parseOperatorPush(payload);
  if (!event) {
    return Response.json({ error: "Invalid Local Radar operator event." }, { status: 400, headers: { "cache-control": "no-store" } });
  }

  try {
    const result = await dispatchLocalRadarOperatorPush(event);
    if (!result.enabled) {
      return Response.json({ error: "Push dispatch is not enabled.", result }, { status: 503, headers: { "cache-control": "no-store" } });
    }
    return Response.json({ accepted: true, eventId: event.eventId, ...result }, { status: 200, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Local Radar operator alert could not be queued." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
