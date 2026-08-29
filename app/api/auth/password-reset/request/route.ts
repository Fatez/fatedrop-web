import { AccountStorageUnavailableError, findAccountByEmail } from "@/lib/account-storage";
import { authRateLimitResponse, checkAuthRateLimit, isRequestTooLargeError, readBoundedJson } from "@/lib/auth-abuse";
import { assertSameOrigin } from "@/lib/auth";
import {
  getPasswordResetEmailContext,
  issuePasswordResetToken,
  PasswordResetEmailUnavailableError,
  queuePasswordResetEmail,
} from "@/lib/password-reset";
import { assertTurnstile, TurnstileRejectedError, TurnstileUnavailableError } from "@/lib/turnstile";

export const runtime = "nodejs";

const GENERIC_MESSAGE = "If a FateDrop ID exists for that email, a password reset link has been sent.";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function minimumResponseDelay(startedAt: number) {
  const remaining = 250 - (Date.now() - startedAt);
  return remaining > 0 ? new Promise((resolve) => setTimeout(resolve, remaining)) : Promise.resolve();
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    assertSameOrigin(request);
    const rateLimit = checkAuthRateLimit(request, "password_reset_request");
    if (!rateLimit.allowed) return authRateLimitResponse(rateLimit);

    const payload = await readBoundedJson(request);
    await assertTurnstile(request, payload.turnstileToken, "password_reset_request");
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
    if (!validEmail(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

    // Resolve the mail capability before looking up the account. If outbound
    // email is unavailable, every requester receives the same service error.
    const emailContext = await getPasswordResetEmailContext();
    const account = await findAccountByEmail(email);
    if (account) {
      const reset = await issuePasswordResetToken(account.id);
      // The recipient is always the canonical email stored on the FateDrop ID,
      // never an arbitrary address supplied after account lookup.
      queuePasswordResetEmail(emailContext, account.email, reset.rawToken);
    }

    await minimumResponseDelay(startedAt);
    return Response.json({ accepted: true, message: GENERIC_MESSAGE }, { status: 202 });
  } catch (error) {
    await minimumResponseDelay(startedAt);
    if (isRequestTooLargeError(error)) return Response.json({ error: "Request is too large." }, { status: 413 });
    if (error instanceof TurnstileRejectedError) return Response.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    if (error instanceof TurnstileUnavailableError) return Response.json({ error: "Security verification is temporarily unavailable." }, { status: 503 });
    if (error instanceof PasswordResetEmailUnavailableError) return Response.json({ error: "Password reset email is temporarily unavailable." }, { status: 503 });
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Password reset could not be requested right now." }, { status: 500 });
  }
}
