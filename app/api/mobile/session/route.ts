import { AccountStorageUnavailableError, findAccountByEmail } from "@/lib/account-storage";
import { bearerTokenFromRequest, endApiSession, getSnapshotForRequest, startApiSession, verifyPassword } from "@/lib/auth";
import { capabilitiesForMembership, effectiveTier, membershipIsActive } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sessionPayload(snapshot: NonNullable<Awaited<ReturnType<typeof getSnapshotForRequest>>>) {
  return {
    contractVersion: 1,
    user: {
      id: snapshot.account.id,
      fateId: snapshot.account.fateId,
      email: snapshot.account.email,
      handle: snapshot.account.username,
      displayName: snapshot.account.displayName,
      createdAt: snapshot.account.createdAt,
    },
    membership: {
      configuredTier: snapshot.membership.tier,
      effectiveTier: effectiveTier(snapshot.membership),
      status: snapshot.membership.status,
      active: membershipIsActive(snapshot.membership),
      capabilities: [...capabilitiesForMembership(snapshot.membership)].sort(),
      trialEndsAt: snapshot.membership.trialEndsAt,
      currentPeriodEnd: snapshot.membership.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.membership.cancelAtPeriodEnd,
      updatedAt: snapshot.membership.updatedAt,
    },
  };
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof payload?.password === "string" ? payload.password : "";
    if (!email || !password || password.length > 1024) return Response.json({ error: "Email and password are required." }, { status: 400 });
    const account = await findAccountByEmail(email);
    const valid = account ? await verifyPassword(password, account.passwordHash) : false;
    if (!account || !valid) return Response.json({ error: "Email or password is incorrect." }, { status: 401, headers: { "cache-control": "no-store" } });
    const session = await startApiSession(account.id);
    const snapshot = await getSnapshotForRequest(new Request(request.url, { headers: { authorization: `Bearer ${session.token}` } }));
    if (!snapshot) throw new Error("SESSION_NOT_FOUND");
    return Response.json({ sessionToken: session.token, expiresAt: session.expiresAt, ...sessionPayload(snapshot) }, { headers: { "cache-control": "private, no-store, max-age=0" } });
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    return Response.json({ error: "Mobile sign-in could not be completed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const snapshot = await getSnapshotForRequest(request);
    if (!snapshot) return Response.json({ error: "Authentication required." }, { status: 401, headers: { "cache-control": "no-store" } });
    return Response.json(sessionPayload(snapshot), { headers: { "cache-control": "private, no-store, max-age=0" } });
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    return Response.json({ error: "FateDrop ID could not be loaded." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = bearerTokenFromRequest(request);
  if (!token) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    await endApiSession(token);
    return Response.json({ signedOut: true }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Sign-out could not be completed." }, { status: 500 });
  }
}
