import { randomBytes } from "node:crypto";
import { AccountConflictError, AccountStorageUnavailableError, createAccount, findAccountByUsername, type AccountRecord } from "@/lib/account-storage";
import { authRateLimitResponse, checkAuthRateLimit, isRequestTooLargeError, readBoundedJson } from "@/lib/auth-abuse";
import { assertSameOrigin, hashPassword, startSession } from "@/lib/auth";
import { assertTurnstile, TurnstileRejectedError, TurnstileUnavailableError } from "@/lib/turnstile";

export const runtime = "nodejs";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function slugName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18) || "collector";
}

async function uniqueUsername(displayName: string) {
  const base = slugName(displayName);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = randomBytes(2).toString("hex");
    const candidate = `${base}_${suffix}`.slice(0, 24);
    if (!(await findAccountByUsername(candidate))) return candidate;
  }
  return `collector_${randomBytes(5).toString("hex")}`.slice(0, 24);
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const rateLimit = checkAuthRateLimit(request, "register");
    if (!rateLimit.allowed) return authRateLimitResponse(rateLimit);

    const payload = await readBoundedJson(request);
    const displayName = clean(payload.displayName, 60);
    const email = clean(payload.email, 254).toLowerCase();
    const password = typeof payload.password === "string" ? payload.password : "";

    const fields: Record<string, string> = {};
    if (displayName.length < 2) fields.displayName = "Use at least 2 characters.";
    if (!validEmail(email)) fields.email = "Enter a valid email address.";
    if (password.length < 10) fields.password = "Use at least 10 characters.";
    if (password.length > 200) fields.password = "Password is longer than expected.";
    if (Object.keys(fields).length) return Response.json({ error: "Check the highlighted fields.", fields }, { status: 400 });

    await assertTurnstile(request, payload.turnstileToken, "register");

    const now = Math.floor(Date.now() / 1000);
    const account: AccountRecord = {
      id: crypto.randomUUID(),
      fateId: `FD-${randomBytes(5).toString("hex").toUpperCase()}`,
      email,
      passwordHash: await hashPassword(password),
      displayName,
      username: await uniqueUsername(displayName),
      bio: null,
      avatarUrl: null,
      primaryTcg: "Pokémon TCG",
      collectorStyle: null,
      region: null,
      profileTheme: "signal",
      createdAt: now,
      updatedAt: now,
    };

    await createAccount(account);
    await startSession(account.id);
    return Response.json({ created: true, fateId: account.fateId }, { status: 201 });
  } catch (error) {
    if (isRequestTooLargeError(error)) return Response.json({ error: "Request is too large." }, { status: 413 });
    if (error instanceof TurnstileRejectedError) return Response.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    if (error instanceof TurnstileUnavailableError) return Response.json({ error: "Security verification is temporarily unavailable." }, { status: 503 });
    if (error instanceof AccountConflictError) return Response.json({ error: "An account could not be created with those details." }, { status: 409 });
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Your FateDrop ID could not be created. Please try again." }, { status: 500 });
  }
}
