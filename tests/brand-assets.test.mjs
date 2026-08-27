import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const bytes = (file) => fs.readFileSync(path.join(root, file));

const brandMark = read("components/brand-mark.tsx");
const dashboardShell = read("components/dashboard-page-shell.tsx");
const rootLayout = read("app/layout.tsx");

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash("sha1").update(header).update(buffer).digest("hex");
}

function pngDimensions(buffer) {
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG");
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

test("shared Web chrome renders the approved FateDrop wordmark artwork", () => {
  const wordmark = bytes("public/assets/fatedrop-wordmark.png");

  assert.match(brandMark, /\/assets\/fatedrop-wordmark\.png/);
  assert.doesNotMatch(brandMark, /brand-word|<b>Fate<\/b>|<em>Drop<\/em>/);
  assert.deepEqual(pngDimensions(wordmark), [320, 107]);
  assert.equal(gitBlobSha(wordmark), "63f7b5af83b743aeead9949dd33e7b08fe978033");
});

test("the approved standalone emblem is reused by dashboard fallbacks and browser icons", () => {
  const emblem = bytes("public/assets/fatedrop-logo-mark.png");

  assert.match(dashboardShell, /\/assets\/fatedrop-logo-mark\.png/);
  assert.match(rootLayout, /icon: "\/assets\/fatedrop-logo-mark\.png"/);
  assert.match(rootLayout, /shortcut: "\/assets\/fatedrop-logo-mark\.png"/);
  assert.match(rootLayout, /apple: "\/assets\/fatedrop-logo-mark\.png"/);
  assert.deepEqual(pngDimensions(emblem), [192, 192]);
  assert.equal(gitBlobSha(emblem), "91cfdfb919de83f361aa7936b30a93fe5a26a93b");
});
