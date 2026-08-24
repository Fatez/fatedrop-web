import type { CanonicalAlert } from "@/lib/canonical-alerts";
import type { NotificationPreferences } from "@/lib/notification-preferences";
import { productAlertEnabled } from "@/lib/product-alert-intelligence";

function stageEnabled(alert: CanonicalAlert, preferences: NotificationPreferences) {
  if (alert.fateStage === "WHISPER") return preferences.whisper;
  if (alert.fateStage === "ECHO") return preferences.echo;
  if (alert.fateStage === "MANIFESTED") return preferences.manifested;
  if (alert.fateStage === "VANISHED") return preferences.vanished;
  return false;
}

export function notificationPreferencesAllowAlert(
  alert: CanonicalAlert,
  preferences: NotificationPreferences,
) {
  return stageEnabled(alert, preferences) && productAlertEnabled(alert.productIntelligence, preferences);
}
