import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { DiscordSyncButton } from "@/components/discord-sync-button";
import { DiscordUnlinkButton } from "@/components/discord-unlink-button";
import { getCurrentSnapshot } from "@/lib/auth";
import { DISCORD_COMMUNITY_OPEN, DISCORD_INVITE_URL, hasPremiumAccess, membershipLabel } from "@/lib/membership";

export const metadata: Metadata = { title: "Discord | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardDiscordPage() {
  const snapshot = await getCurrentSnapshot();
  const linked = Boolean(snapshot?.discord);
  const premium = snapshot ? hasPremiumAccess(snapshot.membership) : false;
  const plan = snapshot ? membershipLabel(snapshot.membership) : "Free Network Member";

  return (
    <DashboardPageShell title="Discord" eyebrow="COMMUNITY + PREMIUM ACCESS">
      <div className="fd-discord-page">
        <section className="fd-dash-card fd-discord-hero">
          <div className="fd-dash-card-head"><span>FATEDROP DISCORD</span><i className="live">● COMMUNITY OPEN</i></div>
          <div className="fd-discord-hero-grid">
            <div><span className="fd-discord-kicker">FREE COMMUNITY</span><h1>Everyone can join.<br/><em>Premium intelligence stays gated.</em></h1><p>The FateDrop Discord community is open to every member. Premium signal channels are separate and only unlock when FateDrop verifies an active Plus/Pro membership or eligible trial.</p></div>
            <div className="fd-discord-access-card"><span>YOUR ACCESS</span><strong>{premium ? "PREMIUM UNLOCKED" : "COMMUNITY ACCESS"}</strong><small>{plan}</small><div className="fd-discord-access-line"><i data-on="true"/>Public community</div><div className="fd-discord-access-line"><i data-on={premium ? "true" : "false"}/>Premium signal channels</div></div>
          </div>
        </section>

        <div className="fd-discord-steps">
          <section className="fd-dash-card fd-discord-step"><span className="fd-discord-number">01</span><small>JOIN THE SERVER</small><h2>Enter the FateDrop community.</h2><p>Joining Discord is free. This gives access to the public community areas only; it does not grant Premium channels.</p>{DISCORD_COMMUNITY_OPEN ? <a className="fd-dashboard-wide-button" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">Join FateDrop Discord →</a> : <span className="fd-discord-held">Community invites currently held</span>}</section>

          <section className="fd-dash-card fd-discord-step"><span className="fd-discord-number">02</span><small>LINK YOUR IDENTITY</small><h2>{linked ? "Discord linked to FateDrop." : "Connect Discord to your account."}</h2><p>{linked ? "Your Discord identity is linked. FateDrop can now keep your server role aligned with your membership automatically." : "Linking tells the FateDrop bot which Discord member belongs to this account. Linking alone never grants Premium access."}</p>{linked ? <div className="fd-discord-actions"><DiscordSyncButton/><DiscordUnlinkButton/></div> : <a className="button button-primary" href="/api/discord/connect">Link Discord account ↗</a>}</section>

          <section className="fd-dash-card fd-discord-step fd-discord-premium"><span className="fd-discord-number">03</span><small>PREMIUM ROLE</small><h2>{premium ? "Your membership qualifies." : "Premium channels are locked."}</h2><p>{premium ? "FateDrop will apply the Premium Discord role to your linked account. If your membership ends or becomes ineligible, the role is removed automatically." : "Upgrade to FateDrop Plus or Pro to unlock premium stock signals and gated Discord intelligence. Free members remain welcome in the public server."}</p>{premium ? (linked ? <DiscordSyncButton/> : <a className="button button-primary" href="/api/discord/connect">Link Discord to unlock →</a>) : <Link className="fd-dashboard-wide-button" href="/dashboard/membership">View membership options →</Link>}</section>
        </div>
      </div>
      <style>{`
        .fd-discord-page{display:grid;gap:22px;padding-bottom:30px}.fd-discord-hero{padding:32px;overflow:hidden;background:radial-gradient(circle at 90% 10%,rgba(88,232,255,.08),transparent 28%),radial-gradient(circle at 65% 100%,rgba(157,109,255,.11),transparent 34%),rgba(12,10,18,.9)}.fd-discord-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:34px;align-items:center;margin-top:20px}.fd-discord-kicker{color:#70e8fb;font-size:9px;font-weight:900;letter-spacing:.17em}.fd-discord-hero h1{margin:10px 0 16px;font-size:clamp(2.3rem,4vw,4.3rem);line-height:.94;letter-spacing:-.055em}.fd-discord-hero h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#a8edff,#c09cff);-webkit-background-clip:text;color:transparent}.fd-discord-hero p{max-width:720px;color:#a29ca9;font-size:14px;line-height:1.7}.fd-discord-access-card{padding:22px;border:1px solid rgba(157,109,255,.22);border-radius:18px;background:linear-gradient(145deg,rgba(157,109,255,.09),rgba(88,232,255,.035));box-shadow:inset 0 1px rgba(255,255,255,.04)}.fd-discord-access-card>span{display:block;color:#827b8b;font-size:8px;font-weight:900;letter-spacing:.14em}.fd-discord-access-card>strong{display:block;margin:8px 0 3px;font-size:18px}.fd-discord-access-card>small{color:#9d96a3;font-size:10px}.fd-discord-access-line{display:flex;align-items:center;gap:9px;margin-top:15px;color:#c4beca;font-size:11px}.fd-discord-access-line i{width:8px;height:8px;border-radius:50%;background:#5c5761;box-shadow:0 0 0 3px rgba(255,255,255,.025)}.fd-discord-access-line i[data-on="true"]{background:#62e9aa;box-shadow:0 0 13px rgba(98,233,170,.35)}.fd-discord-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.fd-discord-step{min-height:310px;padding:24px;display:flex;flex-direction:column}.fd-discord-number{color:#9d6dff;font-size:11px;font-weight:900}.fd-discord-step>small{margin-top:7px;color:#746e7b;font-size:8px;font-weight:900;letter-spacing:.14em}.fd-discord-step h2{margin:16px 0 10px;font-size:22px;line-height:1.08}.fd-discord-step p{margin:0 0 20px;color:#98919f;font-size:12px;line-height:1.65}.fd-discord-step>.fd-dashboard-wide-button,.fd-discord-step>.button,.fd-discord-actions{margin-top:auto}.fd-discord-actions{display:grid;gap:8px}.fd-discord-premium{border-color:${premium ? "rgba(95,240,162,.2)" : "rgba(157,109,255,.16)"}}.fd-discord-held{margin-top:auto;color:#827b88;font-size:11px}@media(max-width:1050px){.fd-discord-steps{grid-template-columns:1fr}.fd-discord-step{min-height:auto}.fd-discord-hero-grid{grid-template-columns:1fr}.fd-discord-access-card{max-width:440px}}@media(max-width:650px){.fd-discord-hero{padding:22px}.fd-discord-hero h1{font-size:2.35rem}}
      `}</style>
    </DashboardPageShell>
  );
}
