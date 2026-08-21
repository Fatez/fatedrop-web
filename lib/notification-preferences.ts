import { fateDropPostgres } from "@/lib/postgres";

export type NotificationPreferences = {
  echo: boolean;
  manifested: boolean;
  vanished: boolean;
  priceChange: boolean;
  fateMatch: boolean;
  web: boolean;
  push: boolean;
  discord: boolean;
  quietHours: boolean;
  quietStart: string | null;
  quietEnd: string | null;
  timezone: string;
  updatedAt: number;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  echo: true,
  manifested: true,
  vanished: false,
  priceChange: true,
  fateMatch: true,
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
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: timezone }).format(0);
    return true;
  } catch {
    return false;
  }
}

function mapPreferences(row: Record<string, unknown>): NotificationPreferences {
  const timezone = String(row.timezone || "Europe/London");
  return {
    echo: Boolean(row.echo_enabled), manifested: Boolean(row.manifested_enabled), vanished: Boolean(row.vanished_enabled),
    priceChange: Boolean(row.price_change_enabled), fateMatch: Boolean(row.fate_match_enabled), web: Boolean(row.web_enabled),
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
    user_id,echo_enabled,manifested_enabled,vanished_enabled,price_change_enabled,fate_match_enabled,
    web_enabled,push_enabled,discord_enabled,quiet_hours_enabled,quiet_hours_start,quiet_hours_end,timezone,updated_at
  ) VALUES (
    ${userId},${preferences.echo},${preferences.manifested},${preferences.vanished},${preferences.priceChange},${preferences.fateMatch},
    ${preferences.web},${preferences.push},${preferences.discord},${preferences.quietHours},${preferences.quietStart},${preferences.quietEnd},${preferences.timezone},${preferences.updatedAt}
  ) ON CONFLICT (user_id) DO UPDATE SET
    echo_enabled=EXCLUDED.echo_enabled, manifested_enabled=EXCLUDED.manifested_enabled, vanished_enabled=EXCLUDED.vanished_enabled,
    price_change_enabled=EXCLUDED.price_change_enabled, fate_match_enabled=EXCLUDED.fate_match_enabled,
    web_enabled=EXCLUDED.web_enabled, push_enabled=EXCLUDED.push_enabled, discord_enabled=EXCLUDED.discord_enabled,
    quiet_hours_enabled=EXCLUDED.quiet_hours_enabled, quiet_hours_start=EXCLUDED.quiet_hours_start, quiet_hours_end=EXCLUDED.quiet_hours_end,
    timezone=EXCLUDED.timezone, updated_at=EXCLUDED.updated_at RETURNING *`;
  return rows[0] ? mapPreferences(rows[0] as Record<string, unknown>) : preferences;
}
