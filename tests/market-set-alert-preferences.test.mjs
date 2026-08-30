import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { notificationPreferencesAllowAlert } = require("../lib/alert-preference-filter.ts");
const { DEFAULT_NOTIFICATION_PREFERENCES, normalizeSelectedSetKeys } = require("../lib/notification-preferences.ts");

const preferencesSource = await readFile(new URL("../lib/notification-preferences.ts", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../app/api/notification-preferences/route.ts", import.meta.url), "utf8");
const formSource = await readFile(new URL("../components/notification-preference-form.tsx", import.meta.url), "utf8");
const liveSource = await readFile(new URL("../lib/live-signals.ts", import.meta.url), "utf8");
const pushSource = await readFile(new URL("../lib/canonical-push.ts", import.meta.url), "utf8");
const migrationSource = await readFile(new URL("../database/2026-08-30-alert-market-set-preferences.sql", import.meta.url), "utf8");
const productionMigrations = await readFile(new URL("../lib/production-migrations.ts", import.meta.url), "utf8");

function alert({ languageGroup = "japanese", setKey = "pokemon-151" } = {}) {
  return {
    fateStage: "MANIFESTED",
    productIntelligence: { category: "SEALED_TCG" },
    facets: { languageGroup, setKey },
  };
}

function preferences(overrides = {}) {
  return { ...DEFAULT_NOTIFICATION_PREFERENCES, selectedSetKeys: [], ...overrides };
}

test("market preferences keep Japanese, Korean and both Chinese markets independently selectable", () => {
  assert.equal(notificationPreferencesAllowAlert(alert(), preferences()), true);
  assert.equal(notificationPreferencesAllowAlert(alert(), preferences({ japanese: false })), false);
  assert.equal(notificationPreferencesAllowAlert(alert({ languageGroup: "korean" }), preferences({ korean: false })), false);
  assert.equal(notificationPreferencesAllowAlert(alert({ languageGroup: "simplified_chinese" }), preferences({ simplifiedChinese: false })), false);
  assert.equal(notificationPreferencesAllowAlert(alert({ languageGroup: "traditional_chinese" }), preferences({ traditionalChinese: false })), false);
  assert.equal(notificationPreferencesAllowAlert(alert({ languageGroup: "unknown" }), preferences({ unknownLanguage: false })), false);
});

test("set preferences distinguish selected and unknown sets without inventing a match", () => {
  assert.equal(notificationPreferencesAllowAlert(alert(), preferences({ allSets: false, selectedSetKeys: ["pokemon-151"] })), true);
  assert.equal(notificationPreferencesAllowAlert(alert(), preferences({ allSets: false, selectedSetKeys: ["destined-rivals"] })), false);
  assert.equal(notificationPreferencesAllowAlert(alert({ setKey: null }), preferences({ allSets: false, unknownSets: true })), true);
  assert.equal(notificationPreferencesAllowAlert(alert({ setKey: null }), preferences({ allSets: false, unknownSets: false })), false);
});

test("selected set keys are bounded, normalized and reject unsafe values", () => {
  assert.deepEqual(normalizeSelectedSetKeys(["Pokemon-151", "pokemon-151", "../bad", 42]), ["pokemon-151"]);
  assert.equal(normalizeSelectedSetKeys(Array.from({ length: 250 }, (_, index) => `set-${index}`)).length, 200);
});

test("Web and push persist and enforce the same market and set record", () => {
  for (const column of [
    "english_enabled", "japanese_enabled", "korean_enabled", "simplified_chinese_enabled", "traditional_chinese_enabled",
    "other_languages_enabled", "unknown_language_enabled", "all_sets_enabled", "selected_set_keys", "unknown_sets_enabled",
  ]) {
    assert.match(preferencesSource, new RegExp(column));
    assert.match(migrationSource, new RegExp(column));
  }
  assert.match(routeSource, /normalizeSelectedSetKeys/);
  assert.match(routeSource, /Choose at least one set or keep unknown sets enabled/);
  assert.match(pushSource, /facetEnabled\(alert\.facets, recipient\)/);
  assert.match(pushSource, /!alert\.interruptEligible/);
  assert.match(pushSource, /selected_set_keys/);
  assert.match(productionMigrations, /2026-08-30-alert-market-set-preferences\.sql/);
});

test("preference UI obtains the canonical facet registry from Cloud", () => {
  assert.match(liveSource, /"\/api\/alert-facets"/);
  assert.match(formSource, /COLLECTOR MARKET \/ LANGUAGE/);
  assert.match(formSource, /All recognised sets/);
  assert.match(formSource, /Unknown sets/);
  assert.match(formSource, /facetOptions\.sets\.map/);
});
