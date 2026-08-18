import test from "node:test";
import assert from "node:assert/strict";
import { avatarPresetPath, normalizeAvatarValue } from "../lib/avatar.ts";

test("FateDrop preset avatar paths are accepted exactly", () => {
  const path = avatarPresetPath("signal-hood");
  assert.equal(normalizeAvatarValue(path).value, path);
  assert.ok(normalizeAvatarValue("/assets/avatars/not-a-preset.webp").error);
});

test("custom compressed WebP data URLs are accepted within the profile cap", () => {
  const avatar = `data:image/webp;base64,${Buffer.from("fatedrop-avatar").toString("base64")}`;
  assert.equal(normalizeAvatarValue(avatar).value, avatar);
});

test("unsafe avatar protocols are rejected", () => {
  assert.ok(normalizeAvatarValue("http://example.com/avatar.png").error);
  assert.ok(normalizeAvatarValue("javascript:alert(1)").error);
});

test("removing an avatar normalizes to null", () => {
  assert.equal(normalizeAvatarValue("   ").value, null);
});
