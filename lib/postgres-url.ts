export function getPostgresUrl() {
  const value = process.env.DATABASE_URL?.trim();
  return value || null;
}
