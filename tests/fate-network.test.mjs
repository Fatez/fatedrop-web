import test from "node:test";
import assert from "node:assert/strict";
import * as truePriceNamespace from "../lib/true-price.ts";
import * as fateMatchNamespace from "../lib/fate-match.ts";
import * as locationNamespace from "../lib/location.ts";
import * as demandNamespace from "../lib/demand-aggregation.ts";
import * as fateLockNamespace from "../lib/fate-lock.ts";
import * as entitlementsNamespace from "../lib/entitlements.ts";
import * as productIdentityNamespace from "../lib/product-identity.ts";

const truePriceModule = truePriceNamespace.default ?? truePriceNamespace;
const fateMatchModule = fateMatchNamespace.default ?? fateMatchNamespace;
const locationModule = locationNamespace.default ?? locationNamespace;
const demandModule = demandNamespace.default ?? demandNamespace;
const fateLockModule = fateLockNamespace.default ?? fateLockNamespace;
const entitlementsModule = entitlementsNamespace.default ?? entitlementsNamespace;
const productIdentityModule = productIdentityNamespace.default ?? productIdentityNamespace;

const { calculateTruePrice, truePriceLabel } = truePriceModule;
const { evaluateFateMatch, evaluateActiveFateMatches } = fateMatchModule;
const { distanceKm, dedupeLocations } = locationModule;
const { aggregateAnonymousDemand } = demandModule;
const { canCreateReservation, reservationIdempotencyHit } = fateLockModule;
const { capabilitiesForMembership, hasCapability } = entitlementsModule;
const { identifyProduct } = productIdentityModule;

const productId = "prd_destined-rivals-etb";
const baseOffer = {
  id: "off_1", productId: "listing_1", retailerId: "shop-a", locationId: null, productIdentityId: productId, retailerSku: "SKU1",
  title: "Destined Rivals Elite Trainer Box", url: "https://example.test/item", channel: "online", itemPricePence: 4999,
  mandatoryPostagePence: 0, mandatoryFeesPence: 0, deliveryKnown: true, stockState: "in_stock", stockQuantity: 2, observedAt: 1000,
};
const baseMatch = {
  id: "match_1", userId: "user_1", query: "Destined Rivals ETB", productIdentityId: productId,
  maxItemPricePence: null, maxTruePricePence: null, maxPercentAboveRrp: null, scope: "either", radiusKm: null, postcode: null,
  latitude: null, longitude: null, preferredRetailerIds: [], excludedRetailerIds: [], stockRequirement: "in_stock", notificationPreferences: { website: true }, enabled: true, createdAt: 1, updatedAt: 1,
};

test("True Price includes mandatory postage and fees with RRP delta", () => {
  const result = calculateTruePrice({ itemPricePence: 4999, mandatoryPostagePence: 399, mandatoryFeesPence: 100, deliveryKnown: true, officialRrpPence: 4999 });
  assert.equal(result.deliveredTruePricePence, 5498);
  assert.equal(result.differenceFromRrpPence, 499);
  assert.ok(Math.abs(result.percentFromRrp - 9.981996399279856) < 0.0001);
  assert.equal(result.label, "Fair");
});

test("True Price never invents delivered total when delivery is unknown", () => {
  const result = calculateTruePrice({ itemPricePence: 4500, mandatoryPostagePence: null, mandatoryFeesPence: 0, deliveryKnown: false, officialRrpPence: 4999 });
  assert.equal(result.deliveredTruePricePence, null);
  assert.equal(result.differenceFromRrpPence, null);
  assert.equal(result.percentFromRrp, null);
  assert.equal(result.label, "RRP unknown");
});

test("neutral True Price labels are deterministic", () => {
  assert.equal(truePriceLabel(-2), "Below RRP");
  assert.equal(truePriceLabel(0), "RRP");
  assert.equal(truePriceLabel(8), "Fair");
  assert.equal(truePriceLabel(20), "Elevated");
  assert.equal(truePriceLabel(40), "High Premium");
});

test("FateMatch enforces item, True Price and RRP thresholds", () => {
  const price = calculateTruePrice({ itemPricePence: 5200, mandatoryPostagePence: 0, mandatoryFeesPence: 0, deliveryKnown: true, officialRrpPence: 4999 });
  const match = { ...baseMatch, maxItemPricePence: 5300, maxTruePricePence: 5300, maxPercentAboveRrp: 5 };
  const result = evaluateFateMatch(match, { ...baseOffer, itemPricePence: 5200 }, price);
  assert.equal(result.matched, true);
  assert.ok(result.reasons.some((reason) => reason.includes("RRP premium")));
  const rejected = evaluateFateMatch({ ...match, maxPercentAboveRrp: 2 }, { ...baseOffer, itemPricePence: 5200 }, price);
  assert.equal(rejected.matched, false);
  assert.ok(rejected.rejectedBy.includes("RRP premium exceeds threshold"));
});

test("FateMatch respects retailer exclusions and preferences", () => {
  const price = calculateTruePrice({ itemPricePence: 4999, mandatoryPostagePence: 0, deliveryKnown: true, officialRrpPence: 4999 });
  assert.equal(evaluateFateMatch({ ...baseMatch, excludedRetailerIds: ["shop-a"] }, baseOffer, price).matched, false);
  assert.equal(evaluateFateMatch({ ...baseMatch, preferredRetailerIds: ["shop-b"] }, baseOffer, price).matched, false);
  assert.equal(evaluateFateMatch({ ...baseMatch, preferredRetailerIds: ["shop-a"] }, baseOffer, price).matched, true);
});

test("FateMatch online and local radius rules are evidence-based", () => {
  const price = calculateTruePrice({ itemPricePence: 4999, mandatoryPostagePence: 0, deliveryKnown: true, officialRrpPence: 4999 });
  const location = { id:"loc",retailerId:"shop-a",provider:"fatedrop",providerId:null,name:"Shop",address:null,postcode:"ME1",latitude:51.39,longitude:0.52,website:null,phone:null,openingDetails:null,verification:"verified" };
  const localOffer = { ...baseOffer, channel: "local", locationId: "loc" };
  const local = { ...baseMatch, scope: "local", radiusKm: 10, latitude: 51.38, longitude: 0.52 };
  assert.equal(evaluateFateMatch(local, localOffer, price, location).matched, true);
  assert.equal(evaluateFateMatch({ ...local, radiusKm: 0.1 }, localOffer, price, location).matched, false);
  assert.equal(evaluateFateMatch({ ...baseMatch, scope: "online" }, localOffer, price, location).matched, false);
});

test("signal-triggered offer evaluation returns only active qualifying matches", () => {
  const price = calculateTruePrice({ itemPricePence: 4999, mandatoryPostagePence: 0, deliveryKnown: true, officialRrpPence: 4999 });
  const results = evaluateActiveFateMatches([baseMatch, { ...baseMatch, id: "paused", enabled: false }, { ...baseMatch, id: "expensive", maxTruePricePence: 4000 }], baseOffer, price);
  assert.deepEqual(results.map((item) => item.matchId), ["match_1"]);
});

test("location deduplication handles provider IDs and natural duplicates", () => {
  const one = { id:"1",retailerId:null,provider:"google-places",providerId:"abc",name:"Card Shop",address:"1 Road",postcode:"ME1 1AA",latitude:51.4,longitude:0.5,website:null,phone:null,openingDetails:null,verification:"external" };
  const two = { ...one, id:"2" };
  const three = { ...one, id:"3", providerId:null };
  assert.equal(dedupeLocations([one,two,three]).length, 1);
  assert.ok(distanceKm(51.4,0.5,51.4,0.5) < 0.001);
});

test("FateRelay aggregation exposes no individual user intent", () => {
  const demand = aggregateAnonymousDemand([baseMatch, { ...baseMatch, id:"m2", userId:"secret-user-2", scope:"local", radiusKm:25, maxPercentAboveRrp:5 }]);
  assert.equal(demand[0].demandCount, 2);
  const serialized = JSON.stringify(demand);
  assert.equal(serialized.includes("user_1"), false);
  assert.equal(serialized.includes("secret-user-2"), false);
});

test("FateLock primitives enforce allocation and per-user limits", () => {
  const allocation = { id:"a1",retailerId:"shop",locationId:null,productIdentityId:productId,quantityAllocated:2,quantityReserved:1,perUserLimit:1,state:"open",opensAt:null,closesAt:null };
  assert.deepEqual(canCreateReservation(allocation, [], "u1", 1, 100), { allowed:true });
  const existing = [{ id:"r1",allocationId:"a1",userId:"u1",quantity:1,state:"reserved",idempotencyKey:"key",reservedAt:1,expiresAt:200 }];
  assert.equal(canCreateReservation(allocation, existing, "u1", 1, 100).allowed, false);
  assert.equal(canCreateReservation({ ...allocation, quantityReserved:2 }, [], "u2", 1, 100).allowed, false);
  assert.equal(reservationIdempotencyHit(existing, "key")?.id, "r1");
});

test("entitlements are centralised across free and premium memberships", () => {
  const free = { userId:"u",tier:"free",status:"free",stripeCustomerId:null,stripeSubscriptionId:null,stripePriceId:null,trialStartedAt:null,trialEndsAt:null,currentPeriodEnd:null,cancelAtPeriodEnd:false,updatedAt:1 };
  const plus = { ...free, tier:"plus", status:"active" };
  assert.equal(hasCapability(free, "true_price"), true);
  assert.equal(hasCapability(free, "advanced_fate_match"), false);
  assert.equal(hasCapability(plus, "advanced_fate_match"), true);
  assert.equal(capabilitiesForMembership(plus).has("premium_discord"), true);
});

test("product identity keeps ETB editions distinct", () => {
  const normal = identifyProduct("Destined Rivals Elite Trainer Box");
  const pc = identifyProduct("Pokemon Center Destined Rivals Elite Trainer Box");
  assert.equal(normal.kind, "elite-trainer-box");
  assert.notEqual(normal.key, pc.key);
});
