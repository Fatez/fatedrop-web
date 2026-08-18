import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSignOut } from "@/components/account-signout";
import { FateSignalField } from "@/components/fate-signal-field";
import { DiscordSyncButton } from "@/components/discord-sync-button";
import { DiscordUnlinkButton } from "@/components/discord-unlink-button";
import { BillingPortalButton, StartMembershipButton } from "@/components/membership-actions";
import { SiteShell } from "@/components/page-shell";
import { ProfileEditor } from "@/components/profile-editor";
import { getCurrentSnapshot } from "@/lib/auth";
import { DISCORD_COMMUNITY_OPEN, DISCORD_INVITE_URL, formatMemberSince, hasPremiumAccess, membershipLabel, networkAge } from "@/lib/membership";

export const metadata: Metadata = { title: "My FateDrop ID", description: "Your FateDrop profile, membership and connected network access.", robots: { index: false, follow: false } };

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function dateLabel(timestamp: number | null) {
  if (!timestamp) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }).format(new Date(timestamp * 1000));
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ billing?: string; discord?: string }> }) {
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

  return (
    <SiteShell>
      <section className={`account-hero section-shell theme-${snapshot.account.profileTheme}`}>
        <FateSignalField variant="radar" className="account-radar-field" />
        <div className="account-hero-copy">
          <p className="eyebrow"><span />Network identity</p>
          <h1>Your place<br />inside FateDrop.</h1>
          <p>A collector profile designed to become more valuable the longer you are part of the network.</p>
          <AccountSignOut />
        </div>
        <article className="fate-id-card">
          <div className="fate-id-top"><span>FATEDROP / NETWORK ID</span><i className={premium ? "live" : ""}>{premium ? "SIGNAL ACTIVE" : "FREE SIGNAL"}</i></div>
          <div className="fate-id-person">
            <div className="fate-avatar">{snapshot.account.avatarUrl ? <span className="fate-avatar-image" style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <strong>{initials(snapshot.account.displayName)}</strong>}<span /><a className="fate-avatar-edit" href="#avatar-picker" aria-label="Change avatar">✎</a></div>
            <div><small>@{snapshot.account.username}</small><h2>{snapshot.account.displayName}</h2><p>{snapshot.account.fateId}</p></div>
          </div>
          <div className="fate-id-metrics"><div><span>MEMBER SINCE</span><strong>{memberSince}</strong></div><div><span>NETWORK AGE</span><strong>{age}</strong></div><div><span>MEMBERSHIP</span><strong>{membership}</strong></div></div>
          <div className="fate-id-line"><i /><i /><i /><i /><i /></div>
        </article>
      </section>

      {(params.billing === "success" || params.discord) ? <section className="account-notice section-shell" role="status">{params.billing === "success" ? <p><b>Stripe hand-off complete.</b> Your membership status will update as soon as the verified webhook lands.</p> : null}{params.discord === "linked" ? <p><b>Discord connected.</b> Premium role sync completed.</p> : null}{params.discord === "linked-free" ? <p><b>Discord connected.</b> The identity link is saved; the Premium role will stay inactive until you have Premium access.</p> : null}{params.discord === "join" ? <p><b>Discord connected.</b> Join the FateDrop server first, then reconnect/sync so the bot can apply your Premium role.</p> : null}{params.discord === "setup" ? <p><b>Discord linking is built but not configured yet.</b> Add the Discord app credentials when the server is ready.</p> : null}{params.discord && !["linked", "linked-free", "join", "setup"].includes(params.discord) ? <p><b>Discord link needs another attempt.</b> Your FateDrop account itself is unchanged.</p> : null}</section> : null}

      <section className="account-grid section-shell">
        <article className="account-panel membership-panel">
          <div className="account-panel-head"><div><span>01 / MEMBERSHIP</span><h2>{membership}</h2></div><i className={premium ? "state-live" : "state-free"}>{snapshot.membership.status.toUpperCase()}</i></div>
          <p>{premium ? "Premium entitlement is active for this FateDrop ID. This is the single access state the app and Discord integrations are built to consume." : "Your FateDrop ID is active on the free network. Upgrade when you want deeper stock intelligence and Premium community access."}</p>
          {snapshot.membership.status === "trialing" && trialEnd ? <div className="membership-timing"><span>FREE TRIAL</span><strong>Runs until {trialEnd}</strong></div> : null}
          <div className="membership-entitlements"><span className={premium ? "on" : "off"}>{premium ? "Premium entitlement ready for app sync" : "App Premium entitlement inactive"}</span><span className={discordRoleSynced ? "on" : "off"}>{discordRoleSynced ? "Premium Discord role synced" : premium ? "Discord role awaiting sync" : "Premium Discord role inactive"}</span><span className="on">FateDrop profile + loyalty age</span></div>
          <div className="button-row">{snapshot.membership.stripeCustomerId ? <BillingPortalButton /> : <><StartMembershipButton tier="plus" label="Start Plus free trial" /><Link className="button button-secondary" href="/subscriptions#collectors">Compare plans</Link></>}</div>
        </article>

        <article className="account-panel discord-panel">
          <div className="account-panel-head"><div><span>02 / COMMUNITY LINK</span><h2>Discord connection</h2></div><i className={snapshot.discord ? "state-live" : "state-free"}>{snapshot.discord ? "LINKED" : "READY"}</i></div>
          {snapshot.discord ? <><div className="discord-identity"><span className="discord-mark">#</span><div><small>CONNECTED ACCOUNT</small><strong>{snapshot.discord.discordUsername}</strong></div></div><p>{discordRoleSynced ? "Your Discord identity is linked and the Premium role is synced." : premium ? "Your Discord identity is linked. The Premium role will sync once the server, bot and role are ready." : "Your Discord identity is linked. The Premium role remains inactive until this FateDrop ID has Premium access."}</p></> : <p>Link one Discord identity to this FateDrop ID. When Premium is active, the FateDrop bot can automatically grant the Premium server role.</p>}
          <div className="button-row"><Link className="button button-primary" href="/api/discord/connect">{snapshot.discord ? "Reconnect Discord" : "Connect Discord"} <span>↗</span></Link>{DISCORD_COMMUNITY_OPEN ? <a className="button button-secondary" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">Join FateDrop Discord</a> : <span className="button button-secondary disabled-link" aria-disabled="true">Discord opens soon</span>}{snapshot.discord ? <>{premium ? <DiscordSyncButton /> : null}<DiscordUnlinkButton /></> : null}</div>
        </article>

        <article className="account-panel profile-panel-wide">
          <div className="account-panel-head"><div><span>03 / PROFILE</span><h2>Shape your network identity.</h2></div><i>EDITABLE</i></div>
          <p>Keep it useful now: who you are, what you collect and how you want your FateDrop identity to feel. Reward progression can layer onto this later without rebuilding the account system.</p>
          <ProfileEditor profile={{ displayName: snapshot.account.displayName, username: snapshot.account.username, bio: snapshot.account.bio, avatarUrl: snapshot.account.avatarUrl, primaryTcg: snapshot.account.primaryTcg, collectorStyle: snapshot.account.collectorStyle, region: snapshot.account.region, profileTheme: snapshot.account.profileTheme }} />
        </article>

        <article className="account-panel loyalty-panel">
          <div className="account-panel-head"><div><span>04 / LOYALTY</span><h2>Time matters.</h2></div><i>FOUNDATION</i></div>
          <div className="loyalty-orbit" aria-hidden="true"><span /><span /><span /><strong>{Math.max(1, Math.floor((Date.now() / 1000 - snapshot.account.createdAt) / 86400) + 1)}</strong><small>DAYS</small></div>
          <p>Your join date is permanent account history. For now we simply surface membership age; later it can support genuine loyalty milestones without inventing an economy too early.</p>
        </article>
      </section>
    </SiteShell>
  );
}
