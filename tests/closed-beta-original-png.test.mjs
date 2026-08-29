import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const artworkPath = "public/assets/closed-beta/fatedrop-closed-beta-community.png";
const artwork = fs.readFileSync(artworkPath);
const page = fs.readFileSync("app/closed-beta/page.tsx", "utf8");

test("closed beta landing uses the exact original full-quality PNG", () => {
  assert.match(page, /src="\/assets\/closed-beta\/fatedrop-closed-beta-community\.png"/);
  assert.doesNotMatch(page, /closed-beta-community\.webp/);
  assert.equal(artwork.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(artwork.readUInt32BE(16), 1672);
  assert.equal(artwork.readUInt32BE(20), 941);
  assert.equal(artwork.byteLength, 3535431);
  assert.equal(
    createHash("sha256").update(artwork).digest("hex"),
    "de5aaacb0d609ac112ea2e27ef67f25160dd44a0e359b93d1c5e804bf4c74df3",
  );
});
