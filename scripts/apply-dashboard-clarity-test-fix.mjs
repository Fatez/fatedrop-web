import { readFileSync, writeFileSync } from 'node:fs';

function update(path, replacements) {
  let source = readFileSync(path, 'utf8');
  for (const [before, after, label] of replacements) {
    if (!source.includes(before)) throw new Error(`${path}: missing ${label}`);
    source = source.replace(before, after);
  }
  writeFileSync(path, source);
}

update('tests/dashboard-routes.test.mjs', [
  ['assert.ok(stores.includes("STOREFRONT LAB"));', 'assert.ok(stores.includes("STORE PREVIEWS"));', 'store preview wording'],
  ['assert.ok(stores.includes("FateDrop is the bridge, not the marketplace"));', 'assert.ok(stores.includes("FateDrop is the bridge, not the marketplace"));\n  assert.ok(stores.includes("not a paid ranking, endorsement or blanket trust badge"));', 'bridge/trust safeguard'],
]);

update('tests/koru-homepage.test.mjs', [
  ['assert.ok(dashboard.includes("Retailers You Track"));', 'assert.ok(dashboard.includes("Independent Stores"));\n  assert.ok(dashboard.includes("Discover more places to buy"));', 'Independent Stores wording'],
  ['assert.ok(pulse.includes("Products"));', 'assert.ok(pulse.includes("Products"));\n  assert.ok(pulse.includes("Signals"));\n  assert.ok(pulse.includes("Retailers"));\n  assert.ok(dashboard.includes("signals={signalActivity7d}"));', 'Network Pulse three real metrics'],
]);

update('tests/public-dashboard-lifecycle.test.mjs', [
  ['assert.match(dashboardPage, /Confirmed purchasable availability/);', 'assert.match(dashboardPage, /Confirmed live stock/);', 'Manifested dashboard wording'],
]);

console.log('Dashboard clarity regression guards aligned.');
