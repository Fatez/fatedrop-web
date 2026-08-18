import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { DiscordSyncButton } from "@/components/discord-sync-button";
import { DiscordUnlinkButton } from "@/components/discord-unlink-button";
import { getCurrentSnapshot } from "@/lib/auth";
import { DISCORD_COMMUNITY_OPEN, DISCORD_INVITE_URL, hasPremiumAccess } from "@/lib/membership";

export const metadata: Metadata = { title: "Discord | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardDiscordPage() {
  const snapshot = await getCurrentSnapshot();
  const linked = Boolean(snapshot?.discord);
  const premium = snapshot ? hasPremiumAccess(snapshot.membership) : false;
  return (
    <DashboardPageShell title="Discord" eyebrow="COMMUNITY ACCESS">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-community-card">
          <div><span>DISCORD CONNECTION</span><h2>{linked ? "Your Discord identity is linked." : "Connect Discord to FateDrop."}</h2><p>{linked ? "FateDrop can synchronise the Premium role from your current membership entitlement." : "Linking your Discord account lets FateDrop apply or remove Premium access automatically when your membership changes."}</p></div>
          {linked ? <div><DiscordSyncButton /><DiscordUnlinkButton /></div> : <a className="button button-primary" href="/api/discord/connect">Connect Discord ↗</a>}
        </section>
        <section className="fd-dash-card"><div className="fd-dash-card-head"><span>ACCESS STATUS</span><small>Membership-controlled</small></div><div className="fd-billing-facts"><span><small>ACCOUNT</small><b>{linked ? "Linked" : "Not linked"}</b></span><span><small>PREMIUM</small><b>{premium ? "Eligible" : "Locked"}</b></span><span><small>SERVER</small><b>{DISCORD_COMMUNITY_OPEN ? "Open" : "Held"}</b></span></div>{DISCORD_COMMUNITY_OPEN ? <a className="fd-dashboard-wide-button" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">Open FateDrop Discord →</a> : null}</section>
      </div>
    </DashboardPageShell>
  );
}
