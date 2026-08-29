import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const pageUrl = new URL("../app/closed-beta/page.tsx", import.meta.url);
const artworkUrl = new URL("../public/assets/closed-beta/fatedrop-closed-beta-community.webp", import.meta.url);

test("closed beta hero keeps the supplied high-resolution artwork contract", () => {
  const page = readFileSync(pageUrl, "utf8");
  const artwork = readFileSync(artworkUrl);
  const { size } = statSync(artworkUrl);

  assert.match(page, /src="\/assets\/closed-beta\/fatedrop-closed-beta-community\.webp"/);
  assert.match(page, /width=\{1672\}/);
  assert.match(page, /height=\{941\}/);
  assert.ok(size > 100_000, `closed beta hero artwork is unexpectedly small (${size} bytes)`);
  assert.equal(artwork.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(artwork.subarray(8, 12).toString("ascii"), "WEBP");
});
