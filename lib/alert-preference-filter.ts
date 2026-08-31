import type { CanonicalAlert } from "@/lib/canonical-alerts";
import type { LifecycleMarketGroup, NotificationPreferences } from "@/lib/notification-preferences";
import { productAlertEnabled } from "@/lib/product-alert-intelligence";

function stageEnabled(alert: CanonicalAlert, preferences: NotificationPreferences) {
  if (alert.fateStage === "WHISPER") return preferences.whisper;
  if (alert.fateStage === "ECHO") return preferences.echo;
  if (alert.fateStage === "MANIFESTED") return preferences.manifested;
  if (alert.fateStage === "VANISHED") return preferences.vanished;
  return false;
}

function languageEnabled(alert: CanonicalAlert, preferences: NotificationPreferences) {
  if (alert.facets.languageGroup === "english") return preferences.english;
  if (alert.facets.languageGroup === "japanese") return preferences.japanese;
  if (alert.facets.languageGroup === "korean") return preferences.korean;
  if (alert.facets.languageGroup === "simplified_chinese") return preferences.simplifiedChinese;
  if (alert.facets.languageGroup === "traditional_chinese") return preferences.traditionalChinese;
  if (alert.facets.languageGroup === "other") return preferences.otherLanguages;
  return preferences.unknownLanguage;
}

function lifecycleMarketEnabled(alert: CanonicalAlert, preferences: NotificationPreferences) {
  const stage = alert.fateStage.toLowerCase() as keyof NotificationPreferences["lifecycleMarkets"];
  const selection = preferences.lifecycleMarkets[stage];
  if (selection === "all") return true;

  // Market is canonical product identity metadata, not a synonym for language.
  // During the v1 -> v2 rollout, or for candidate/conflict/unknown resolutions,
  // an explicit market filter must fail closed rather than guess from wording.
  if (alert.facets.version < 2) return false;
  if (alert.facets.marketStatus !== "verified" && alert.facets.marketStatus !== "reused") return false;
  const group = alert.facets.marketGroup;
  if (!group || !(["english", "japanese", "korean", "simplified_chinese", "traditional_chinese"] as string[]).includes(group)) return false;
  return selection.includes(group as LifecycleMarketGroup);
}

function setEnabled(alert: CanonicalAlert, preferences: NotificationPreferences) {
  if (preferences.allSets) return true;
  if (!alert.facets.setKey) return preferences.unknownSets;
  return preferences.selectedSetKeys.includes(alert.facets.setKey);
}

export function notificationPreferencesAllowAlert(
  alert: CanonicalAlert,
  preferences: NotificationPreferences,
) {
  return stageEnabled(alert, preferences)
    && productAlertEnabled(alert.productIntelligence, preferences)
    && languageEnabled(alert, preferences)
    && lifecycleMarketEnabled(alert, preferences)
    && setEnabled(alert, preferences);
}
