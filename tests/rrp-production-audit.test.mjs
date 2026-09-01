import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const route = fs.readFileSync(new URL("../app/api/health/rrp-audit/route.ts", import.meta.url), "utf8");
const workflow = fs.readFileSync(new URL("../.github/workflows/audit-rrp-production.yml", import.meta.url), "utf8");

test("RRP production audit is read-only and keeps detailed candidates protected", () => {
  assert.match(route, /export async function GET\(request: Request\)/);
  assert.match(route, /FATEDROP_RRP_AUDIT_SECRET/);
  assert.doesNotMatch(route, /FATEDROP_PUSH_CRON_SECRET/);
  assert.match(route, /Detailed RRP audit is not authorised/);
  assert.match(route, /status: 401/);
  assert.match(route, /FROM fatedrop_product_identities/);
  assert.match(route, /LEFT JOIN fatedrop_offers/);
  assert.doesNotMatch(route, /INSERT\s+INTO\s+fatedrop_product_identities/i);
  assert.doesNotMatch(route, /UPDATE\s+fatedrop_product_identities/i);
  assert.doesNotMatch(route, /DELETE\s+FROM\s+fatedrop_product_identities/i);
  assert.doesNotMatch(route, /ALTER\s+TABLE\s+fatedrop_product_identities/i);
});

test("RRP audit defines verified reference independently from observed offer price", () => {
  assert.match(route, /official_rrp_pence > 0/);
  assert.match(route, /rrp_source/);
  assert.match(route, /rrp_verified_at IS NOT NULL/);
  assert.doesNotMatch(route, /item_price_pence/);
  assert.doesNotMatch(route, /mandatory_postage_pence/);
  assert.match(route, /missing_rrp/);
  assert.match(route, /missing_source/);
  assert.match(route, /missing_verified_at/);
});

test("RRP production audit tolerates only the bounded 401 window after rotating the Cloudflare secret", () => {
  assert.match(workflow, /for attempt in 1 2 3 4 5 6/);
  assert.match(workflow, /\[ "\$detail_status" != "401" \]/);
  assert.match(workflow, /RRP audit secret not active for detail yet/);
  assert.match(workflow, /\[ "\$checkpoint_status" != "401" \]/);
  assert.match(workflow, /RRP audit secret not active for checkpoint yet/);
  assert.match(workflow, /sleep 3/);
  assert.doesNotMatch(workflow, /retrying.*503/i);
});
