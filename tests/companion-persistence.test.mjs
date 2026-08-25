import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const read = (file) => fs.readFileSync(file, "utf8");

test("development companion selection follows the file-backed account store", async () => {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), "fatedrop-companion-"));
  const file = path.join(directory, "avatars.json");
  const previousMode = process.env.FATEDROP_ACCOUNT_STORE;
  const previousFile = process.env.FATEDROP_AVATAR_FILE;

  process.env.FATEDROP_ACCOUNT_STORE = "file";
  process.env.FATEDROP_AVATAR_FILE = file;

  try {
    const storage = await import(`../lib/avatar-storage.ts?companion-persistence=${Date.now()}`);
    const saved = await storage.saveUserAvatar("local-test-user", { companion: "nyxen" }, ["pokemon"], 1234);
    assert.equal(saved.loadout.companion, "nyxen");

    const loaded = await storage.getUserAvatar("local-test-user");
    assert.equal(loaded?.loadout.companion, "nyxen");
    assert.deepEqual(loaded?.favouriteTcgs, ["pokemon"]);
    assert.equal(loaded?.updatedAt, 1234);
  } finally {
    if (previousMode === undefined) delete process.env.FATEDROP_ACCOUNT_STORE;
    else process.env.FATEDROP_ACCOUNT_STORE = previousMode;
    if (previousFile === undefined) delete process.env.FATEDROP_AVATAR_FILE;
    else process.env.FATEDROP_AVATAR_FILE = previousFile;
    await fsp.rm(directory, { recursive: true, force: true });
  }
});

test("registered Koru and Fenn use live WebGL assets and never substitute homepage campaign artwork", () => {
  const renderer = read("components/companion-renderer.tsx");
  const contract = read("lib/companion-contract.ts");
  assert.equal(renderer.includes("KoruMascot"), false);
  assert.ok(renderer.includes("Never substitute campaign/homepage artwork"));
  assert.ok(renderer.includes("CompanionWebglModel"));
  assert.ok(renderer.includes("CompanionPlaceholder"));
  assert.ok(contract.includes('modelUrl: "/assets/companions/koru/koru.glb"'));
  assert.ok(contract.includes('modelUrl: "/assets/companions/fenn/fenn.glb"'));
});

test("local companion persistence files stay out of source control", () => {
  const ignore = read(".gitignore");
  assert.ok(ignore.includes("/data/fatedrop-avatars.json"));
  assert.ok(ignore.includes("/data/fatedrop-avatars.json.*.tmp"));
});
