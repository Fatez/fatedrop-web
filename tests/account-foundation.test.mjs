import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const tempDirectory = await mkdtemp(path.join(tmpdir(), "fatedrop-accounts-"));
process.env.FATEDROP_ACCOUNT_STORE = "file";
process.env.FATEDROP_ACCOUNT_FILE = path.join(tempDirectory, "accounts.json");

const storage = await import("../lib/account-storage.ts");
const membership = await import("../lib/membership.ts");

test("FateDrop ID storage preserves profile, membership age and Discord link state", async () => {
  const now = Math.floor(Date.now() / 1000) - (12 * 86_400);
  const account = {
    id: "test-user",
    fateId: "FD-TEST000001",
    email: "member@example.test",
    passwordHash: "test-only-hash",
    displayName: "Sample Collector",
    username: "sample_collector",
    bio: null,
    avatarUrl: null,
    primaryTcg: "Pokémon TCG",
    collectorStyle: "Sealed collector",
    region: "South East",
    profileTheme: "signal",
    createdAt: now,
    updatedAt: now,
  };

  try {
    let snapshot = await storage.createAccount(account);
    assert.equal(snapshot.membership.status, "free");
    assert.match(membership.networkAge(snapshot.account.createdAt), /12 days/);

    await storage.updateMembership(account.id, { tier: "plus", status: "trialing", trialEndsAt: now + (14 * 86_400) });
    snapshot = await storage.getAccountSnapshot(account.id);
    assert.equal(membership.hasPremiumAccess(snapshot.membership), true);

    await storage.saveDiscordLink({ userId: account.id, discordUserId: "discord-1", discordUsername: "SampleDiscord", discordAvatar: null, connectedAt: now, roleSyncedAt: null });
    snapshot = await storage.getAccountSnapshot(account.id);
    assert.equal(snapshot.discord.discordUsername, "SampleDiscord");

    await storage.removeDiscordLink(account.id);
    snapshot = await storage.getAccountSnapshot(account.id);
    assert.equal(snapshot.discord, null);
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
});
