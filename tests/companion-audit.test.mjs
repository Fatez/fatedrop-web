import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const canonicalDocs = [
  "docs/fatedrop-product-truth.md",
  "docs/fatedrop-network-audit.md",
  "docs/koru-brand-direction.md",
  "docs/launch-checklist.md",
  "docs/release-readiness.md",
  "docs/launch-foundation-v1.md",
];

test("canonical docs all preserve the final four-stage public lifecycle", () => {
  for (const file of canonicalDocs) {
    const source = read(file);
    assert.ok(source.includes("Whisper"), `${file} must mention Whisper`);
    assert.ok(source.includes("Echo"), `${file} must mention Echo`);
    assert.ok(source.includes("Manifested"), `${file} must mention Manifested`);
    assert.ok(source.includes("Vanished"), `${file} must mention Vanished`);
    assert.equal(source.includes("Whisper is internal"), false, `${file} must not restore the retired internal-Whisper model`);
    assert.equal(source.includes("Whisper — internal"), false, `${file} must not restore the retired internal-Whisper label`);
  }
});

test("product and release authority lock Koru and Friends to the final five", () => {
  const product = read("docs/fatedrop-product-truth.md");
  const readiness = read("docs/release-readiness.md");
  const brand = read("docs/koru-brand-direction.md");
  const checklist = read("docs/launch-checklist.md");

  for (const name of ["Koru", "Fenn", "Aeris", "Nyxen", "Solix"]) {
    assert.ok(product.includes(`**${name}**`), `Product Spec must include ${name}`);
    assert.ok(readiness.includes(`**${name}**`), `Release Readiness must include ${name}`);
  }
  assert.ok(brand.includes("The active selectable companion roster is exactly"));
  assert.ok(checklist.includes("The active companion roster is fixed to"));
  assert.ok(product.includes("Kael (`K-01`) and Nyra (`N-02`) remain legacy/archive"));
  assert.ok(readiness.includes("Kael (`K-01`) and Nyra (`N-02`) are archive-only"));
});

test("canonical release docs cannot resurrect retired Droid or layered-avatar requirements", () => {
  const checklist = read("docs/launch-checklist.md");
  const readiness = read("docs/release-readiness.md");
  const product = read("docs/fatedrop-product-truth.md");
  const brand = read("docs/koru-brand-direction.md");

  assert.equal(checklist.includes("production GLB droid asset"), false);
  assert.equal(checklist.includes("floating droid"), false);
  assert.equal(readiness.includes("KAEL/NYRA Companion path"), false);
  assert.equal(readiness.includes("protected-beta release candidate includes"), false);
  assert.ok(product.includes("Retired Droid, Scout, radar-drone, signal-orb and mini-beacon companion concepts are not part of the active companion architecture."));
  assert.ok(brand.includes("Do not relabel legacy Scout, Warden, Droid or TCG-themed GLBs"));
});

test("release authority keeps mobile companion reconciliation outside the current web pass", () => {
  const readiness = read("docs/release-readiness.md");
  assert.ok(readiness.includes("Mobile code | **OUTSIDE CURRENT WEB PASS**"));
  assert.ok(readiness.includes("Mobile is not being modified by the current website pass."));
  for (const id of ["koru", "fenn", "aeris", "nyxen", "solix"]) assert.ok(readiness.includes(`- \`${id}\``));
});

test("final artwork is recorded as desktop-approved while runtime and mobile QA remain explicit gates", () => {
  const checklist = read("docs/launch-checklist.md");
  const readiness = read("docs/release-readiness.md");
  assert.ok(checklist.includes("approved Koru hero PNG"));
  assert.ok(checklist.includes("approved Koru & Friends section PNG"));
  assert.ok(checklist.includes("no production merge occurs until visual approval is explicit"));
  assert.ok(readiness.includes("Web public visual approval | **GREEN DESKTOP / MOBILE QA REMAINS**"));
  assert.equal(readiness.includes("still need final branch sync and visual QA"), false);
});
