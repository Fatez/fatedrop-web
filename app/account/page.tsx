import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSignOut } from "@/components/account-signout";
import { FateSignalField } from "@/components/fate-signal-field";
import { DiscordSyncButton } from "@/components/discord-sync-button";
import { DiscordUnlinkButton } from "@/components/discord-unlink-button";
import { SiteShell } from "@/components/page-shell";
import { ProfileEditor } from "@/components/profile-editor";
import { getCurrentSnapshot } from "@/lib/auth";
import { DISCORD_COMMUNITY_OPEN, DISCORD_INVITE_URL, formatMemberSince, hasPremiumAccess, membershipLabel, networkAge } from "@/lib/membership";
import { serverNowSeconds } from "@/lib/server-time";

export const metadata: Metadata = { title: "My FateDrop ID", description: "Your FateDrop profile, membership and connected network access.", robots: { index: false, follow: false } };

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function dateLabel(timestamp: number | null) {
  if (!timestamp) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }).format(new Date(timestamp * 1000));
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ billing?: string; discord?: string; welcome?: string }> }) {
  const loadedSnapshot = await getCurrentSnapshot();
  if (!loadedSnapshot) redirect("/account/login?next=/account");
  const snapshot = loadedSnapshot;
  const params = await searchParams;
  const premium = hasPremiumAccess(snapshot.membership);
  const membership = membershipLabel(snapshot.membership);
  const memberSince = formatMemberSince(snapshot.account.createdAt);
  const age = networkAge(snapshot.account.createdAt);
  const trialEnd = dateLabel(snapshot.membership.trialEndsAt);
  const discordRoleSynced = Boolean(premium && snapshot.discord?.roleSyncedAt);
  const now = serverNowSeconds();
  const networkDays = Math.max(1, Math.floor((now - snapshot.account.createdAt) / 86400) + 1);
  const discordCta = premium ? "Join Discord + unlock Premium" : "Join free Discord community";

  return (
    <SiteShell>
      <main className="fd-account-v2 section-shell">
        <section className={`fd-account-hero theme-${snapshot.account.profileTheme}`}>
          <FateSignalField variant="radar" className="account-radar-field" />
          <div className="fd-account-intro">
            <p className="eyebrow"><span />FateDrop ID</p>
            <h1>Your account.<br/><em>One network identity.</em></h1>
            <p>Manage the identity that follows you across FateDrop Web, the App and connected Discord. Membership and access stay tied to this FateDrop ID rather than being recreated on each surface.</p>
            <div className="fd-account-status-rail">
              <span><small>ACCESS</small><b>{premium ? "FateDrop Plus" : "Free"}</b></span>
              <span><small>DISCORD</small><b>{snapshot.discord ? discordRoleSynced ? "Premium synced" : "Linked" : "Not linked"}</b></span>
              <span><small>NETWORK AGE</small><b>{age}</b></span>
            </div>
            <div className="button-row"><Link className="button button-primary" href="/dashboard">Open dashboard <span>↗</span></Link><AccountSignOut /></div>
          </div>

          <article className="fate-id-card fd-account-id-card">
            <div className="fate-id-top"><span>FATEDROP / NETWORK ID</span><i className={premium ? "live" : ""}>{premium ? "PLUS ACTIVE" : "FREE NETWORK"}</i></div>
            <div className="fate-id-person">
              <div className="fate-avatar">{snapshot.account.avatarUrl ? <span className="fate-avatar-image" style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <strong>{initials(snapshot.account.displayName)}</strong>}<span /><a className="fate-avatar-edit" href="#profile" aria-label="Edit profile">✎</a></div>
              <div><small>@{snapshot.account.username}</small><h2>{snapshot.account.displayName}</h2><p>{snapshot.account.fateId}</p></div>
            </div>
            <div className="fate-id-metrics"><div><span>MEMBER SINCE</span><strong>{memberSince}</strong></div><div><span>NETWORK DAYS</span><strong>{networkDays}</strong></div><div><span>MEMBERSHIP</span><strong>{membership}</strong></div></div>
            <div className="fate-id-line"><i /><i /><i /><i /><i /></div>
          </article>
        </section>

        {(params.welcome === "1" || params.billing === "success" || params.discord) ? <section className="fd-account-notices" role="status">
          {params.welcome === "1" ? <p><b>Your FateDrop ID is ready.</b> You can stay on the free network, review Plus, connect the free Discord community or complete your profile below.</p> : null}
          {params.billing === "success" ? <p><b>Stripe hand-off complete.</b> Membership becomes active only when the verified webhook updates this FateDrop ID.</p> : null}
          {params.discord === "linked" ? <p><b>Discord connected.</b> Server membership and the Premium role are synced.</p> : null}
          {params.discord === "linked-free" ? <p><b>Discord connected.</b> You are in the free FateDrop community and the Premium role is kept off until this FateDrop ID is eligible.</p> : null}
          {params.discord === "linked-free-role-error" ? <p><b>Discord joined, but Premium-role cleanup could not be verified.</b> Reconnect Discord before relying on the server access state.</p> : null}
          {params.discord === "join" ? <p><b>Discord connected.</b> The server member could not be found for Premium role sync. Reconnect Discord to retry.</p> : null}
          {params.discord === "join-error" ? <p><b>Discord identity linked, but server entry failed.</b> No successful community access is being claimed; reconnect after the bot permissions are corrected.</p> : null}
          {params.discord === "setup" ? <p><b>Discord linking is not fully configured.</b> FateDrop will not claim server access until the guild join path is available.</p> : null}
          {params.discord && !["linked", "linked-free", "linked-free-role-error", "join", "join-error", "setup"].includes(params.discord) ? <p><b>Discord link needs another attempt.</b> Your FateDrop account itself is unchanged.</p> : null}
        </section> : null}

        <section className="fd-account-grid">
          <article className="fd-account-panel fd-membership-panel">
            <div className="fd-account-panel-head"><div><span>01 / MEMBERSHIP</span><h2>{membership}</h2></div><i className={premium ? "state-live" : "state-free"}>{snapshot.membership.status.toUpperCase()}</i></div>
            <p>{premium ? "Plus is active for this FateDrop ID. The Website, App and connected Discord consume the same entitlement." : "Free access keeps discovery open. Upgrade only when you want the deeper monitoring and Premium delivery layer."}</p>
            {snapshot.membership.status === "trialing" && trialEnd ? <div className="membership-timing"><span>FREE TRIAL</span><strong>Runs until {trialEnd}</strong></div> : null}
            <div className="fd-account-checks"><span className={premium ? "on" : "off"}>App entitlement {premium ? "active" : "free"}</span><span className={discordRoleSynced ? "on" : "off"}>{discordRoleSynced ? "Premium Discord role synced" : premium ? "Discord role needs sync" : "Free Discord access only"}</span></div>
            <div className="button-row"><Link className="button button-primary" href="/dashboard/membership">Manage membership <span>↗</span></Link><Link className="button button-secondary" href="/subscriptions#collectors">Compare access</Link></div>
          </article>

          <article className="fd-account-panel fd-discord-panel">
            <div className="fd-account-panel-head"><div><span>02 / DISCORD</span><h2>{snapshot.discord ? "Connected community" : "Connect the community"}</h2></div><i className={snapshot.discord ? "state-live" : "state-free"}>{snapshot.discord ? "LINKED" : "READY"}</i></div>
            {snapshot.discord ? <><div className="discord-identity"><span className="discord-mark">#</span><div><small>CONNECTED ACCOUNT</small><strong>{snapshot.discord.discordUsername}</strong></div></div><p>{discordRoleSynced ? "Your Discord identity is linked and the Premium role is active." : premium ? "Your identity is linked, but Premium should be reconciled before you rely on gated Discord channels." : "Your identity is linked to the free community. Premium channels remain gated until Plus becomes active."}</p></> : <p>Use FateDrop&apos;s Discord connection rather than a loose invite when possible. It joins the server, links the Discord identity to this FateDrop ID and applies or removes the Premium role from canonical membership truth.</p>}
            <div className="button-row">
              <Link className="button button-primary" href="/api/discord/connect">{snapshot.discord ? "Reconnect Discord" : discordCta} <span>↗</span></Link>
              {snapshot.discord && premium ? <DiscordSyncButton /> : null}
              {snapshot.discord && DISCORD_COMMUNITY_OPEN ? <a className="button button-secondary" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">Open Discord server</a> : null}
              {snapshot.discord ? <DiscordUnlinkButton /> : null}
            </div>
          </article>

          <article className="fd-account-panel fd-profile-panel" id="profile">
            <div className="fd-account-panel-head"><div><span>03 / PROFILE</span><h2>Your collector identity.</h2></div><i>EDITABLE</i></div>
            <p>Keep the account layer simple: your profile details, your avatar and your chosen Koru &amp; Friends companion. These settings do not change canonical product, stock or price intelligence.</p>
            <ProfileEditor profile={{ displayName: snapshot.account.displayName, username: snapshot.account.username, bio: snapshot.account.bio, avatarUrl: snapshot.account.avatarUrl, primaryTcg: snapshot.account.primaryTcg, collectorStyle: snapshot.account.collectorStyle, region: snapshot.account.region, profileTheme: snapshot.account.profileTheme }} />
            <div className="button-row"><Link className="button button-secondary" href="/dashboard/avatar">Choose Koru &amp; Friends companion <span>↗</span></Link></div>
          </article>

          <article className="fd-account-panel fd-history-panel">
            <div className="fd-account-panel-head"><div><span>04 / ACCOUNT HISTORY</span><h2>{networkDays} days in FateDrop.</h2></div><i>PERMANENT</i></div>
            <div className="loyalty-orbit" aria-hidden="true"><span /><span /><span /><strong>{networkDays}</strong><small>DAYS</small></div>
            <p>Your original join date stays attached to the FateDrop ID. Membership changes do not reset your account age.</p>
          </article>
        </section>
      </main>

      <style>{`
        .fd-account-v2{margin-top:92px!important;margin-bottom:80px!important}.fd-account-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(460px,.95fr);gap:34px;align-items:center;padding:clamp(28px,4vw,54px);overflow:hidden;border:1px solid rgba(221,203,188,.1);border-radius:24px;background:radial-gradient(circle at 82% 8%,rgba(124,110,255,.13),transparent 28%),radial-gradient(circle at 18% 18%,rgba(210,182,111,.07),transparent 24%),linear-gradient(145deg,#10141a,#090c11 72%)}.fd-account-hero>.account-radar-field{position:absolute!important;inset:0!important;opacity:.2!important;pointer-events:none}.fd-account-intro,.fd-account-id-card{position:relative;z-index:2}.fd-account-intro h1{max-width:780px;margin:10px 0 20px;color:#f0e7e1;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.2rem,5.6vw,6.2rem);font-weight:500;line-height:.91;letter-spacing:-.055em}.fd-account-intro h1 em{color:#c0acbf;font-style:normal}.fd-account-intro>p{max-width:760px;color:#9b9499;font-size:14px;line-height:1.75}.fd-account-status-rail{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:28px 0}.fd-account-status-rail span{padding:13px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.018)}.fd-account-status-rail small{display:block;color:#756e73;font-size:8px;font-weight:900;letter-spacing:.12em}.fd-account-status-rail b{display:block;margin-top:5px;color:#cfc5c0;font-size:11px}.fd-account-id-card{min-height:360px}.fd-account-notices{display:grid;gap:8px;margin:12px 0 0}.fd-account-notices p{margin:0;padding:14px 18px;border:1px solid rgba(210,182,111,.13);border-radius:10px;background:rgba(210,182,111,.035);color:#aaa1a5;font-size:12px;line-height:1.6}.fd-account-notices b{color:#ded2ca}.fd-account-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}.fd-account-panel{padding:26px;border:1px solid rgba(221,203,188,.085);border-radius:14px;background:linear-gradient(145deg,#0f1318,#090c10 74%)}.fd-account-panel-head{display:flex;justify-content:space-between;gap:20px;align-items:start}.fd-account-panel-head span{color:#9d7f68;font-size:9px;font-weight:900;letter-spacing:.13em}.fd-account-panel-head h2{margin:7px 0 0;color:#e7ddd6;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:500}.fd-account-panel-head>i{padding:5px 8px;border:1px solid rgba(221,203,188,.09);border-radius:999px;color:#7f777b;font-size:8px;font-style:normal;font-weight:900;letter-spacing:.1em}.fd-account-panel-head>i.state-live{border-color:rgba(124,110,255,.18);color:#a99eff}.fd-account-panel>p{max-width:760px;color:#948d91;font-size:12px;line-height:1.7}.fd-account-checks{display:grid;gap:8px;margin:20px 0}.fd-account-checks span{padding:10px 12px;border:1px solid rgba(221,203,188,.06);border-radius:9px;color:#7d767a;font-size:10px}.fd-account-checks span.on{border-color:rgba(130,166,139,.13);color:#94ad9b}.fd-profile-panel{grid-column:1/-1}.fd-history-panel{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) 160px;align-items:center}.fd-history-panel .fd-account-panel-head,.fd-history-panel>p{grid-column:1}.fd-history-panel .loyalty-orbit{grid-column:2;grid-row:1/3}.fd-account-panel .button-row{margin-top:22px}@media(max-width:1050px){.fd-account-hero{grid-template-columns:1fr}.fd-account-grid{grid-template-columns:1fr}.fd-profile-panel,.fd-history-panel{grid-column:auto}.fd-history-panel{grid-template-columns:1fr}.fd-history-panel .loyalty-orbit{grid-column:1;grid-row:auto;margin-top:18px}}@media(max-width:700px){.fd-account-v2{width:calc(100% - 18px)!important;margin-top:78px!important}.fd-account-hero{padding:20px;border-radius:18px}.fd-account-status-rail{grid-template-columns:1fr}.fd-account-panel{padding:19px}.fd-account-intro h1{font-size:clamp(2.8rem,14vw,4.3rem)}}
      `}</style>
    </SiteShell>
  );
}
