import assert from "node:assert/strict";
import test from "node:test";
import * as localRadarMapNamespace from "../lib/local-radar-map.ts";

const localRadarMap = localRadarMapNamespace.default ?? localRadarMapNamespace;
const { clampMarkerBudget, clusterProjectedRadarPoints, retailerGroup } = localRadarMap;

function storePoint(index) {
  const column = index % 73;
  const row = Math.floor(index / 73);
  return {
    id: `shop:${index}`,
    name: `Store ${index}`,
    latitude: 49.9 + row * 0.04,
    longitude: -7.4 + column * 0.13,
    x: column * 14,
    y: row * 11,
  };
}

test("4,373 physical locations remain within the Cloud-controlled marker budget", () => {
  const points = Array.from({ length: 4_373 }, (_, index) => storePoint(index));
  const markers = clusterProjectedRadarPoints(points, 72);
  assert.ok(markers.length <= 72, `expected at most 72 interactive markers, received ${markers.length}`);
  assert.equal(markers.reduce((total, marker) => total + marker.count, 0), 4_373);
  assert.ok(markers.some((marker) => marker.kind === "cluster"));
});

test("low-density results remain individual selectable locations", () => {
  const points = Array.from({ length: 7 }, (_, index) => storePoint(index));
  const markers = clusterProjectedRadarPoints(points, 72);
  assert.equal(markers.length, 7);
  assert.ok(markers.every((marker) => marker.kind === "point"));
});

test("untrusted marker budgets are clamped and missing Cloud groups stay unclassified", () => {
  assert.equal(clampMarkerBudget(5_000), 100);
  assert.equal(clampMarkerBudget(1), 8);
  assert.equal(clampMarkerBudget("not-a-number"), 72);
  assert.equal(retailerGroup("supermarkets"), "supermarkets");
  assert.equal(retailerGroup(""), "unclassified");
  assert.equal(retailerGroup("guessed-from-a-name"), "unclassified");
});
