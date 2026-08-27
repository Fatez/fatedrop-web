import { AccountStorageUnavailableError, findAccountByEmail } from "@/lib/account-storage";
import { authRateLimitResponse, checkAuthRateLimit, isRequestTooLargeError, readBoundedJson } from "@/lib/auth-abuse";
import { assertSameOrigin, startSession, verifyLoginPassword } from "@/lib/auth";
import { assertTurnstile, TurnstileRejectedError, TurnstileUnavailableError } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const rateLimit = checkAuthRateLimit(request, "login");
    if (!rateLimit.allowed) return authRateLimitResponse(rateLimit);

    const payload = await readBoundedJson(request);
    await assertTurnstile(request, payload.turnstileToken, "login");
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof payload.password === "string" && payload.password.length <= 200 ? payload.password : "";
    const account = email ? await findAccountByEmail(email) : null;
    const valid = await verifyLoginPassword(password, account?.passwordHash);
    if (!account || !valid) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    await startSession(account.id);
    return Response.json({ authenticated: true }, { status: 200 });
  } catch (error) {
    if (isRequestTooLargeError(error)) return Response.json({ error: "Request is too large." }, { status: 413 });
    if (error instanceof TurnstileRejectedError) return Response.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    if (error instanceof TurnstileUnavailableError) return Response.json({ error: "Security verification is temporarily unavailable." }, { status: 503 });
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Sign-in could not be completed." }, { status: 500 });
  }
}