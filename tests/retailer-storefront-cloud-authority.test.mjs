import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../app/dashboard/stores/page.tsx', import.meta.url), 'utf8');
const directory = await readFile(new URL('../components/retailer-market-directory.tsx', import.meta.url), 'utf8');
const network = await readFile(new URL('../lib/retailer-network.ts', import.meta.url), 'utf8');
const signalClient = await readFile(new URL('../lib/signal-engine-client.ts', import.meta.url), 'utf8');
const storefront = await readFile(new URL('../app/dashboard/stores/[id]/page.tsx', import.meta.url), 'utf8');
const localRadar = await readFile(new URL('../components/local-radar-search.tsx', import.meta.url), 'utf8');

test('dashboard retailer discovery no longer promotes hard-coded lab storefronts into live network truth', () => {
  assert.match(page, /getRetailerNetworkSnapshot/);
  assert.doesNotMatch(page, /getCobAndPipCatalogue/);
  assert.doesNotMatch(page, /getWishlistCollectablesCatalogue/);
  assert.doesNotMatch(page, /Wishlist Collectables/);
  assert.doesNotMatch(page, /Cob & Pip/);
  assert.doesNotMatch(page, /labStorefronts/);
});

test('retailer cards open one internal storefront keyed by canonical Cloud id', () => {
  assert.match(directory, /href={`\/dashboard\/stores\/\$\{encodeURIComponent\(retailer\.id\)\}`}/);
  assert.match(directory, /VIEW RETAILER/);
  assert.doesNotMatch(directory, /dashboard\/search\?q=/);
  assert.match(network, /id: directory\.id/);
});

test('Web Search resolves exact retailer names against Cloud directory rather than static registry', () => {
  assert.match(signalClient, /await getSignalRetailerDirectory\(\)/);
  assert.match(signalClient, /directory\?\.retailers\.find/);
  assert.match(signalClient, /return retailer\?\.id \?\? null/);
  assert.doesNotMatch(signalClient, /retailerRegistry/);
  assert.doesNotMatch(signalClient, /retailer-registry/);
});

test('canonical Web storefront resolves Cloud profile first and falls back only to exact Cloud directory identity', () => {
  assert.match(storefront, /getSignalRetailerProfile\(id\)/);
  assert.match(storefront, /getSignalRetailerDirectory\(\)/);
  assert.match(storefront, /directory\?\.retailers\.find\(\(item\) => item\.id === id\)/);
  assert.match(storefront, /locations: \[\]/);
  assert.doesNotMatch(storefront, /retailerRegistry/);
  assert.doesNotMatch(storefront, /Cob & Pip/);
  assert.doesNotMatch(storefront, /Wishlist Collectables/);
});

test('storefront catalogue is retailer-scoped and only renders current IN_STOCK offers', () => {
  assert.match(storefront, /searchSignalCatalogue\(query, \{ retailer: retailer\.id, inStock: true/);
  assert.match(storefront, /offer\.availability === "IN_STOCK"/);
  assert.match(storefront, /CONNECTED IN-STOCK CATALOGUE/);
  assert.match(storefront, /Compare across retailers in FateFind/);
});

test('known branch identity never becomes a physical stock claim', () => {
  assert.match(storefront, /KNOWN PHYSICAL LOCATIONS/);
  assert.match(storefront, /Their existence does not prove current physical stock/);
  assert.match(storefront, /Online retailer availability never proves stock at a physical branch/);
  assert.match(storefront, /exact-branch evidence/);
});

test('storefront to Local Radar bridge scopes branches by exact canonical retailer id', () => {
  assert.match(storefront, /retailerId=\$\{encodeURIComponent\(retailer\.id\)\}/);
  assert.match(localRadar, /routeParams\.get\("retailerId"\)/);
  assert.match(localRadar, /shop\.retailerId === scopedRetailerId/);
  assert.match(localRadar, /It does not match stores by name or infer physical stock from the retailer’s online catalogue/);
  assert.doesNotMatch(localRadar, /shop\.name === scopedRetailerName/);
});

test('Cloud retailer profile route and safe public profile fields are represented in Web client contract', () => {
  assert.match(signalClient, /logoUrl\?: string \| null/);
  assert.match(signalClient, /description\?: string \| null/);
  assert.match(signalClient, /locations: SignalRetailerLocation\[\]/);
  assert.match(signalClient, /`\/api\/retailers\/\$\{encodeURIComponent\(cleanId\)\}`/);
  assert.match(signalClient, /safeRetailerProfile/);
});
