export type FateLockAllocationState = "open" | "closed" | "exhausted";
export type FateLockReservationState = "reserved" | "claimed" | "released" | "completed" | "cancelled" | "expired";

export type FateLockAllocation = {
  id: string;
  retailerId: string;
  locationId: string | null;
  productIdentityId: string;
  quantityAllocated: number;
  quantityReserved: number;
  perUserLimit: number;
  state: FateLockAllocationState;
  opensAt: number | null;
  closesAt: number | null;
};

export type FateLockReservation = {
  id: string;
  allocationId: string;
  userId: string;
  quantity: number;
  state: FateLockReservationState;
  idempotencyKey: string;
  reservedAt: number;
  expiresAt: number;
};

export type ReservationDecision = { allowed: true } | { allowed: false; reason: string };

export function availableAllocationUnits(allocation: FateLockAllocation) {
  return Math.max(0, allocation.quantityAllocated - allocation.quantityReserved);
}

export function canCreateReservation(allocation: FateLockAllocation, existing: FateLockReservation[], userId: string, requestedQuantity: number, now: number): ReservationDecision {
  if (allocation.state !== "open") return { allowed: false, reason: "Allocation is not open" };
  if (allocation.opensAt !== null && now < allocation.opensAt) return { allowed: false, reason: "Allocation has not opened" };
  if (allocation.closesAt !== null && now >= allocation.closesAt) return { allowed: false, reason: "Allocation has closed" };
  if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) return { allowed: false, reason: "Quantity must be a positive integer" };
  const activeUserQuantity = existing.filter((item) => item.userId === userId && item.allocationId === allocation.id && (item.state === "reserved" || item.state === "claimed")).reduce((sum, item) => sum + item.quantity, 0);
  if (activeUserQuantity + requestedQuantity > allocation.perUserLimit) return { allowed: false, reason: "Per-user allocation limit exceeded" };
  if (requestedQuantity > availableAllocationUnits(allocation)) return { allowed: false, reason: "Insufficient allocated stock" };
  return { allowed: true };
}

export function reservationIdempotencyHit(existing: FateLockReservation[], idempotencyKey: string) {
  return existing.find((item) => item.idempotencyKey === idempotencyKey) ?? null;
}

/*
 * These functions validate domain rules only. Real FateLock creation MUST run in
 * one server-side database transaction that row-locks the allocation, checks
 * idempotency/duplicate claims, increments reserved stock atomically and writes
 * an audit event. Never advertise a reservation from client-side state alone.
 */
