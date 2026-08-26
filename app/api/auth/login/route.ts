import { AccountStorageUnavailableError, findAccountByEmail } from "@/lib/account-storage";
import { AuthRequestBodyError, authRateLimitResponse, checkAuthRateLimit, readAuthJsonBody } from "@/lib/auth-abuse";
import { assertSameOrigin, startSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

// Used only to keep the password-verification cost comparable when an email
// does not exist. It is not a credential for any FateDrop account.
const DUMMY_PASSWORD_HASH = "scrypt$RmF0ZURyb3BEdW1teUF1dA$qvqAWevSi_CMRrPK7ii7ARkJ0qQSqn4hrYEEwTP_yScpuzFnfdgLOS8kIm_MiO7DjyttR56YMHfPE3pFhfYA7w";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = checkAuthRateLimit(request, "login");
    if (!limit.allowed) return authRateLimitResponse(limit);

    const payload = await readAuthJsonBody(request);
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof payload.password === "string" ? payload.password.slice(0, 200) : "";
    const account = email ? await findAccountByEmail(email) : null;
    const valid = await verifyPassword(password, account?.passwordHash || DUMMY_PASSWORD_HASH);
    if (!account || !valid) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    await startSession(account.id);
    return Response.json({ authenticated: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthRequestBodyError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Sign-in could not be completed." }, { status: 500 });
  }
}
