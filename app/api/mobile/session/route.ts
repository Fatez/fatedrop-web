import { AccountStorageUnavailableError, findAccountByEmail } from "@/lib/account-storage";
import { authRateLimitResponse, checkAuthRateLimit, isRequestTooLargeError, readBoundedJson } from "@/lib/auth-abuse";
import { bearerTokenFromRequest, endApiSession, getSnapshotForRequest, startApiSession, verifyLoginPassword } from "@/lib/auth";
import { betaAccessIsApproved } from "@/lib/beta-access";
import { capabilitiesForMembership, effectiveTier, membershipIsActive } from "@/lib/entitlements";
import { normalizeSelectedTcgCodes, normalizeTcgAlertPreferences } from "@/lib/tcg-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sessionPayload(snapshot: NonNullable<Awaited<ReturnType<typeof getSnapshotForRequest>>>) {
  const betaApproved = betaAccessIsApproved(snapshot.betaAccess);
  return {
    contractVersion: 2,
    accessAllowed: betaApproved,
    betaAccess: snapshot.betaAccess,
    user: {
      id: snapshot.account.id,
      fateId: snapshot.account.fateId,
      email: snapshot.account.email,
      handle: snapshot.account.username,
      displayName: snapshot.account.displayName,
      createdAt: snapshot.account.createdAt,
    },
    tcgPreferences: {
      selectedTcgCodes: normalizeSelectedTcgCodes(snapshot.account.selectedTcgCodes),
      onboardingCompleted: snapshot.account.tcgOnboardingCompleted === true,
      alertPreferences: normalizeTcgAlertPreferences(snapshot.account.tcgAlertPreferences,normalizeSelectedTcgCodes(snapshot.account.selectedTcgCodes)),
    },
    membership: {
      configuredTier: snapshot.membership.tier,
      effectiveTier: effectiveTier(snapshot.membership),
      status: snapshot.membership.status,
      active: membershipIsActive(snapshot.membership),
      capabilities: betaApproved ? [...capabilitiesForMembership(snapshot.membership)].sort() : [],
      trialEndsAt: snapshot.membership.trialEndsAt,
      currentPeriodEnd: snapshot.membership.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.membership.cancelAtPeriodEnd,
      updatedAt: snapshot.membership.updatedAt,
    },
  };
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkAuthRateLimit(request, "mobile_login");
    if (!rateLimit.allowed) return authRateLimitResponse(rateLimit);

    const payload = await readBoundedJson(request);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
    const password = typeof payload?.password === "string" && payload.password.length <= 200 ? payload.password : "";
    if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400, headers: { "cache-control": "no-store" } });
    const account = await findAccountByEmail(email);
    const valid = await verifyLoginPassword(password, account?.passwordHash);
    if (!account || !valid) return Response.json({ error: "Email or password is incorrect." }, { status: 401, headers: { "cache-control": "no-store" } });
    const session = await startApiSession(account.id);
    const snapshot = await getSnapshotForRequest(
      new Request(request.url, { headers: { authorization: `Bearer ${session.token}` } }),
      { allowPending: true },
    );
    if (!snapshot) throw new Error("SESSION_NOT_FOUND");
    return Response.json({ sessionToken: session.token, expiresAt: session.expiresAt, ...sessionPayload(snapshot) }, { headers: { "cache-control": "private, no-store, max-age=0" } });
  } catch (error) {
    if (isRequestTooLargeError(error)) return Response.json({ error: "Request is too large." }, { status: 413, headers: { "cache-control": "no-store" } });
    if (error instanceof SyntaxError) return Response.json({ error: "Invalid request." }, { status: 400, headers: { "cache-control": "no-store" } });
    if (error instanceof AccountStorageUnavailableError) return Response.json({ error: "Account storage is not configured yet." }, { status: 503 });
    return Response.json({ error: "Mobile sign-in could not be completed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const snapshot = await getSnapshotForRequest(request, { allowPending: true });
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
