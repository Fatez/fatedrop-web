import type { NeonQueryFunction } from "@neondatabase/serverless";

export type LeadRole = "collector" | "business" | "event";

export type LeadRecord = {
  id: string;
  role: LeadRole;
  email: string;
  contactName: string;
  region: string | null;
  primaryTcg: string | null;
  wantedFeature: string | null;
  businessName: string | null;
  website: string | null;
  ecommercePlatform: string | null;
  productCount: string | null;
  businessType: string | null;
  catalogueMethod: string | null;
  attendsEvents: string | null;
  eventName: string | null;
  eventLocation: string | null;
  eventDate: string | null;
  vendorCount: string | null;
  ticketLink: string | null;
  eventVendorMode: boolean;
  message: string | null;
  contactConsent: boolean;
  marketingConsent: boolean;
  source: "website";
  createdAt: number;
};

export class DuplicateLeadError extends Error {
  constructor() {
    super("This email is already registered for that FateDrop journey.");
    this.name = "DuplicateLeadError";
  }
}

export class LeadStorageUnavailableError extends Error {
  constructor(message = "Lead storage is not configured.") {
    super(message);
    this.name = "LeadStorageUnavailableError";
  }
}

let fileWriteQueue: Promise<void> = Promise.resolve();

function storageMode() {
  if (process.env.FATEDROP_LEAD_STORE) return process.env.FATEDROP_LEAD_STORE;
  if (process.env.NODE_ENV === "development") return "file";
  if (process.env.DATABASE_URL) return "postgres";
  return "disabled";
}

export async function storeLead(record: LeadRecord) {
  const mode = storageMode();

  if (mode === "postgres") {
    await storeInPostgres(record);
    return;
  }

  if (mode === "file") {
    const operation = fileWriteQueue.then(() => storeInFile(record));
    fileWriteQueue = operation.catch(() => undefined);
    await operation;
    return;
  }

  throw new LeadStorageUnavailableError(
    "Set FATEDROP_LEAD_STORE to file for local development or postgres for hosted storage.",
  );
}

async function storeInPostgres(record: LeadRecord) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new LeadStorageUnavailableError("DATABASE_URL is required for PostgreSQL lead storage.");

  const { neon } = await import("@neondatabase/serverless");
  const sql: NeonQueryFunction<false, false> = neon(connectionString);

  try {
    await sql`
      INSERT INTO beta_leads (
        id, role, email, contact_name, region, primary_tcg, wanted_feature,
        business_name, website, ecommerce_platform, product_count, business_type,
        catalogue_method, attends_events, event_name, event_location, event_date,
        vendor_count, ticket_link, event_vendor_mode, message, contact_consent,
        marketing_consent, source, created_at
      ) VALUES (
        ${record.id}, ${record.role}, ${record.email}, ${record.contactName}, ${record.region},
        ${record.primaryTcg}, ${record.wantedFeature}, ${record.businessName}, ${record.website},
        ${record.ecommercePlatform}, ${record.productCount}, ${record.businessType},
        ${record.catalogueMethod}, ${record.attendsEvents}, ${record.eventName},
        ${record.eventLocation}, ${record.eventDate}, ${record.vendorCount}, ${record.ticketLink},
        ${record.eventVendorMode}, ${record.message}, ${record.contactConsent},
        ${record.marketingConsent}, ${record.source}, ${record.createdAt}
      )
    `;
  } catch (error) {
    if (isPostgresDuplicate(error)) throw new DuplicateLeadError();
    throw error;
  }
}

async function storeInFile(record: LeadRecord) {
  const [{ mkdir, readFile, appendFile }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const configuredPath = process.env.FATEDROP_LEAD_FILE ?? "data/beta-leads.ndjson";
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
      const existing = JSON.parse(line) as Partial<LeadRecord>;
      if (existing.role === record.role && existing.email === record.email) throw new DuplicateLeadError();
    } catch (error) {
      if (error instanceof DuplicateLeadError) throw error;
      // Ignore a malformed historical line rather than discarding a valid new enquiry.
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
