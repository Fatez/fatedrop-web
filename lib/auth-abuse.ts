const DEFAULT_MAX_KEYS = 5_000;
const MAX_AUTH_BODY_BYTES = 16_384;

type AuthAction = "login" | "register";

type Policy = Readonly<{ limit: number; windowMs: number }>;

const POLICIES: Readonly<Record<AuthAction, Policy>> = Object.freeze({
  login: Object.freeze({ limit: 10, windowMs: 10 * 60_000 }),
  register: Object.freeze({ limit: 5, windowMs: 60 * 60_000 }),
});

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function firstHeaderValue(value: string | null) {
  return String(value || "").split(",")[0]?.trim() || "";
}

export function authClientKey(request: Request) {
  const cloudflareIp = firstHeaderValue(request.headers.get("cf-connecting-ip"));
  if (cloudflareIp) return `ip:${cloudflareIp}`;

  const realIp = firstHeaderValue(request.headers.get("x-real-ip"));
  if (realIp) return `ip:${realIp}`;

  const forwardedIp = firstHeaderValue(request.headers.get("x-forwarded-for"));
  if (forwardedIp) return `ip:${forwardedIp}`;

  return "ip:unknown";
}

function evictIfNeeded(key: string, maxKeys = DEFAULT_MAX_KEYS) {
  if (buckets.has(key) || buckets.size < maxKeys) return;
  const oldest = buckets.keys().next().value as string | undefined;
  if (oldest) buckets.delete(oldest);
}

export function checkAuthRateLimit(
  request: Request,
  action: AuthAction,
  { now = Date.now(), maxKeys = DEFAULT_MAX_KEYS }: { now?: number; maxKeys?: number } = {},
) {
  const policy = POLICIES[action];
  const key = `${action}:${authClientKey(request)}`;
  evictIfNeeded(key, Math.max(100, maxKeys));

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + policy.windowMs };
    buckets.delete(key);
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= policy.limit;
  return Object.freeze({
    allowed,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  });
}

export async function readBoundedJson(request: Request, maxBytes = MAX_AUTH_BODY_BYTES) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    const error = new Error("REQUEST_TOO_LARGE");
    error.name = "RequestTooLargeError";
    throw error;
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    const error = new Error("REQUEST_TOO_LARGE");
    error.name = "RequestTooLargeError";
    throw error;
  }

  if (!raw) return {} as Record<string, unknown>;
  return JSON.parse(raw) as Record<string, unknown>;
}

export function authRateLimitResponse(decision: { limit: number; remaining: number; retryAfterSeconds: number }) {
  return Response.json(
    { error: "Too many attempts. Please try again shortly." },
    {
      status: 429,
      headers: {
        "retry-after": String(decision.retryAfterSeconds),
        "x-ratelimit-limit": String(decision.limit),
        "x-ratelimit-remaining": String(decision.remaining),
      },
    },
  );
}

export function isRequestTooLargeError(error: unknown) {
  return error instanceof Error && (error.name === "RequestTooLargeError" || error.message === "REQUEST_TOO_LARGE");
}
