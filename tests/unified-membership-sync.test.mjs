import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const membership = fs.readFileSync("lib/membership.ts", "utf8");
const discord = fs.readFileSync("lib/discord.ts", "utf8");
const webhook = fs.readFileSync("app/api/billing/webhook/route.ts", "utf8");
const mobileSync = fs.readFileSync("app/api/mobile/sync/route.ts", "utf8");
const profile = fs.readFileSync("app/api/account/profile/route.ts", "utf8");

test("FateDrop trial is seven days", () => {
  assert.match(membership, /TRIAL_DAYS = 7/);
});

test("one FateDrop ID username and entitlement are emitted to mobile", () => {
  assert.match(profile, /username: snapshot\.account\.username/);
  assert.match(mobileSync, /handle: snapshot\.account\.username/);
  assert.match(mobileSync, /displayName: snapshot\.account\.displayName/);
  assert.match(mobileSync, /effectiveTier: effectiveTier\(snapshot\.membership\)/);
  assert.match(mobileSync, /capabilities: \[\.\.\.capabilitiesForMembership\(snapshot\.membership\)\]/);
});

test("Discord linking requests guild access and billing events resync Premium role", () => {
  assert.match(discord, /scope: "identify guilds\.join"/);
  assert.match(discord, /ensureDiscordGuildMember/);
  assert.match(discord, /\/guilds\/\$\{guildId\}\/members\/\$\{discordUserId\}/);
  assert.match(discord, /syncPremiumDiscordRole/);
  assert.match(webhook, /syncPremiumDiscordRole/);
  assert.match(webhook, /customer\.subscription\./);
  assert.match(webhook, /await syncUser\(userId\)/);
});
