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
import { serverNowSeconds } from "@/lib/server-time";

export const metadata: Metadata = { title: "My FateDrop ID", description: "Your FateDrop profile, Koru & Friends companion, membership and connected network access.", robots: { index: false, follow: false } };

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
  const now = serverNowSeconds();
  const networkDays = Math.max(1, Math.floor((now - snapshot.account.createdAt) / 86400) + 1);

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
            <div className="fate-avatar">{snapshot.account.avatarUrl ? <span className="fate-avatar-image" style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <strong>{initials(snapshot.account.displayName)}</strong>}<span /><a className="fate-avatar-edit" href="#avatar-picker" aria-label="Change profile picture">✎</a></div>
            <div><small>@{snapshot.account.username}</small><h2>{snapshot.account.displayName}</h2><p>{snapshot.account.fateId}</p></div>
          </div>
          <div className="fate-id-metrics"><div><span>MEMBER SINCE</span><strong>{memberSince}</strong></div><div><span>NETWORK AGE</span><strong>{age}</strong></div><div><span>MEMBERSHIP</span><strong>{membership}</strong></div></div>
          <div className="fate-id-line"><i /><i /><i /><i /><i /></div>
        </article>
      </section>

      {(params.billing === "success" || params.discord) ? <section className="account-notice section-shell" role="status">{params.billing === "success" ? <p><b>Stripe hand-off complete.</b> Your membership status will update as soon as the verified webhook lands.</p> : null}{params.discord === "linked" ? <p><b>Discord connected.</b> Server membership and Premium role sync completed.</p> : null}{params.discord === "linked-free" ? <p><b>Discord connected.</b> Your FateDrop identity is linked to the server; Premium access will activate automatically when this FateDrop ID becomes eligible.</p> : null}{params.discord === "join" ? <p><b>Discord connected.</b> The bot could not find your server membership for role sync. Reconnect Discord to retry automatic server access.</p> : null}{params.discord === "join-error" ? <p><b>Discord linked, but automatic server access failed.</b> Check the Discord bot permissions and reconnect once setup is corrected.</p> : null}{params.discord === "setup" ? <p><b>Discord linking is built but not configured yet.</b> Add the Discord app credentials when the server is ready.</p> : null}{params.discord && !["linked", "linked-free", "join", "join-error", "setup"].includes(params.discord) ? <p><b>Discord link needs another attempt.</b> Your FateDrop account itself is unchanged.</p> : null}</section> : null}

      <section className="account-grid section-shell">
        <article className="account-panel membership-panel">
          <div className="account-panel-head"><div><span>01 / MEMBERSHIP</span><h2>{membership}</h2></div><i className={premium ? "state-live" : "state-free"}>{snapshot.membership.status.toUpperCase()}</i></div>
          <p>{premium ? "Premium entitlement is active for this FateDrop ID. Website, app and connected Discord access all consume this same server-side membership state." : "Your FateDrop ID is active on the free network. Upgrade when you want personal monitoring, instant alerts and Premium Discord access."}</p>
          {snapshot.membership.status === "trialing" && trialEnd ? <div className="membership-timing"><span>FREE TRIAL</span><strong>Runs until {trialEnd}</strong></div> : null}
          <div className="membership-entitlements"><span className={premium ? "on" : "off"}>{premium ? "Premium entitlement available to the app" : "App Premium entitlement inactive"}</span><span className={discordRoleSynced ? "on" : "off"}>{discordRoleSynced ? "Premium Discord role synced" : premium ? "Discord role awaiting configured sync" : "Premium Discord role inactive"}</span><span className="on">FateDrop profile + loyalty age</span></div>
          <div className="button-row">{snapshot.membership.stripeCustomerId ? <BillingPortalButton /> : <><StartMembershipButton tier="plus" label="Start Plus free trial" /><Link className="button button-secondary" href="/subscriptions#collectors">Compare plans</Link></>}</div>
        </article>

        <article className="account-panel discord-panel">
          <div className="account-panel-head"><div><span>02 / COMMUNITY LINK</span><h2>Discord connection</h2></div><i className={snapshot.discord ? "state-live" : "state-free"}>{snapshot.discord ? "LINKED" : "READY"}</i></div>
          {snapshot.discord ? <><div className="discord-identity"><span className="discord-mark">#</span><div><small>CONNECTED ACCOUNT</small><strong>{snapshot.discord.discordUsername}</strong></div></div><p>{discordRoleSynced ? "Your Discord identity is linked and the Premium role is synced." : premium ? "Your Discord identity is linked. The Premium role will sync once the server, bot and role are ready." : "Your Discord identity is linked to the FateDrop server. Upgrade later and the same identity can receive the Premium role automatically."}</p></> : <p>Connect Discord once. FateDrop requests server access during OAuth so your linked identity can join the community and receive the Premium role automatically when eligible.</p>}
          <div className="button-row"><Link className="button button-primary" href="/api/discord/connect">{snapshot.discord ? "Reconnect Discord" : "Connect Discord"} <span>↗</span></Link>{DISCORD_COMMUNITY_OPEN ? <a className="button button-secondary" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">Join FateDrop Discord</a> : <span className="button button-secondary disabled-link" aria-disabled="true">Discord opens soon</span>}{snapshot.discord ? <>{premium ? <DiscordSyncButton /> : null}<DiscordUnlinkButton /></> : null}</div>
        </article>

        <article className="account-panel profile-panel-wide">
          <div className="account-panel-head"><div><span>03 / PROFILE &amp; COMPANION</span><h2>Your identity. Your companion.</h2></div><i>EDITABLE</i></div>
          <p>Your profile picture and account details stay lightweight. Koru &amp; Friends is a separate companion layer: choose Koru, Fenn, Aeris, Nyxen or Solix without turning profile cosmetics into another competing character system.</p>
          <ProfileEditor profile={{ displayName: snapshot.account.displayName, username: snapshot.account.username, bio: snapshot.account.bio, avatarUrl: snapshot.account.avatarUrl, primaryTcg: snapshot.account.primaryTcg, collectorStyle: snapshot.account.collectorStyle, region: snapshot.account.region, profileTheme: snapshot.account.profileTheme }} />
          <div className="button-row"><Link className="button button-secondary" href="/dashboard/avatar">Choose Koru &amp; Friends companion <span>↗</span></Link></div>
        </article>

        <article className="account-panel loyalty-panel">
          <div className="account-panel-head"><div><span>04 / LOYALTY</span><h2>Time matters.</h2></div><i>FOUNDATION</i></div>
          <div className="loyalty-orbit" aria-hidden="true"><span /><span /><span /><strong>{networkDays}</strong><small>DAYS</small></div>
          <p>Your join date is permanent account history. For now we simply surface membership age; later it can support genuine loyalty milestones without inventing an economy too early.</p>
        </article>
      </section>
    </SiteShell>
  );
}
