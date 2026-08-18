# ChatGPT Sites migration notes

This repository is a standalone copy of the FateDrop website source. The visible application—routes, components, copy, CSS, responsive rules, assets and interactive product preview—was retained without redesign.

## Removed platform plumbing

The following files belonged to the ChatGPT Sites build and deployment environment rather than the website itself, so they are intentionally not part of this project:

- `.openai/hosting.json`
- the Vinext/Vite Cloudflare build configuration
- the Sites artifact validator and lifecycle scripts
- the generated Cloudflare Worker entry point
- the unused ChatGPT dispatch authentication helper

Removing them does not remove a visible route or browser interaction. Standard Next.js now owns development, production builds and serving.

## Lead storage

The Sites version wrote beta enquiries to a Sites-managed Cloudflare D1 binding named `DB`. That managed database and its data cannot be embedded in a Git repository.

The standalone project therefore provides two explicit storage modes:

1. `file` writes validated local-development submissions to an ignored NDJSON file.
2. `postgres` writes to a managed PostgreSQL database using `DATABASE_URL` and the schema in `database/postgres.sql`.

If neither mode is configured, the API returns an honest `503` and tells the visitor that nothing was saved. It never displays a fake success state.

The original D1 table definition is retained in `database/cloudflare-d1.sql`. To reuse D1 when hosting on Cloudflare, implement a D1 branch in `lib/lead-storage.ts` using the runtime binding supplied by the chosen Cloudflare Next.js adapter.

## URLs and metadata

The canonical URL, Open Graph base URL, robots sitemap URL and generated sitemap now read from `NEXT_PUBLIC_SITE_URL`. This avoids hard-coding the old ChatGPT Sites domain in an independently deployed repository.

## What was not migrated

- No private D1 records or credentials were copied.
- No ChatGPT Sites project identifiers or access tokens were copied.
- No deployment was created as part of this export.
