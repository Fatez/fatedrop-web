import { AccountStorageUnavailableError, findAccountByEmail } from "@/lib/account-storage";
import { assertSameOrigin, startSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const payload = await request.json() as Record<string, unknown>;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const account = email ? await findAccountByEmail(email) : null;
    const valid = account ? await verifyPassword(password, account.passwordHash) : false;
    if (!account || !valid) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    await startSession(account.id);
    return Response.json({ authenticated: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    return Response.json({ error: "Sign-in could not be completed." }, { status: 500 });
  }
}
