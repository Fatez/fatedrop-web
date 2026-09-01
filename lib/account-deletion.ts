import { fateDropPostgres } from "@/lib/postgres";

export type AccountDeletionRequest = {
  userId: string;
  status: "pending" | "processing";
  source: string;
  requestedAt: number;
  updatedAt: number;
};

export async function requestAccountDeletion(userId: string, source = "mobile_app"): Promise<AccountDeletionRequest> {
  const canonicalUserId = String(userId || "").trim();
  if (!canonicalUserId) throw new Error("Authenticated FateDrop user is required.");

  const now = Math.floor(Date.now() / 1000);
  const sql = await fateDropPostgres();
  const rows = await sql`
    INSERT INTO fatedrop_account_deletion_requests (
      user_id,status,source,requested_at,updated_at
    ) VALUES (
      ${canonicalUserId},'pending',${source},${now},${now}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      status = CASE
        WHEN fatedrop_account_deletion_requests.status IN ('pending','processing')
          THEN fatedrop_account_deletion_requests.status
        ELSE 'pending'
      END,
      source = EXCLUDED.source,
      requested_at = CASE
        WHEN fatedrop_account_deletion_requests.status IN ('pending','processing')
          THEN fatedrop_account_deletion_requests.requested_at
        ELSE EXCLUDED.requested_at
      END,
      updated_at = EXCLUDED.updated_at
    RETURNING user_id,status,source,requested_at,updated_at`;

  const row = rows[0];
  if (!row) throw new Error("Account deletion request could not be recorded.");
  return {
    userId: String(row.user_id),
    status: String(row.status) === "processing" ? "processing" : "pending",
    source: String(row.source),
    requestedAt: Number(row.requested_at),
    updatedAt: Number(row.updated_at),
  };
}
