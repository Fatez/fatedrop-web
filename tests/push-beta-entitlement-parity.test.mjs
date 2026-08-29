import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const canonicalPush = fs.readFileSync(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');
const betaPremium = fs.readFileSync(new URL('../lib/beta-premium.ts', import.meta.url), 'utf8');
const checkout = fs.readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');

test('push recipients require closed-beta approval before any premium path', () => {
  assert.match(canonicalPush, /JOIN fatedrop_beta_access ba ON ba\.user_id=pe\.user_id AND ba\.status='approved'/);
});

test('approved accounts receive priority push during full-access closed beta without a beta-lead dependency', () => {
  assert.match(canonicalPush, /betaPremiumEnabled\(\)/);
  assert.match(canonicalPush, /\$\{temporaryBetaPremium\}=true/);
  assert.doesNotMatch(canonicalPush, /FROM beta_leads/);
});

test('approved accounts receive temporary full feature access while closed-beta mode is enabled', () => {
  assert.match(betaPremium, /if \(!betaAccessIsApproved\(betaAccess\)\)/);
  assert.match(betaPremium, /if \(!betaPremiumEnabled\(\)\)/);
  assert.match(betaPremium, /tier: "plus"/);
  assert.match(betaPremium, /status: "active"/);
  assert.doesNotMatch(betaPremium, /collectorIsInBeta/);
});

test('paid premium membership remains a future fallback but cannot bypass beta approval', () => {
  assert.match(canonicalPush, /m\.status IN \('active','trialing'\)/);
  assert.match(canonicalPush, /m\.tier IN \('plus','pro'\)/);
  const approvalJoin = canonicalPush.indexOf("JOIN fatedrop_beta_access ba ON ba.user_id=pe.user_id AND ba.status='approved'");
  const premiumPredicate = canonicalPush.indexOf("m.status IN ('active','trialing') AND m.tier IN ('plus','pro')");
  assert.ok(approvalJoin >= 0 && premiumPredicate > approvalJoin);
});

test('subscription checkout is disabled while approved testers already have full closed-beta access', () => {
  assert.match(checkout, /if \(betaPremiumEnabled\(\)\)/);
  assert.match(checkout, /Subscriptions are not required during the FateDrop closed beta/);
});
