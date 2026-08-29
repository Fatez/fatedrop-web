import { fateDropPostgres } from "@/lib/postgres";
import type { BetaAccessStatus } from "@/lib/beta-access";

export type OwnerRoleSnapshot = {
  userId: string;
  role: "owner";
  grantedAt: number;
  grantedBy: string;
};

export type BetaRequestRow = {
  userId: string;
  fateId: string;
  email: string;
  displayName: string;
  username: string;
  status: BetaAccessStatus;
  requestedAt: number;
  approvedAt: number | null;
  approvedBy: string | null;
  updatedAt: number;
};

export async function getOwnerRole(userId: string): Promise<OwnerRoleSnapshot | null> {
  const cleanUserId = userId.trim();
  if (!cleanUserId) return null;
  try {
    const sql = await fateDropPostgres();
    const rows = await sql`
      SELECT user_id, role, granted_at, granted_by
      FROM fatedrop_admin_roles
      WHERE user_id = ${cleanUserId} AND role = 'owner'
      LIMIT 1
    `;
    const row = rows[0];
    if (!row || String(row.role) !== "owner") return null;
    return {
      userId: String(row.user_id),
      role: "owner",
      grantedAt: Number(row.granted_at),
      grantedBy: String(row.granted_by),
    };
  } catch {
    // Administrative authority always fails closed if its canonical storage is
    // missing or unavailable. Email strings, membership and beta access never
    // imply Owner authority.
    return null;
  }
}

export async function isOwnerUser(userId: string) {
  return Boolean(await getOwnerRole(userId));
}

export async function listBetaRequestsForOwner(ownerUserId: string): Promise<BetaRequestRow[]> {
  if (!await isOwnerUser(ownerUserId)) throw new Error("OWNER_REQUIRED");
  const sql = await fateDropPostgres();
  const rows = await sql`
    SELECT
      u.id AS user_id,
      u.fate_id,
      u.email,
      u.display_name,
      u.username,
      b.status,
      b.requested_at,
      b.approved_at,
      b.approved_by,
      b.updated_at
    FROM fatedrop_beta_access b
    JOIN fatedrop_users u ON u.id = b.user_id
    ORDER BY
      CASE b.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
      b.requested_at DESC
    LIMIT 500
  `;
  return rows.map((row) => ({
    userId: String(row.user_id),
    fateId: String(row.fate_id),
    email: String(row.email),
    displayName: String(row.display_name),
    username: String(row.username),
    status: normalizeStatus(row.status),
    requestedAt: Number(row.requested_at),
    approvedAt: row.approved_at === null || row.approved_at === undefined ? null : Number(row.approved_at),
    approvedBy: row.approved_by === null || row.approved_by === undefined ? null : String(row.approved_by),
    updatedAt: Number(row.updated_at),
  }));
}

export async function setBetaAccessAsOwner(ownerUserId: string, targetUserId: string, status: "approved" | "revoked") {
  const owner = await getOwnerRole(ownerUserId);
  if (!owner) throw new Error("OWNER_REQUIRED");
  const cleanTarget = targetUserId.trim();
  if (!cleanTarget) throw new Error("TARGET_REQUIRED");
  if (cleanTarget === ownerUserId) throw new Error("OWNER_SELF_CHANGE_BLOCKED");

  const sql = await fateDropPostgres();
  const operator = `owner:${ownerUserId}`;
  const rows = await sql`
    SELECT user_id, status, requested_at, approved_at, approved_by, updated_at
    FROM fatedrop_set_beta_access(${cleanTarget}, ${status}, ${operator})
  `;
  const row = rows[0];
  if (!row) throw new Error("BETA_ACCESS_UPDATE_FAILED");
  return {
    userId: String(row.user_id),
    status: normalizeStatus(row.status),
    requestedAt: Number(row.requested_at),
    approvedAt: row.approved_at === null || row.approved_at === undefined ? null : Number(row.approved_at),
    approvedBy: row.approved_by === null || row.approved_by === undefined ? null : String(row.approved_by),
    updatedAt: Number(row.updated_at),
  };
}

function normalizeStatus(value: unknown): BetaAccessStatus {
  const status = String(value || "pending");
  return status === "approved" || status === "revoked" ? status : "pending";
}
