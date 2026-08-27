const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;

export class TurnstileRejectedError extends Error {
  constructor(message = "Turnstile verification failed") {
    super(message);
    this.name = "TurnstileRejectedError";
  }
}

export class TurnstileUnavailableError extends Error {
  constructor(message = "Turnstile verification unavailable") {
    super(message);
    this.name = "TurnstileUnavailableError";
  }
}

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
};

function expectedHostname(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || new URL(request.url).hostname;
  return host.split(":")[0].toLowerCase();
}

export async function assertTurnstile(request: Request, token: unknown, expectedAction: "login" | "register") {
  const secret = String(process.env.TURNSTILE_SECRET_KEY || "").trim();
  if (!secret) {
    if (process.env.NODE_ENV !== "production") return;
    throw new TurnstileUnavailableError();
  }

  const responseToken = typeof token === "string" ? token.trim() : "";
  if (!responseToken || responseToken.length > MAX_TOKEN_LENGTH) throw new TurnstileRejectedError();

  let response: Response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret,
        response: responseToken,
        idempotency_key: crypto.randomUUID(),
      }),
      cache: "no-store",
    });
  } catch {
    throw new TurnstileUnavailableError();
  }

  if (!response.ok) throw new TurnstileUnavailableError();

  let result: TurnstileResponse;
  try {
    result = await response.json() as TurnstileResponse;
  } catch {
    throw new TurnstileUnavailableError();
  }

  if (result.success !== true) throw new TurnstileRejectedError();
  if (String(result.action || "") !== expectedAction) throw new TurnstileRejectedError();
  if (String(result.hostname || "").toLowerCase() !== expectedHostname(request)) throw new TurnstileRejectedError();
}