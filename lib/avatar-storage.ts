import { DEFAULT_AVATAR_LOADOUT, normalizeAvatarLoadout, normalizeFavouriteTcgs, type AvatarRecord, type AvatarLoadout, type FavouriteTcg } from "@/lib/avatar-loadout";
import { fateDropPostgres } from "@/lib/postgres";

export class AvatarStorageUnavailableError extends Error {
  constructor(message = "Avatar storage is not ready.") {
    super(message);
    this.name = "AvatarStorageUnavailableError";
  }
}

function missingRelation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "42P01");
}

function mapRecord(row: Record<string, unknown>): AvatarRecord {
  return {
    userId: String(row.user_id),
    loadout: normalizeAvatarLoadout(row.loadout_json),
    favouriteTcgs: normalizeFavouriteTcgs(row.favourite_tcgs_json),
    updatedAt: Number(row.updated_at),
  };
}

export async function getUserAvatar(userId: string): Promise<AvatarRecord | null> {
  try {
    const sql = await fateDropPostgres();
    const rows = await sql`SELECT * FROM fatedrop_user_avatars WHERE user_id=${userId} LIMIT 1`;
    return rows[0] ? mapRecord(rows[0] as Record<string, unknown>) : null;
  } catch (error) {
    if (missingRelation(error)) return null;
    throw error;
  }
}

export async function saveUserAvatar(userId: string, loadout: AvatarLoadout, favouriteTcgs: FavouriteTcg[], updatedAt = Math.floor(Date.now() / 1000)) {
  try {
    const sql = await fateDropPostgres();
    const rows = await sql`INSERT INTO fatedrop_user_avatars (user_id,loadout_json,favourite_tcgs_json,updated_at)
      VALUES (${userId},${JSON.stringify(loadout)}::jsonb,${JSON.stringify(favouriteTcgs)}::jsonb,${updatedAt})
      ON CONFLICT (user_id) DO UPDATE SET loadout_json=EXCLUDED.loadout_json,favourite_tcgs_json=EXCLUDED.favourite_tcgs_json,updated_at=EXCLUDED.updated_at
      RETURNING *`;
    return rows[0] ? mapRecord(rows[0] as Record<string, unknown>) : { userId, loadout, favouriteTcgs, updatedAt };
  } catch (error) {
    if (missingRelation(error)) throw new AvatarStorageUnavailableError();
    throw error;
  }
}

export function defaultAvatarRecord(userId: string): AvatarRecord {
  return { userId, loadout: DEFAULT_AVATAR_LOADOUT, favouriteTcgs: [], updatedAt: 0 };
}
