import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { NotificationPreferenceForm } from "@/components/notification-preference-form";
import { getCurrentSnapshot } from "@/lib/auth";
import { DEFAULT_NOTIFICATION_PREFERENCES, getNotificationPreferences } from "@/lib/notification-preferences";

export const metadata: Metadata = { title: "Notification Preferences | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NotificationPreferencesPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/notifications");
  let preferences = DEFAULT_NOTIFICATION_PREFERENCES;
  let persistent = true;
  try { preferences = await getNotificationPreferences(snapshot.account.id); } catch { persistent = false; }
  return <DashboardPageShell title="Notification Preferences" eyebrow="ONE PROFILE · EVERY CHANNEL">
    <div className="fd-notification-page">
      <section className="fd-dash-card fd-notification-hero"><div className="fd-dash-card-head"><span>SHARED DELIVERY MODEL</span><i className={persistent ? "live" : "pending"}>{persistent ? "● PERSISTENT" : "○ MIGRATION READY"}</i></div><h1>Choose what FateDrop should tell you.<br/><em>Then choose where it should reach you.</em></h1><p>Whisper, Echo, Manifested, Vanished, price movement and FateMatch preferences live in one account model. Website, app and Discord can consume the same preference record as each delivery channel is enabled and verified.</p>{!persistent ? <small>Apply `database/2026-08-19-user-preferences.sql` before these settings can persist in production.</small> : null}</section>
      <section className="fd-dash-card fd-notification-editor"><NotificationPreferenceForm initial={preferences} persistent={persistent}/></section>
    </div>
    <style>{`.fd-notification-page{display:grid;gap:22px}.fd-notification-hero,.fd-notification-editor{padding:28px}.fd-notification-hero h1{margin:18px 0 10px;font-size:clamp(2rem,4vw,4rem);line-height:.96;letter-spacing:-.05em}.fd-notification-hero h1 em{font-style:normal;color:#9eefff}.fd-notification-hero p{max-width:900px;color:#99929f;line-height:1.7}.fd-notification-hero>small{display:block;margin-top:12px;color:#b39ac9}`}</style>
  </DashboardPageShell>;
}