import { createHash, randomBytes } from "node:crypto";

import { fateDropPostgres } from "@/lib/postgres";

const DEFAULT_TTL_SECONDS = 30;

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export async function mintFateFindEvaluationCapability(fateFindId: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const cleanId = fateFindId.trim();
  if (!cleanId) throw new Error("A FateFind ID is required to mint an evaluation capability.");

  const token = randomBytes(32).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + Math.max(5, Math.min(120, Math.floor(ttlSeconds)));
  const sql = await fateDropPostgres();
  await sql`
    INSERT INTO fatedrop_fatefind_evaluation_capabilities (
      token_hash, fate_find_id, expires_at, created_at
    ) VALUES (
      ${sha256(token)}, ${cleanId}, ${expiresAt}, ${now}
    )`;

  return token;
}
