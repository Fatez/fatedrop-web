import { authRateLimitResponse, checkAuthRateLimit, isRequestTooLargeError, readBoundedJson } from "@/lib/auth-abuse";
import { assertSameOrigin, hashPassword } from "@/lib/auth";
import { completePasswordReset, validResetTokenShape } from "@/lib/password-reset";
import { assertTurnstile, TurnstileRejectedError, TurnstileUnavailableError } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const rateLimit = checkAuthRateLimit(request, "password_reset_complete");
    if (!rateLimit.allowed) return authRateLimitResponse(rateLimit);

    const payload = await readBoundedJson(request);
    const token = typeof payload.token === "string" ? payload.token.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const confirmPassword = typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

    const fields: Record<string, string> = {};
    if (!validResetTokenShape(token)) fields.token = "This password reset link is invalid or incomplete.";
    if (password.length < 10) fields.password = "Use at least 10 characters.";
    if (password.length > 200) fields.password = "Password is longer than expected.";
    if (!confirmPassword) fields.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password) fields.confirmPassword = "Passwords do not match.";
    if (Object.keys(fields).length) return Response.json({ error: "Check the highlighted fields.", fields }, { status: 400 });

    await assertTurnstile(request, payload.turnstileToken, "password_reset_complete");
    const userId = await completePasswordReset(token, await hashPassword(password));
    if (!userId) {
      return Response.json({ error: "This reset link is invalid, expired or has already been used." }, { status: 400 });
    }

    return Response.json({ reset: true }, { status: 200 });
  } catch (error) {
    if (isRequestTooLargeError(error)) return Response.json({ error: "Request is too large." }, { status: 413 });
    if (error instanceof TurnstileRejectedError) return Response.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    if (error instanceof TurnstileUnavailableError) return Response.json({ error: "Security verification is temporarily unavailable." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Password reset could not be completed right now." }, { status: 500 });
  }
}
