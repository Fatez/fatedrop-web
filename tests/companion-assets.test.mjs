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

test("Koru remains the FateDrop mascot and approved artwork is present", () => {
  const brand = read("lib/koru-brand.ts");
  assert.ok(brand.includes('name: "Koru"'));
  assert.ok(brand.includes('role: "FateDrop Signal Companion"'));
  assert.equal(brand.includes("modelUrl"), false, "3D registration must live in the companion contract only");
  for (const file of [
    "public/assets/companions/koru-portrait.webp",
    "public/assets/companions/koru-signal-companion.webp",
    "public/assets/companions/koru-and-friends.webp",
    "public/assets/merch/koru-crystal-jersey.webp",
  ]) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} missing`);
});

test("active companion roster is exactly the five Koru and Friends characters", () => {
  const contract = read("lib/companion-contract.ts");
  assert.ok(contract.includes('ACTIVE_COMPANION_IDS = ["koru", "fenn", "aeris", "nyxen", "solix"]'));
  for (const name of ["Koru", "Fenn", "Aeris", "Nyxen", "Solix"]) assert.ok(contract.includes(`name: "${name}"`));
  assert.ok(contract.includes("slot: 1"));
  assert.ok(contract.includes("slot: 5"));
  assert.equal(contract.includes("droidModelUrl"), false);
  assert.equal(contract.includes("characterModelUrl"), false);
  assert.equal(contract.includes("AvatarLoadout"), false);
  assert.ok(contract.includes("COMPANION_SCHEMA_VERSION = 2"));
});

test("Kael and Nyra are archive-only and never active companion IDs", () => {
  const contract = read("lib/companion-contract.ts");
  assert.ok(contract.includes('id: "kael", name: "Kael", code: "K-01"'));
  assert.ok(contract.includes('id: "nyra", name: "Nyra", code: "N-02"'));
  const activeLine = contract.split("\n").find((line) => line.includes("ACTIVE_COMPANION_IDS")) || "";
  assert.equal(activeLine.includes("kael"), false);
  assert.equal(activeLine.includes("nyra"), false);
});

test("retired companion and illustrated-avatar renderer experiments are absent", () => {
  for (const file of [
    "public/assets/companions/fatedrop-male.glb",
    "public/assets/companions/fatedrop-droid.glb",
    "lib/companion-assets.ts",
    "components/companion-3d-stage.tsx",
    "components/avatar-builder.tsx",
    "components/avatar-preview.tsx",
    "components/avatar-option-thumbnail.tsx",
    "components/avatar-anime-character.tsx",
    "components/avatar-layered-character.tsx",
    "lib/avatar-assets.ts",
    "public/assets/avatar-v2/avatar-sprites.svg",
    "public/assets/avatar-v2/catalogue.json",
  ]) assert.equal(fs.existsSync(path.join(root, file)), false, `${file} should remain retired`);
});

test("final-roster registered GLBs render through the current WebGL boundary", () => {
  const contract = read("lib/companion-contract.ts");
  const renderer = read("components/companion-renderer.tsx");
  const webgl = read("components/companion-webgl-model.tsx");
  assert.ok(renderer.includes("CompanionWebglModel"));
  assert.ok(renderer.includes('mode === "webgl-3d" && definition.modelUrl'));
  assert.equal(renderer.includes("renderer validation pending"), false);
  assert.ok(webgl.includes("Companion asset is not GLB v2"));
  assert.ok(webgl.includes("baseColorTexture"));
  assert.ok(webgl.includes("WebGL is unavailable on this device"));
  for (const id of ["aeris", "nyxen", "solix"]) {
    assert.ok(contract.includes(`/assets/companions/${id}/${id}.glb`));
    assert.equal(fs.existsSync(path.join(root, `public/assets/companions/${id}/${id}.glb`)), true, `${id} GLB missing`);
  }
  for (const retired of ["Signal Scout", "Signal Warden", "Signal Droid", "floating signal familiar"]) {
    assert.equal(webgl.includes(retired), false, `${retired} must not return through the new renderer`);
  }
});

test("no standalone HTML companion experiments remain in the website repository", () => {
  const html = walk(root).filter((file) => file.endsWith(".html") && !file.includes(`${path.sep}node_modules${path.sep}`) && !file.includes(`${path.sep}.next${path.sep}`));
  assert.deepEqual(html, []);
});

test("companion reaction contract preserves all four public lifecycle meanings", () => {
  const contract = read("lib/companion-contract.ts");
  assert.ok(contract.includes('kind === "whisper" || kind === "drop_pulse"'));
  assert.ok(contract.includes('return "watching"'));
  assert.ok(contract.includes('kind === "echo" || kind === "queue"'));
  assert.ok(contract.includes('return "echo"'));
  assert.ok(contract.includes('if (kind === "manifested") return "manifested"'));
  assert.ok(contract.includes('if (kind === "vanished") return "vanished"'));
  assert.equal(contract.includes('kind === "manifested" || kind === "echo"'), false);
});

test("legacy companion cosmetics cannot return through active persistence", () => {
  const loadout = read("lib/avatar-loadout.ts");
  for (const retired of [
    "radar-drone",
    "signal-orb",
    "mini-beacon",
    "AVATAR_BASES",
    "AVATAR_HAIR",
    "AVATAR_OUTFITS",
    "AVATAR_GEAR",
    "AVATAR_AURAS",
    "AVATAR_BACKGROUNDS",
    "tcgStyle",
  ]) assert.equal(loadout.includes(retired), false, `${retired} should not exist in active companion persistence`);
  assert.ok(loadout.includes('companion: "koru"'));
  assert.ok(loadout.includes("normalizeCompanionId(raw.companion)"));
});

test("profile picture language stays separate from Koru and Friends companions", () => {
  const picker = read("components/avatar-picker.tsx");
  assert.ok(picker.includes("Profile picture"));
  assert.ok(picker.includes("separate from your Koru &amp; Friends companion"));
  assert.ok(picker.includes("Preset profile images"));
  assert.equal(picker.includes("Choose your signal."), false);
  assert.equal(picker.includes("FateDrop avatar</span>"), false);
});

test("dashboard selector exposes five active slots and profile renders the real companion", () => {
  const selector = read("components/companion-selector.tsx");
  const page = read("app/dashboard/avatar/page.tsx");
  const profile = read("app/dashboard/profile/page.tsx");
  assert.ok(selector.includes("ACTIVE_COMPANION_ROSTER.map"));
  assert.ok(selector.includes("5 ACTIVE SLOTS"));
  assert.ok(selector.includes("Registered character packs render as live 3D previews"));
  assert.ok(page.includes("Koru, Fenn, Aeris, Nyxen or Solix"));
  assert.ok(page.includes("LEGACY_COMPANION_ARCHIVE"));
  assert.equal(page.includes("AvatarBuilder"), false);
  assert.ok(profile.includes("CompanionRenderer"));
  assert.equal(profile.includes("AvatarPreview"), false);
});
