import type { NeonQueryFunction } from "@neondatabase/serverless";

export async function fateDropPostgres(): Promise<NeonQueryFunction<false, false>> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for FateDrop PostgreSQL storage.");
  const { neon } = await import("@neondatabase/serverless");
  return neon(connectionString);
}
