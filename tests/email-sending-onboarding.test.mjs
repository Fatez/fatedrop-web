import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/onboard-email-sending.yml", import.meta.url), "utf8");

test("Email Sending onboarding is main-only and scoped to its own one-shot workflow change", () => {
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /paths:\s*\n\s*- "\.github\/workflows\/onboard-email-sending\.yml"/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
});

test("Email Sending onboarding uses the existing Cloudflare deployment credentials without exposing them", () => {
  assert.match(workflow, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID: \$\{\{ secrets\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  assert.match(workflow, /Authorization: Bearer \$CLOUDFLARE_API_TOKEN/);
  assert.doesNotMatch(workflow, /echo .*CLOUDFLARE_API_TOKEN/);
});

test("Email Sending onboarding targets only the canonical FateDrop domain and is idempotent", () => {
  assert.match(workflow, /FATEDROP_EMAIL_DOMAIN: fatedrop\.co\.uk/);
  assert.match(workflow, /email\/sending\/subdomains/);
  assert.match(workflow, /entry\?\.name === process\.env\.FATEDROP_EMAIL_DOMAIN && entry\?\.enabled === true/);
  assert.match(workflow, /JSON\.stringify\(\{name: process\.env\.FATEDROP_EMAIL_DOMAIN\}\)/);
  assert.match(workflow, /payload\.result\?\.enabled !== true/);
});

test("Email Sending onboarding verifies Cloudflare returned the expected DNS record set", () => {
  assert.match(workflow, /email\/sending\/subdomains\/\$existing_tag\/dns/);
  assert.match(workflow, /payload\.result\.length < 3/);
});
