import { DEFAULT_AVATAR_LOADOUT, normalizeAvatarLoadout, normalizeFavouriteTcgs, type AvatarRecord, type AvatarLoadout, type FavouriteTcg } from "@/lib/avatar-loadout";
import { fateDropPostgres } from "@/lib/postgres";

export class AvatarStorageUnavailableError extends Error {
  constructor(message = "Avatar storage is not ready.") {
    super(message);
    this.name = "AvatarStorageUnavailableError";
  }
}

type FileAvatarState = {
  version: 1;
  avatars: AvatarRecord[];
};

const emptyFileState = (): FileAvatarState => ({ version: 1, avatars: [] });
let fileQueue: Promise<unknown> = Promise.resolve();

function storageMode() {
  return process.env.FATEDROP_ACCOUNT_STORE ?? (process.env.NODE_ENV === "development" ? "file" : "disabled");
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
  const mode = storageMode();
  if (mode === "postgres") {
    try {
      const sql = await fateDropPostgres();
      const rows = await sql`SELECT * FROM fatedrop_user_avatars WHERE user_id=${userId} LIMIT 1`;
      return rows[0] ? mapRecord(rows[0] as Record<string, unknown>) : null;
    } catch (error) {
      if (missingRelation(error)) return null;
      throw error;
    }
  }
  if (mode === "file") {
    const state = await readFileState();
    return state.avatars.find((item) => item.userId === userId) ?? null;
  }
  throw new AvatarStorageUnavailableError();
}

export async function saveUserAvatar(userId: string, loadout: AvatarLoadout, favouriteTcgs: FavouriteTcg[], updatedAt = Math.floor(Date.now() / 1000)) {
  const mode = storageMode();
  if (mode === "postgres") {
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
  if (mode === "file") {
    return withFileWrite(async (state) => {
      const record: AvatarRecord = { userId, loadout, favouriteTcgs, updatedAt };
      const index = state.avatars.findIndex((item) => item.userId === userId);
      if (index >= 0) state.avatars[index] = record;
      else state.avatars.push(record);
      return record;
    });
  }
  throw new AvatarStorageUnavailableError();
}

export function defaultAvatarRecord(userId: string): AvatarRecord {
  return { userId, loadout: DEFAULT_AVATAR_LOADOUT, favouriteTcgs: [], updatedAt: 0 };
}

async function avatarFilePath() {
  const path = await import("node:path");
  return process.env.FATEDROP_AVATAR_FILE ?? path.join(process.cwd(), "data", "fatedrop-avatars.json");
}

async function readFileState(): Promise<FileAvatarState> {
  const fs = await import("node:fs/promises");
  const file = await avatarFilePath();
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8")) as Partial<FileAvatarState>;
    return {
      version: 1,
      avatars: Array.isArray(parsed.avatars)
        ? parsed.avatars.map((item) => ({
            userId: String(item.userId),
            loadout: normalizeAvatarLoadout(item.loadout),
            favouriteTcgs: normalizeFavouriteTcgs(item.favouriteTcgs),
            updatedAt: Number(item.updatedAt) || 0,
          }))
        : [],
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return emptyFileState();
    if (error instanceof SyntaxError) throw new AvatarStorageUnavailableError("Companion storage file is invalid.");
    throw error;
  }
}

async function withFileWrite<T>(mutate: (state: FileAvatarState) => Promise<T> | T): Promise<T> {
  const task = fileQueue.then(async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = await avatarFilePath();
    const state = await readFileState();
    const result = await mutate(state);
    await fs.mkdir(path.dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    await fs.rename(temporary, file);
    return result;
  });
  fileQueue = task.then(() => undefined, () => undefined);
  return task;
}
