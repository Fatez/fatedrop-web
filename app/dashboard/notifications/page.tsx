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
      <section className="fd-dash-card fd-notification-hero">
        <div className="fd-dash-card-head"><span>SHARED DELIVERY MODEL</span><i className={persistent ? "live" : "pending"}>{persistent ? "● PERSISTENT" : "○ MIGRATION READY"}</i></div>
        <h1>FateDrop can watch broadly.<br/><em>You choose what deserves your attention.</em></h1>
        <p>These preferences control interruption, not the underlying network evidence. Choose the lifecycle stages, price movement and FateMatch events that matter to you, then let the same account preference record feed supported Website, App and Discord delivery.</p>
        <div className="fd-notification-path"><span><b>1</b><strong>FATEDROP OBSERVES</strong><small>The network keeps collecting evidence.</small></span><i>→</i><span><b>2</b><strong>YOUR RULES FILTER</strong><small>Only the signal types you care about qualify.</small></span><i>→</i><span><b>3</b><strong>CHANNEL DELIVERS</strong><small>Web, App or Discord where enabled.</small></span></div>
        {!persistent ? <small>Apply `database/2026-08-19-user-preferences.sql` before these settings can persist in production.</small> : null}
      </section>
      <section className="fd-dash-card fd-notification-editor"><div className="fd-notification-editor-head"><span>YOUR ALERT RULES</span><h2>Tell FateDrop what is worth interrupting you for.</h2><p>You can keep broad visibility in the Alerts ledger while narrowing the notifications that actively reach you.</p></div><NotificationPreferenceForm initial={preferences} persistent={persistent}/></section>
    </div>
    <style>{`
      .fd-notification-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-notification-page .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0e1216,#090d11 74%)}.fd-notification-hero,.fd-notification-editor{padding:28px}.fd-notification-hero{background:radial-gradient(circle at 90% 4%,rgba(126,87,143,.14),transparent 28%),linear-gradient(145deg,#101419,#090d11 70%)!important}.fd-notification-hero h1{max-width:980px;margin:18px 0 12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4vw,4.7rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.fd-notification-hero h1 em{font-style:normal;color:#bca8bd}.fd-notification-hero p{max-width:920px;color:#a0989d;line-height:1.75}.fd-notification-hero>small{display:block;margin-top:12px;color:#b49bc0}.fd-notification-path{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:8px;align-items:center;margin-top:22px}.fd-notification-path>span{min-height:82px;padding:12px;border:1px solid rgba(221,203,188,.065);border-radius:9px;background:rgba(255,255,255,.015);display:grid;grid-template-columns:25px 1fr;gap:3px 8px;align-content:center}.fd-notification-path b{grid-row:1/3;width:25px;height:25px;display:grid;place-items:center;border:1px solid rgba(183,151,125,.18);border-radius:7px;color:#c1a17e}.fd-notification-path strong{font-size:10px;letter-spacing:.07em}.fd-notification-path small{color:#7d7579;font-size:10px}.fd-notification-path>i{color:#635a60;font-style:normal}.fd-notification-editor-head{margin-bottom:20px}.fd-notification-editor-head>span{color:#aa886d;font-size:10px;font-weight:900;letter-spacing:.14em}.fd-notification-editor-head h2{margin:6px 0 7px;color:#e2d8d0;font-family:Georgia,serif;font-size:24px;font-weight:500}.fd-notification-editor-head p{max-width:780px;margin:0;color:#8f878c;font-size:12px;line-height:1.65}@media(max-width:760px){.fd-notification-hero,.fd-notification-editor{padding:18px}.fd-notification-path{grid-template-columns:1fr}.fd-notification-path>i{display:none}}
    `}</style>
  </DashboardPageShell>;
}
