import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

test("Koru is the canonical web mascot and approved artwork is present", () => {
  const brand = read("lib/koru-brand.ts");
  assert.ok(brand.includes('name: "Koru"'));
  assert.ok(brand.includes('code: "K-09"'));
  assert.ok(brand.includes('role: "FateDrop Signal Companion"'));
  assert.ok(brand.includes("modelUrl: null"));
  for (const file of [
    "public/assets/companions/koru-portrait.webp",
    "public/assets/companions/koru-signal-companion.webp",
    "public/assets/companions/koru-and-friends.webp",
    "public/assets/merch/koru-crystal-jersey.webp",
  ]) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} missing`);
});

test("retired Scout and Droid GLBs are absent from the active web tree", () => {
  assert.equal(fs.existsSync(path.join(root, "public/assets/companions/fatedrop-male.glb")), false);
  assert.equal(fs.existsSync(path.join(root, "public/assets/companions/fatedrop-droid.glb")), false);
  assert.equal(fs.existsSync(path.join(root, "lib/companion-assets.ts")), false);
  assert.equal(fs.existsSync(path.join(root, "components/companion-3d-stage.tsx")), false);
});

test("no standalone HTML companion experiments remain in the website repository", () => {
  const html = walk(root).filter((file) => file.endsWith(".html") && !file.includes(`${path.sep}node_modules${path.sep}`) && !file.includes(`${path.sep}.next${path.sep}`));
  assert.deepEqual(html, []);
});

test("Koru reaction contract preserves all four public lifecycle meanings", () => {
  const contract = read("lib/companion-contract.ts");
  assert.ok(contract.includes('kind === "whisper" || kind === "drop_pulse"'));
  assert.ok(contract.includes('return "watching"'));
  assert.ok(contract.includes('kind === "echo" || kind === "queue"'));
  assert.ok(contract.includes('return "echo"'));
  assert.ok(contract.includes('if (kind === "manifested") return "manifested"'));
  assert.ok(contract.includes('if (kind === "vanished") return "vanished"'));
  assert.equal(contract.includes('kind === "manifested" || kind === "echo"'), false);
});

test("profile avatar stays separate from the fixed Koru mascot", () => {
  const builder = read("components/avatar-builder.tsx");
  assert.ok(builder.includes("Collector avatar"));
  assert.ok(builder.includes("Koru is not selectable"));
  assert.ok(builder.includes("AvatarPreview"));
  assert.equal(builder.includes("CompanionModelCanvas"), false);
  assert.equal(builder.includes('tcgStyle: "TCG Style"'), false);
});
