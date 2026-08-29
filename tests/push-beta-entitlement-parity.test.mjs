import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const canonicalPush = fs.readFileSync(new URL('../lib/canonical-push.ts', import.meta.url), 'utf8');

test('push recipients require closed-beta approval before any premium path', () => {
  assert.match(canonicalPush, /JOIN fatedrop_beta_access ba ON ba\.user_id=pe\.user_id AND ba\.status='approved'/);
});

test('temporary approved beta collectors receive the same priority push eligibility as temporary Premium UI access', () => {
  assert.match(canonicalPush, /betaPremiumEnabled\(\)/);
  assert.match(canonicalPush, /FROM beta_leads bl/);
  assert.match(canonicalPush, /lower\(bl\.email\)=lower\(u\.email\)/);
  assert.match(canonicalPush, /bl\.role='collector'/);
  assert.match(canonicalPush, /bl\.contact_consent=TRUE/);
});

test('paid premium membership remains eligible but cannot bypass beta approval', () => {
  assert.match(canonicalPush, /m\.status IN \('active','trialing'\)/);
  assert.match(canonicalPush, /m\.tier IN \('plus','pro'\)/);
  const approvalJoin = canonicalPush.indexOf("JOIN fatedrop_beta_access ba ON ba.user_id=pe.user_id AND ba.status='approved'");
  const premiumPredicate = canonicalPush.indexOf("m.status IN ('active','trialing') AND m.tier IN ('plus','pro')");
  assert.ok(approvalJoin >= 0 && premiumPredicate > approvalJoin);
});
