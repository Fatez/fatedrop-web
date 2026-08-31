import { fateDropPostgres } from "@/lib/postgres";

export const LIFECYCLE_MARKET_GROUPS = ["english", "japanese", "korean", "simplified_chinese", "traditional_chinese"] as const;
export type LifecycleMarketGroup = typeof LIFECYCLE_MARKET_GROUPS[number];
export type LifecycleMarketSelection = "all" | LifecycleMarketGroup[];
export type LifecycleMarketPreferences = Record<"whisper" | "echo" | "manifested" | "vanished", LifecycleMarketSelection>;

export type NotificationPreferences = {
  whisper: boolean;
  echo: boolean;
  manifested: boolean;
  vanished: boolean;
  priceChange: boolean;
  fateMatch: boolean;
  manifestedReminders: boolean;
  manifestedRemindersMaxPerDay: number;
  sealedTcg: boolean;
  singleCards: boolean;
  accessories: boolean;
  merchandise: boolean;
  unknownProducts: boolean;
  english: boolean;
  japanese: boolean;
  korean: boolean;
  simplifiedChinese: boolean;
  traditionalChinese: boolean;
  otherLanguages: boolean;
  unknownLanguage: boolean;
  lifecycleMarkets: LifecycleMarketPreferences;
  allSets: boolean;
  selectedSetKeys: string[];
  unknownSets: boolean;
  web: boolean;
  push: boolean;
  discord: boolean;
  quietHours: boolean;
  quietStart: string | null;
  quietEnd: string | null;
  timezone: string;
  updatedAt: number;
};

export const DEFAULT_LIFECYCLE_MARKETS: LifecycleMarketPreferences = {
  whisper: "all",
  echo: "all",
  manifested: "all",
  vanished: "all",
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  whisper: true,
  echo: true,
  manifested: true,
  vanished: true,
  priceChange: true,
  fateMatch: true,
  manifestedReminders: false,
  manifestedRemindersMaxPerDay: 1,
  sealedTcg: true,
  singleCards: true,
  accessories: false,
  merchandise: false,
  unknownProducts: true,
  english: true,
  japanese: true,
  korean: true,
  simplifiedChinese: true,
  traditionalChinese: true,
  otherLanguages: true,
  unknownLanguage: true,
  lifecycleMarkets: DEFAULT_LIFECYCLE_MARKETS,
  allSets: true,
  selectedSetKeys: [],
  unknownSets: true,
  web: true,
  push: true,
  discord: false,
  quietHours: false,
  quietStart: null,
  quietEnd: null,
  timezone: "Europe/London",
  updatedAt: 0,
};

export function isValidIanaTimezone(value: string) {
  const timezone = value.trim();
  if (!timezone || timezone.length > 80) return false;
  try { new Intl.DateTimeFormat("en-GB", { timeZone: timezone }).format(0); return true; }
  catch { return false; }
}

function lifecyclePreference(value: unknown) {
  return value == null ? true : Boolean(value);
}

const lifecycleMarketStages = ["whisper", "echo", "manifested", "vanished"] as const;
const lifecycleMarketGroups = new Set<string>(LIFECYCLE_MARKET_GROUPS);

export function normalizeLifecycleMarkets(value: unknown, fallback: LifecycleMarketPreferences = DEFAULT_LIFECYCLE_MARKETS): LifecycleMarketPreferences {
  let parsed = value;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { parsed = null; }
  }
  const input = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  const next = { ...fallback };
  for (const stage of lifecycleMarketStages) {
    const raw = input[stage];
    if (raw === "all") { next[stage] = "all"; continue; }
    if (!Array.isArray(raw)) continue;
    const groups = [...new Set(raw.filter((item): item is LifecycleMarketGroup => typeof item === "string" && lifecycleMarketGroups.has(item)))];
    if (groups.length) next[stage] = groups;
  }
  return next;
}

const setKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSelectedSetKeys(value: unknown) {
  let values: unknown = value;
  if (typeof values === "string") {
    try { values = JSON.parse(values); } catch { return []; }
  }
  if (!Array.isArray(values)) return [];
  return [...new Set(values
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length <= 120 && setKeyPattern.test(item)))]
    .slice(0, 200);
}

function mapPreferences(row: Record<string, unknown>): NotificationPreferences {
  const timezone = String(row.timezone || "Europe/London");
  return {
    // The four public lifecycle stages are one contract: absent/legacy values
    // all inherit the same enabled-by-default behaviour.
    whisper: lifecyclePreference(row.whisper_enabled),
    echo: lifecyclePreference(row.echo_enabled),
    manifested: lifecyclePreference(row.manifested_enabled),
    vanished: lifecyclePreference(row.vanished_enabled),
    priceChange: Boolean(row.price_change_enabled), fateMatch: Boolean(row.fate_match_enabled),
    manifestedReminders: row.manifested_reminders_enabled == null ? false : Boolean(row.manifested_reminders_enabled),
    manifestedRemindersMaxPerDay: Math.max(0,Math.min(3,Number(row.manifested_reminders_max_per_day ?? 1))),
    sealedTcg: row.sealed_tcg_enabled == null ? true : Boolean(row.sealed_tcg_enabled),
    singleCards: row.single_cards_enabled == null ? true : Boolean(row.single_cards_enabled),
    accessories: row.accessories_enabled == null ? false : Boolean(row.accessories_enabled),
    merchandise: row.merchandise_enabled == null ? false : Boolean(row.merchandise_enabled),
    unknownProducts: row.unknown_products_enabled == null ? true : Boolean(row.unknown_products_enabled),
    english: row.english_enabled == null ? true : Boolean(row.english_enabled),
    japanese: row.japanese_enabled == null ? true : Boolean(row.japanese_enabled),
    korean: row.korean_enabled == null ? true : Boolean(row.korean_enabled),
    simplifiedChinese: row.simplified_chinese_enabled == null ? true : Boolean(row.simplified_chinese_enabled),
    traditionalChinese: row.traditional_chinese_enabled == null ? true : Boolean(row.traditional_chinese_enabled),
    otherLanguages: row.other_languages_enabled == null ? true : Boolean(row.other_languages_enabled),
    unknownLanguage: row.unknown_language_enabled == null ? true : Boolean(row.unknown_language_enabled),
    lifecycleMarkets: normalizeLifecycleMarkets(row.lifecycle_market_preferences),
    allSets: row.all_sets_enabled == null ? true : Boolean(row.all_sets_enabled),
    selectedSetKeys: normalizeSelectedSetKeys(row.selected_set_keys),
    unknownSets: row.unknown_sets_enabled == null ? true : Boolean(row.unknown_sets_enabled),
    web: Boolean(row.web_enabled),
    push: Boolean(row.push_enabled), discord: Boolean(row.discord_enabled), quietHours: Boolean(row.quiet_hours_enabled),
    quietStart: row.quiet_hours_start == null ? null : String(row.quiet_hours_start), quietEnd: row.quiet_hours_end == null ? null : String(row.quiet_hours_end),
    timezone: isValidIanaTimezone(timezone) ? timezone : DEFAULT_NOTIFICATION_PREFERENCES.timezone, updatedAt: Number(row.updated_at || 0),
  };
}

export async function getNotificationPreferences(userId: string) {
  const sql = await fateDropPostgres();
  const rows = await sql`SELECT * FROM fatedrop_notification_preferences WHERE user_id=${userId}`;
  return rows[0] ? mapPreferences(rows[0] as Record<string, unknown>) : DEFAULT_NOTIFICATION_PREFERENCES;
}

export async function saveNotificationPreferences(userId: string, preferences: NotificationPreferences) {
  const sql = await fateDropPostgres();
  const rows = await sql`INSERT INTO fatedrop_notification_preferences (
    user_id,whisper_enabled,echo_enabled,manifested_enabled,vanished_enabled,price_change_enabled,fate_match_enabled,manifested_reminders_enabled,manifested_reminders_max_per_day,
    sealed_tcg_enabled,single_cards_enabled,accessories_enabled,merchandise_enabled,unknown_products_enabled,
    english_enabled,japanese_enabled,korean_enabled,simplified_chinese_enabled,traditional_chinese_enabled,other_languages_enabled,unknown_language_enabled,
    lifecycle_market_preferences,all_sets_enabled,selected_set_keys,unknown_sets_enabled,
    web_enabled,push_enabled,discord_enabled,quiet_hours_enabled,quiet_hours_start,quiet_hours_end,timezone,updated_at
  ) VALUES (
    ${userId},${preferences.whisper},${preferences.echo},${preferences.manifested},${preferences.vanished},${preferences.priceChange},${preferences.fateMatch},${preferences.manifestedReminders},${preferences.manifestedRemindersMaxPerDay},
    ${preferences.sealedTcg},${preferences.singleCards},${preferences.accessories},${preferences.merchandise},${preferences.unknownProducts},
    ${preferences.english},${preferences.japanese},${preferences.korean},${preferences.simplifiedChinese},${preferences.traditionalChinese},${preferences.otherLanguages},${preferences.unknownLanguage},
    ${JSON.stringify(preferences.lifecycleMarkets)}::jsonb,${preferences.allSets},${JSON.stringify(preferences.selectedSetKeys)}::jsonb,${preferences.unknownSets},
    ${preferences.web},${preferences.push},${preferences.discord},${preferences.quietHours},${preferences.quietStart},${preferences.quietEnd},${preferences.timezone},${preferences.updatedAt}
  ) ON CONFLICT (user_id) DO UPDATE SET
    whisper_enabled=EXCLUDED.whisper_enabled, echo_enabled=EXCLUDED.echo_enabled, manifested_enabled=EXCLUDED.manifested_enabled, vanished_enabled=EXCLUDED.vanished_enabled,
    price_change_enabled=EXCLUDED.price_change_enabled, fate_match_enabled=EXCLUDED.fate_match_enabled,
    manifested_reminders_enabled=EXCLUDED.manifested_reminders_enabled, manifested_reminders_max_per_day=EXCLUDED.manifested_reminders_max_per_day,
    sealed_tcg_enabled=EXCLUDED.sealed_tcg_enabled, single_cards_enabled=EXCLUDED.single_cards_enabled,
    accessories_enabled=EXCLUDED.accessories_enabled, merchandise_enabled=EXCLUDED.merchandise_enabled, unknown_products_enabled=EXCLUDED.unknown_products_enabled,
    english_enabled=EXCLUDED.english_enabled, japanese_enabled=EXCLUDED.japanese_enabled, korean_enabled=EXCLUDED.korean_enabled,
    simplified_chinese_enabled=EXCLUDED.simplified_chinese_enabled, traditional_chinese_enabled=EXCLUDED.traditional_chinese_enabled,
    other_languages_enabled=EXCLUDED.other_languages_enabled, unknown_language_enabled=EXCLUDED.unknown_language_enabled,
    lifecycle_market_preferences=EXCLUDED.lifecycle_market_preferences,
    all_sets_enabled=EXCLUDED.all_sets_enabled, selected_set_keys=EXCLUDED.selected_set_keys, unknown_sets_enabled=EXCLUDED.unknown_sets_enabled,
    web_enabled=EXCLUDED.web_enabled, push_enabled=EXCLUDED.push_enabled, discord_enabled=EXCLUDED.discord_enabled,
    quiet_hours_enabled=EXCLUDED.quiet_hours_enabled, quiet_hours_start=EXCLUDED.quiet_hours_start, quiet_hours_end=EXCLUDED.quiet_hours_end,
    timezone=EXCLUDED.timezone, updated_at=EXCLUDED.updated_at RETURNING *`;
  return rows[0] ? mapPreferences(rows[0] as Record<string, unknown>) : preferences;
}
