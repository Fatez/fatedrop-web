import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../lib/fate-trader-web.ts', import.meta.url), 'utf8');

test('Fate Trader Finder is allowlisted only to the canonical Cloud route', () => {
  assert.match(source, /if \(joined === "finder"\) return "\/v1\/trader\/finder";/);
  assert.doesNotMatch(source, /finder\/users/);
  assert.doesNotMatch(source, /\/v1\/trader\/finder\/\$\{/);
});
