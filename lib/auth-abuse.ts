type AuthAction = "login" | "register";

type Bucket = {
  count: number;
  resetAt: number;
};

type Policy = {
  limit: number;
  windowMs: number;
};

const POLICIES: Record<AuthAction, Policy> = {
  login: { limit: 30, windowMs: 10 * 60 * 1000 },
  register: { limit: 10, windowMs: 30 * 60 * 1000 },
};

const MAX_BUCKETS = 5_000;
const MAX_AUTH_BODY_BYTES = 8 * 1024;
const buckets = new Map<string, Bucket>();

export class AuthRequestBodyError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthRequestBodyError";
    this.status = status;
  }
}

function firstHeaderValue(value: string | null) {
  return String(value || "").split(",")[0]?.trim() || "";
}

export function authClientAddress(request: Request) {
  return firstHeaderValue(request.headers.get("cf-connecting-ip"))
    || firstHeaderValue(request.headers.get("x-forwarded-for"))
    || firstHeaderValue(request.headers.get("x-real-ip"))
    || "unknown";
}

function evictIfNeeded(key: string) {
  if (buckets.has(key) || buckets.size < MAX_BUCKETS) return;
  const oldest = buckets.keys().next().value;
  if (oldest) buckets.delete(oldest);
}

export function checkAuthRateLimit(request: Request, action: AuthAction, now = Date.now()) {
  const policy = POLICIES[action];
  const key = `${action}:${authClientAddress(request)}`;
  evictIfNeeded(key);

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + policy.windowMs };
    buckets.delete(key);
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const allowed = bucket.count <= policy.limit;
  return {
    allowed,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function authRateLimitResponse(decision: ReturnType<typeof checkAuthRateLimit>) {
  return Response.json(
    { error: "Too many attempts. Please try again shortly." },
    {
      status: 429,
      headers: {
        "cache-control": "no-store",
        "retry-after": String(decision.retryAfterSeconds),
        "x-ratelimit-limit": String(decision.limit),
        "x-ratelimit-remaining": String(decision.remaining),
      },
    },
  );
}

export async function readAuthJsonBody(request: Request, maxBytes = MAX_AUTH_BODY_BYTES) {
  const rawLength = request.headers.get("content-length");
  if (rawLength) {
    const contentLength = Number(rawLength);
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new AuthRequestBodyError("Request body is too large.", 413);
    }
  }

  if (!request.body) return {} as Record<string, unknown>;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new AuthRequestBodyError("Request body is too large.", 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  if (!text.trim()) return {} as Record<string, unknown>;
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new AuthRequestBodyError("Request body must be a JSON object.", 400);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof AuthRequestBodyError) throw error;
    throw new AuthRequestBodyError("Request body is invalid JSON.", 400);
  }
}

export function resetAuthRateLimitsForTest() {
  buckets.clear();
}
