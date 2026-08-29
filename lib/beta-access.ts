import { fateDropPostgres } from "@/lib/postgres";

export type BetaAccessStatus = "pending" | "approved" | "revoked";

export type BetaAccessSnapshot = {
  status: BetaAccessStatus;
  approved: boolean;
  requestedAt: number | null;
  approvedAt: number | null;
  approvedBy: string | null;
  updatedAt: number | null;
};

export function pendingBetaAccess(): BetaAccessSnapshot {
  return {
    status: "pending",
    approved: false,
    requestedAt: null,
    approvedAt: null,
    approvedBy: null,
    updatedAt: null,
  };
}

export function betaAccessIsApproved(access: BetaAccessSnapshot | null | undefined) {
  return access?.status === "approved" && access.approved === true;
}

export async function getBetaAccess(userId: string): Promise<BetaAccessSnapshot> {
  const cleanUserId = userId.trim();
  if (!cleanUserId) return pendingBetaAccess();

  try {
    const sql = await fateDropPostgres();
    const rows = await sql`
      SELECT status, requested_at, approved_at, approved_by, updated_at
      FROM fatedrop_beta_access
      WHERE user_id = ${cleanUserId}
      LIMIT 1
    `;
    if (!rows[0]) return pendingBetaAccess();
    const status = String(rows[0].status || "pending") as BetaAccessStatus;
    if (status !== "pending" && status !== "approved" && status !== "revoked") return pendingBetaAccess();
    return {
      status,
      approved: status === "approved",
      requestedAt: nullableNumber(rows[0].requested_at),
      approvedAt: nullableNumber(rows[0].approved_at),
      approvedBy: nullableString(rows[0].approved_by),
      updatedAt: nullableNumber(rows[0].updated_at),
    };
  } catch {
    // Closed beta is fail-closed. Missing/unavailable approval storage must never
    // turn a normal account or paid membership into beta access.
    return pendingBetaAccess();
  }
}

export function betaAccessDeniedResponse(access: BetaAccessSnapshot) {
  return Response.json({
    error: access.status === "revoked" ? "Beta access has been revoked." : "Beta access is pending approval.",
    code: access.status === "revoked" ? "BETA_REVOKED" : "BETA_PENDING",
    betaAccess: access,
  }, { status: 403, headers: { "cache-control": "private, no-store, max-age=0" } });
}

function nullableString(value: unknown) {
  return value === null || value === undefined ? null : String(value);
}

function nullableNumber(value: unknown) {
  return value === null || value === undefined ? null : Number(value);
}
