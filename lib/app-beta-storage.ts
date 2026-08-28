import type { NeonQueryFunction } from "@neondatabase/serverless";

export type AppBetaDevice = "iphone" | "ipad" | "android" | "other";

export type AppBetaLeadRecord = {
  id: string;
  email: string;
  contactName: string;
  deviceType: AppBetaDevice;
  contactConsent: boolean;
  marketingConsent: boolean;
  source: "app-beta-page";
  createdAt: number;
};

export class DuplicateAppBetaLeadError extends Error {
  constructor() {
    super("This email is already on the FateDrop App Beta list.");
    this.name = "DuplicateAppBetaLeadError";
  }
}

export class AppBetaStorageUnavailableError extends Error {
  constructor(message = "App beta storage is not configured.") {
    super(message);
    this.name = "AppBetaStorageUnavailableError";
  }
}

let fileWriteQueue: Promise<void> = Promise.resolve();

function storageMode() {
  if (process.env.FATEDROP_APP_BETA_STORE) return process.env.FATEDROP_APP_BETA_STORE;
  if (process.env.FATEDROP_LEAD_STORE) return process.env.FATEDROP_LEAD_STORE;
  if (process.env.NODE_ENV === "development") return "file";
  if (process.env.DATABASE_URL) return "postgres";
  return "disabled";
}

export async function storeAppBetaLead(record: AppBetaLeadRecord) {
  const mode = storageMode();
  if (mode === "postgres") return storeInPostgres(record);
  if (mode === "file") {
    const operation = fileWriteQueue.then(() => storeInFile(record));
    fileWriteQueue = operation.catch(() => undefined);
    return operation;
  }
  throw new AppBetaStorageUnavailableError(
    "Set FATEDROP_APP_BETA_STORE to file for local development or postgres for hosted storage.",
  );
}

async function storeInPostgres(record: AppBetaLeadRecord) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new AppBetaStorageUnavailableError("DATABASE_URL is required for PostgreSQL App beta storage.");

  const { neon } = await import("@neondatabase/serverless");
  const sql: NeonQueryFunction<false, false> = neon(connectionString);
  try {
    await sql`
      INSERT INTO app_beta_leads (
        id,email,contact_name,device_type,contact_consent,marketing_consent,source,created_at
      ) VALUES (
        ${record.id},${record.email},${record.contactName},${record.deviceType},
        ${record.contactConsent},${record.marketingConsent},${record.source},${record.createdAt}
      )
    `;
  } catch (error) {
    if (isPostgresDuplicate(error)) throw new DuplicateAppBetaLeadError();
    throw error;
  }
}

async function storeInFile(record: AppBetaLeadRecord) {
  const [{ mkdir, readFile, appendFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const configuredPath = process.env.FATEDROP_APP_BETA_FILE ?? "data/app-beta-leads.ndjson";
  const filePath = path.resolve(process.cwd(), configuredPath);
  await mkdir(path.dirname(filePath), { recursive: true });

  let contents = "";
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (!isMissingFile(error)) throw error;
  }

  for (const line of contents.split("\n")) {
    if (!line.trim()) continue;
    try {
      const existing = JSON.parse(line) as Partial<AppBetaLeadRecord>;
      if (existing.email === record.email) throw new DuplicateAppBetaLeadError();
    } catch (error) {
      if (error instanceof DuplicateAppBetaLeadError) throw error;
    }
  }

  await appendFile(filePath, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
}

function isMissingFile(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

function isPostgresDuplicate(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}
