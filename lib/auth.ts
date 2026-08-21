import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { createSession, deleteSession, findSessionUser, getAccountSnapshot } from "./account-storage";

const scrypt = promisify(nodeScrypt);
const COOKIE_NAME = "fd_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, saltValue, hashValue] = stored.split("$");
  if (algorithm !== "scrypt" || !saltValue || !hashValue) return false;
  const salt = Buffer.from(saltValue, "base64url");
  const expected = Buffer.from(hashValue, "base64url");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function createOpaqueSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  await createSession(hashSessionToken(token), userId, expiresAt);
  return { token, expiresAt };
}

export async function startSession(userId: string) {
  const session = await createOpaqueSession(userId);
  const jar = await cookies();
  jar.set(COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

// Mobile/API clients receive the opaque token once and must present it as a
// Bearer token. Only its SHA-256 hash is stored in the sessions table.
export async function startApiSession(userId: string) {
  return createOpaqueSession(userId);
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await deleteSession(hashSessionToken(token));
  jar.delete(COOKIE_NAME);
}

export async function endApiSession(token: string) {
  if (token) await deleteSession(hashSessionToken(token));
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return findSessionUser(hashSessionToken(token));
}

export async function getCurrentSnapshot() {
  const account = await getCurrentUser();
  if (!account) return null;
  return getAccountSnapshot(account.id);
}

export async function getSnapshotForRequest(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (match?.[1]) {
    const account = await findSessionUser(hashSessionToken(match[1]));
    return account ? getAccountSnapshot(account.id) : null;
  }
  return getCurrentSnapshot();
}

export function bearerTokenFromRequest(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.match(/^Bearer\s+([^\s]+)$/i)?.[1] || null;
}

export function assertSameOrigin(request: Request) {
  if (process.env.NODE_ENV !== "production") return;

  // Modern browsers provide Sec-Fetch-Site even when an Origin header is
  // absent. Reject an explicitly cross-site browser mutation before falling
  // back to the existing Origin/forwarded-host checks. Native bearer clients
  // do not normally send this browser metadata and continue through safely.
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") throw new Error("CROSS_ORIGIN");

  const origin = request.headers.get("origin");
  if (!origin) return;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new Error("CROSS_ORIGIN");
  }

  const requestUrl = new URL(request.url);
  if (originUrl.origin === requestUrl.origin) return;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const effectiveHost = forwardedHost || request.headers.get("host");
  const effectiveProto = forwardedProto || requestUrl.protocol.replace(":", "");

  if (effectiveHost && originUrl.host === effectiveHost && originUrl.protocol === `${effectiveProto}:`) return;

  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSite) {
    try {
      if (originUrl.origin === new URL(configuredSite).origin) return;
    } catch {
      // Ignore malformed configuration and keep rejecting the request.
    }
  }

  throw new Error("CROSS_ORIGIN");
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
