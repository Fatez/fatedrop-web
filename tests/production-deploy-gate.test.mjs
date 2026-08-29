import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/deploy-production.yml", import.meta.url), "utf8");

function position(pattern, label) {
  const index = workflow.search(pattern);
  assert.notEqual(index, -1, `${label} must be present`);
  return index;
}

test("production deployment can only follow a successful push verification of main", () => {
  assert.match(workflow, /workflows: \["Verify FateDrop Web"\]/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /workflow_run\.event == 'push'/);
  assert.match(workflow, /workflow_run\.head_branch == 'main'/);
});

test("deployment checks out the exact verified SHA and refuses a superseded commit", () => {
  const checkout = position(/ref: \$\{\{ env\.VERIFIED_SHA \}\}/, "exact verified checkout");
  const latestGuard = position(/git ls-remote origin refs\/heads\/main/, "latest-main guard");
  const deploy = position(/run: npm run deploy/, "canonical deploy command");
  assert.ok(checkout < latestGuard && latestGuard < deploy);
  assert.match(workflow, /current_main" != "\$VERIFIED_SHA"/);
  assert.match(workflow, /echo "deploy=false" >> "\$GITHUB_OUTPUT"/);
});

test("production credentials fail closed and are never required for a superseded SHA", () => {
  assert.match(workflow, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID: \$\{\{ secrets\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  assert.match(workflow, /Missing CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /Missing CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /if: steps\.latest\.outputs\.deploy == 'true'/);
});

test("production deployment provisions real Turnstile bindings before publishing", () => {
  const turnstile = position(/name: Ensure production Turnstile widget/, "Turnstile provisioning");
  const deploy = position(/run: npm run deploy/, "canonical deploy command");
  assert.ok(turnstile < deploy);
  assert.match(workflow, /accounts\/\$CLOUDFLARE_ACCOUNT_ID\/challenges\/widgets/);
  assert.match(workflow, /TURNSTILE_WIDGET_NAME: FateDrop Web Production/);
  assert.match(workflow, /TURNSTILE_DOMAIN: fatedrop\.co\.uk/);
  assert.match(workflow, /mode: "managed"/);
  assert.match(workflow, /wrangler secret put TURNSTILE_SITE_KEY/);
  assert.match(workflow, /wrangler secret put TURNSTILE_SECRET_KEY/);
  assert.match(workflow, /invalid-input-secret/);
  assert.match(workflow, /::add-mask::\$turnstile_secret/);
});

test("post-deploy smoke proves canonical Cloud contracts and critical Web auth boundaries", () => {
  assert.match(workflow, /needs\.deploy\.outputs\.deployed == 'true'/);
  assert.match(workflow, /signals\.contractVersion !== 1/);
  assert.match(workflow, /signals\.source !== "FATEDROP_CLOUD"/);
  assert.match(workflow, /summary\.available !== true/);
  assert.match(workflow, /Cloud private diagnostic boundary changed/);
  assert.match(workflow, /check_status "\/api\/mobile\/session" "401"/);
  assert.match(workflow, /check_status "\/api\/mobile\/alerts" "401"/);
  assert.match(workflow, /check_available "\/api\/trader\/cards\?q=Furret&limit=1"/);
});

test("post-deploy smoke fails unless closed-beta registration has both Turnstile halves live", () => {
  assert.match(workflow, /curl[^\n]*"\$WEB\/closed-beta"/);
  assert.match(workflow, /grep -Fq 'cf-turnstile'/);
  assert.match(workflow, /Security verification is unavailable\./);
  assert.match(workflow, /"\$WEB\/api\/auth\/register"/);
  assert.match(workflow, /test "\$register_status" = "403"/);
  assert.match(workflow, /Security verification failed\. Please try again\./);
});
