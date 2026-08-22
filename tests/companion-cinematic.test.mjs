import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("live signal cinematic uses the selected Koru and Friends companion", () => {
  const cinematic = read("components/avatar-signal-cinematic.tsx");
  assert.ok(cinematic.includes("CompanionRenderer"));
  assert.ok(cinematic.includes("companionDefinition(loadout.companion)"));
  assert.ok(cinematic.includes("companionReactionFromSignal"));
  assert.equal(cinematic.includes("AvatarAnimeCharacter"), false);
  assert.equal(cinematic.includes("YOUR FATE COMPANION"), false);
});

test("live cinematic preserves final Whisper and Echo meanings", () => {
  const cinematic = read("components/avatar-signal-cinematic.tsx");
  assert.ok(cinematic.includes('signalKind === "whisper"'));
  assert.ok(cinematic.includes("Something changed around this product. I’m watching it."));
  assert.ok(cinematic.includes('signalKind === "echo" || signalKind === "queue" || signalKind === "security"'));
  assert.ok(cinematic.includes("Access conditions changed. Stock is not confirmed yet."));
  assert.ok(cinematic.includes('signalKind === "manifested"'));
  assert.ok(cinematic.includes("Purchasable availability is confirmed live."));
  assert.ok(cinematic.includes('signalKind === "vanished"'));
  assert.equal(cinematic.includes("Something just returned to the network"), false);
});
