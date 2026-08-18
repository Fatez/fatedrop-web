import { fateDropPostgres } from "@/lib/postgres";

export type CreateReservationInput = {
  reservationId: string;
  allocationId: string;
  userId: string;
  quantity: number;
  idempotencyKey: string;
  reservedAt: number;
  expiresAt: number;
};

export async function createAtomicFateLockReservation(input: CreateReservationInput) {
  const sql = await fateDropPostgres();
  const rows = await sql`SELECT * FROM fatedrop_create_reservation(
    ${input.reservationId},${input.allocationId},${input.userId},${input.quantity},${input.idempotencyKey},${input.reservedAt},${input.expiresAt}
  )`;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? { reservationId: String(row.reservation_id), state: String(row.reservation_state), created: Boolean(row.created) } : null;
}

// Intentionally no public route yet. FateLock remains unavailable until a retailer
// has explicitly allocated real stock and operational expiry/release handling exists.
