const PRODUCTION_FALLBACK = "https://fatedrop-web.fatedrop-web.workers.dev";
const DEVELOPMENT_FALLBACK = "http://localhost:3000";

export function canonicalSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = process.env.NODE_ENV === "production" ? PRODUCTION_FALLBACK : DEVELOPMENT_FALLBACK;
  return (configured || fallback).replace(/\/$/, "");
}
