import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const component = await readFile(new URL('../components/retailer-market-directory.tsx', import.meta.url), 'utf8');
const page = await readFile(new URL('../app/dashboard/stores/page.tsx', import.meta.url), 'utf8');
const network = await readFile(new URL('../lib/retailer-network.ts', import.meta.url), 'utf8');
const signalClient = await readFile(new URL('../lib/signal-engine-client.ts', import.meta.url), 'utf8');

test('Stores keeps major and independent retailer discovery inside Fate Network without becoming FateFind', () => {
  assert.match(component, /RRP \/ Major Retailers/);
  assert.match(component, /Independent Retailers/);
  assert.match(component, /retailerClass === "national"/);
  assert.match(component, /\["independent", "specialist", "regional"\]/);
  assert.match(page, /ALL STORES · ONLINE · PHYSICAL · NEAR ME/);
  assert.match(page, /Stores is retailer-first\./);
  assert.match(page, /Stores helps you discover retailers\. FateFind compares the buying opportunity\./);
});

test('independent online and physical tabs use explicit presence evidence', () => {
  assert.match(component, /Physical Stores/);
  assert.match(component, /retailer\.physicalStores === true/);
  assert.match(component, /retailer\.online === true/);
  assert.match(component, /physical presence is explicitly known/);
  assert.match(network, /physicalStores: boolean \| null/);
  assert.match(network, /physicalLocations: number \| null/);
});

test('web consumes Cloud public retailer directory and keeps a safe registry fallback', () => {
  assert.match(signalClient, /getSignalRetailerDirectory/);
  assert.match(signalClient, /"\/api\/retailers"/);
  assert.match(network, /Promise\.all/);
  assert.match(network, /directoryResponse\?\.retailers/);
  assert.match(network, /registry\?\.physicalStores \?\? null/);
});

test('RRP retailer wording does not promise retailer pricing', () => {
  assert.match(component, /RRP is FateDrop's verified\/reference comparison baseline/);
  assert.match(component, /Retailer prices can still be above or below/);
  assert.match(component, /does not mean the retailer always sells at RRP/);
});
