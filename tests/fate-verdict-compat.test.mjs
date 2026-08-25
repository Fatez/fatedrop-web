import test from 'node:test';
import assert from 'node:assert/strict';

const imported = await import('../lib/fate-verdict-compat.ts');
const compat = imported.default && typeof imported.default === 'object' ? imported.default : imported;
const { compareCompatGroups, rankCompatGroups } = compat;

function group({ id, title, price, rrp = 100, shipping = 5, deliveryKnown = true, family = 'same-family' }) {
  return {
    id,
    title,
    category: 'SEALED',
    matchingConfidence: 1,
    retailerCount: 1,
    identityKey: id,
    valueFamilyKey: family,
    rrpGbp: rrp,
    rrpSource: 'test:official',
    rrpKind: 'official',
    unitCount: 1,
    unitKind: 'unit',
    offers: [{
      id: `${id}:offer`,
      retailerId: `${id}:retailer`,
      retailerName: `${id} retailer`,
      title,
      priceGbp: price,
      shippingGbp: deliveryKnown ? shipping : undefined,
      totalDeliveredGbp: deliveryKnown ? price + shipping : undefined,
      deliveryKnown,
      collectionAvailable: false,
      productUrl: 'https://example.com/item',
      lastCheckedAt: '2026-08-25T00:00:00.000Z',
      stockStatus: 'IN_STOCK',
      isLowestKnownDelivered: true,
    }],
  };
}

test('Fate Verdict v2 ranks by item-price percentage versus verified RRP before True Price', () => {
  assert.equal(typeof compareCompatGroups, 'function');
  const left = group({ id: 'left', title: 'Left', price: 90, rrp: 100, shipping: 50 });
  const right = group({ id: 'right', title: 'Right', price: 95, rrp: 100, shipping: 0 });
  const result = compareCompatGroups(left, right);
  assert.equal(result.winnerId, 'left');
  assert.equal(result.basis, 'rrp_percent');
});

test('unknown delivery never becomes a fake zero-cost True Price tie break', () => {
  const left = group({ id: 'left', title: 'Left', price: 90, rrp: 100, deliveryKnown: false });
  const right = group({ id: 'right', title: 'Right', price: 90, rrp: 100, shipping: 4, deliveryKnown: true });
  const result = compareCompatGroups(left, right);
  assert.equal(result.winnerId, null);
  assert.match(result.reason, /no trustworthy known True Price tie-break/i);
});

test('mixed value families fail closed rather than declaring a cross-product winner', () => {
  const left = group({ id: 'left', title: 'Left', price: 80, family: 'family-a' });
  const right = group({ id: 'right', title: 'Right', price: 120, family: 'family-b' });
  const result = compareCompatGroups(left, right);
  assert.equal(result.winnerId, null);
  assert.match(result.reason, /same value family/i);
});

test('search ranking uses the same RRP-first rule', () => {
  assert.equal(typeof rankCompatGroups, 'function');
  const groups = [
    group({ id: 'a', title: 'A', price: 92, rrp: 100, shipping: 0, family: 'family' }),
    group({ id: 'b', title: 'B', price: 88, rrp: 100, shipping: 20, family: 'family' }),
  ];
  const result = rankCompatGroups(groups);
  assert.equal(result.winnerId, 'b');
  assert.equal(result.basis, 'rrp_percent');
});
