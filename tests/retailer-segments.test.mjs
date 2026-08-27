import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const component = await readFile(new URL('../components/retailer-market-directory.tsx', import.meta.url), 'utf8');
const page = await readFile(new URL('../app/dashboard/stores/page.tsx', import.meta.url), 'utf8');
const network = await readFile(new URL('../lib/retailer-network.ts', import.meta.url), 'utf8');
const signalClient = await readFile(new URL('../lib/signal-engine-client.ts', import.meta.url), 'utf8');

test('Retailers segments one canonical Cloud directory into approved discovery views', () => {
  assert.match(component, /type RetailerView = "all" \| "major" \| "specialist" \| "local"/);
  assert.match(component, /Major Retailers/);
  assert.match(component, /TCG Specialists/);
  assert.match(component, /Independent & Local/);
  assert.match(component, /retailer\.retailerClass === "national"/);
  assert.match(component, /retailer\.retailerClass === "specialist"/);
  assert.match(component, /retailer\.retailerClass === "independent" \|\| retailer\.retailerClass === "regional"/);
  assert.match(page, /FATE NETWORK · MAJOR · SPECIALIST · INDEPENDENT & LOCAL/);
  assert.match(page, /Discover the stores behind the hobby\./);
});

test('retailer presence filters fail closed and preserve unknown', () => {
  assert.match(component, /Physical Stores/);
  assert.match(component, /retailer\.physicalStores === true/);
  assert.match(component, /retailer\.online === true/);
  assert.match(component, /physical status unknown/);
  assert.match(network, /physicalStores: boolean \| null/);
  assert.match(network, /physicalLocations: number \| null/);
});

test('Web retailer network uses Cloud directory only and never appends static registry truth', () => {
  assert.match(signalClient, /getSignalRetailerDirectory/);
  assert.match(signalClient, /"\/api\/retailers"/);
  assert.match(network, /getSignalRetailerDirectory/);
  assert.match(network, /available: false, retailers: \[\]/);
  assert.doesNotMatch(network, /retailerRegistry/);
  assert.doesNotMatch(network, /retailerByCloudId/);
  assert.doesNotMatch(network, /getSignalEngineStatus/);
  assert.doesNotMatch(network, /source: "registry"/);
});

test('Retailers is A-Z business discovery and sends product comparison to FateFind', () => {
  assert.match(component, /A–Z · NO RANKING/);
  assert.match(component, /Search retailer or TCG/);
  assert.match(component, /Looking for a product\? Use FateFind/);
  assert.match(component, /same comparison pool/);
  assert.match(component, /localeCompare/);
  assert.doesNotMatch(component, /RRP \/ Major Retailers/);
  assert.doesNotMatch(component, /EXPERIMENTAL INDEPENDENT STOREFRONTS/);
  assert.doesNotMatch(component, /labStorefronts/);
});
