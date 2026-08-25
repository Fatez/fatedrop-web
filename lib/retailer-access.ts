import { fateDropPostgres } from "@/lib/postgres";
import { retailerRegistry, type RetailerRecord } from "@/lib/retailer-registry";

export type RetailerWorkspaceAccess = {
  userId: string;
  retailerId: string;
  role: "owner" | "manager" | "analyst";
  verifiedAt: number;
  retailer: RetailerRecord;
  preview: boolean;
};

function retailerById(retailerId: string) {
  return retailerRegistry.find((retailer) => retailer.id === retailerId) ?? null;
}

function role(value: unknown): RetailerWorkspaceAccess["role"] {
  return value === "manager" || value === "analyst" ? value : "owner";
}

export function retailerStoreKey(retailer: RetailerRecord) {
  try { return new URL(retailer.website).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return retailer.id; }
}

export async function listRetailerWorkspaceAccess(userId: string): Promise<RetailerWorkspaceAccess[]> {
  const sql = await fateDropPostgres();
  const rows = await sql`
    SELECT user_id, retailer_id, role, verified_at
    FROM fatedrop_retailer_access
    WHERE user_id=${userId} AND verified_at IS NOT NULL
    ORDER BY verified_at ASC
  `;
  return rows.flatMap((row) => {
    const record = row as Record<string, unknown>;
    const retailerId = String(record.retailer_id ?? "");
    const retailer = retailerById(retailerId);
    const verifiedAt = Number(record.verified_at);
    return retailer && Number.isFinite(verifiedAt)
      ? [{ userId, retailerId, role: role(record.role), verifiedAt, retailer, preview: false }]
      : [];
  });
}

export async function resolveRetailerWorkspace(userId: string, requestedRetailerId?: string | null): Promise<RetailerWorkspaceAccess | null> {
  const requested = requestedRetailerId?.trim() || null;

  // Local beta inspection can preview a known Indie workspace without creating a
  // production ownership record. This path is deliberately unavailable in production.
  if (process.env.NODE_ENV !== "production" && requested) {
    const retailer = retailerById(requested);
    if (retailer?.category === "indie") {
      return { userId, retailerId: retailer.id, role: "owner", verifiedAt: Math.floor(Date.now() / 1000), retailer, preview: true };
    }
  }

  const access = await listRetailerWorkspaceAccess(userId);
  if (!access.length) return null;
  if (!requested) return access[0] ?? null;
  return access.find((entry) => entry.retailerId === requested) ?? null;
}
