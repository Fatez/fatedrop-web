/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSignOut } from "@/components/account-signout";
import { BillingPortalButton, StartMembershipButton } from "@/components/membership-actions";
import { BrandMark } from "@/components/brand-mark";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData, moneyFromPence, relativeTime, signalLabel } from "@/lib/dashboard";
import { formatMemberSince, hasPremiumAccess, membershipLabel, networkAge } from "@/lib/membership";

export const metadata: Metadata = {
  title: "Dashboard | FateDrop",
  description: "Your FateDrop network dashboard, collector identity, signals and membership.",
  robots: { index: false, follow: false },
};

const navItems = [
  ["▦", "Dashboard", "/dashboard"],
  ["⌕", "Search", "/dashboard/search"],
  ["◉", "Alerts", "/dashboard/alerts"],
  ["♡", "Watchlist", "/dashboard/watchlist"],
  ["⌂", "Indie Stores", "/dashboard/stores"],
  ["□", "Events", "/dashboard/events"],
  ["⇄", "True Price", "/dashboard/true-price"],
  ["⌖", "Local Radar", "/dashboard/local-radar"],
] as const;

function chartPoints(values: number[]) {
  const max = Math.max(1, ...values);
  return values.map((value, index) => {
    const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * 100;
    const y = 92 - (value / max) * 72;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

function metric(value: number | null | undefined) {
  return value === null || value === undefined ? "—" : new Intl.NumberFormat("en-GB").format(value);
}

function eventDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "Europe/London" }).format(new Date(timestamp * 1000));
}

function dateShort(timestamp: number | null | undefined) {
  if (!timestamp) return "Not connected";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(new Date(timestamp * 1000));
}

export default async function DashboardPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard");
  const data = await buildDashboardData(snapshot);
  const premium = hasPremiumAccess(snapshot.membership);
  const plan = membershipLabel(snapshot.membership);
  const network = data.network;
  const activityValues = data.personal.daily.map((item) => item.value);
  const points = chartPoints(activityValues);
  const trialDaysLeft = snapshot.membership.trialEndsAt ? Math.max(0, Math.ceil((snapshot.membership.trialEndsAt - data.generatedAt) / 86_400)) : null;
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_PRICE_PLUS && process.env.STRIPE_PRICE_PRO);
  const trialEligible = !snapshot.membership.stripeCustomerId && !snapshot.membership.trialStartedAt;
  const hasOpenSubscription = Boolean(snapshot.membership.stripeSubscriptionId && snapshot.membership.status !== "canceled");

  return (
    <main className="fd-dashboard">
      <aside className="fd-dashboard-sidebar">
        <div className="fd-dashboard-brand"><BrandMark /><small>One identity. Every drop.</small></div>
        <nav aria-label="Dashboard navigation">
          {navItems.map(([icon, label, href]) => <Link key={label} className={label === "Dashboard" ? "active" : ""} href={href}><span>{icon}</span>{label}</Link>)}
          <div className="fd-dashboard-nav-separator" />
          <Link href="/dashboard/profile"><span>◎</span>My FateDrop ID</Link>
          <Link href="/dashboard/membership"><span>♛</span>Membership</Link>
          <Link href="/dashboard/discord"><span>◌</span>Discord <i>PREMIUM</i></Link>
        </nav>
        <div className="fd-dashboard-trial-card">
          <span>{premium ? plan : trialEligible ? "14-Day Free Trial" : "Membership"}</span>
          <p>{premium ? (snapshot.membership.status === "trialing" ? `${trialDaysLeft ?? 0} trial days remaining.` : "Premium entitlement active.") : trialEligible ? "Unlock Premium signals, Discord access and deeper discovery." : "Manage or restart your FateDrop membership."}</p>
          {hasOpenSubscription ? <BillingPortalButton /> : <StartMembershipButton tier="plus" label={trialEligible ? "Start free trial" : snapshot.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"} />}
          <small>{stripeReady ? "Stripe billing ready" : "Stripe keys still need connecting"}</small>
        </div>
        <div className="fd-dashboard-sidebar-art" aria-hidden="true" />
      </aside>

      <section className="fd-dashboard-main">
        <header className="fd-dashboard-topbar">
          <div><span>DASHBOARD</span><p>Welcome back, {snapshot.account.displayName}.</p></div>
          <form action="/dashboard/search" method="get" className="fd-dashboard-search"><span>⌕</span><input name="q" aria-label="Search FateDrop" placeholder="Search products, sets or stores…" /></form>
          <div className="fd-dashboard-top-actions"><Link href="/dashboard/profile" className="fd-dashboard-avatar-link" aria-label="Open profile">{snapshot.account.avatarUrl ? <span style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <img src="/assets/fatedrop-logo-mark.png" alt="" />}</Link><AccountSignOut /></div>
        </header>

        <div className="fd-dashboard-grid">
          <section className="fd-dash-card fd-network-card">
            <div className="fd-dash-card-head"><span>NETWORK STATUS</span><i className={network ? "live" : "pending"}>{network ? "● LIVE FEED" : "○ AWAITING FEED"}</i></div>
            <div className="fd-network-message"><h1>{network ? "The network is active." : "FateDrop Cloud is ready to connect."}</h1><p>{network ? `Latest metric snapshot from ${network.source}.` : "Lifecycle counters stay blank until a persisted cloud snapshot arrives — no invented numbers."}</p></div>
            <div className="fd-network-wave" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="fd-network-metrics">
              <div><strong>{metric(network?.metrics.echo)}</strong><span>ECHO</span><small>Returning signal</small></div>
              <div><strong>{metric(network?.metrics.manifested)}</strong><span>MANIFESTED</span><small>Available now</small></div>
              <div><strong>{metric(network?.metrics.changes24h)}</strong><span>CHANGES</span><small>Last 24h</small></div>
            </div>
            <footer><span>Source: {network?.source ?? "not connected"}</span><span>Measured: {dateShort(network?.measuredAt)}</span></footer>
          </section>

          <section className="fd-dash-card fd-recent-card">
            <div className="fd-dash-card-head"><span>RECENT MANIFESTED</span><small>{network ? "Persisted network signals" : "Awaiting cloud feed"}</small></div>
            <div className="fd-dashboard-list">
              {data.recentManifested.length ? data.recentManifested.map((item) => <article key={item.id}><span className="fd-signal-thumb">M</span><div><strong>{item.title}</strong><small>{item.retailer || "Retailer not supplied"}</small></div><aside>{moneyFromPence(item.deliveredPricePence) || signalLabel(item)}<small>{relativeTime(item.occurredAt, data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No Manifested records yet.</strong><span>Once FateDrop Cloud posts signed snapshots, real signals appear here automatically.</span></div>}
            </div>
          </section>

          <section className="fd-dash-card fd-profile-card">
            <div className="fd-profile-card-top"><small>{snapshot.account.fateId}</small><span>{premium ? "♛ PREMIUM" : "FREE MEMBER"}</span></div>
            <div className="fd-profile-identity"><div className="fd-profile-orbit">{snapshot.account.avatarUrl ? <span style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <img src="/assets/fatedrop-logo-mark.png" alt="" />}</div><div><h2>{snapshot.account.displayName}</h2><p>@{snapshot.account.username}</p><small>{plan}</small></div></div>
            <div className="fd-profile-badges"><span>NETWORK MEMBER</span>{snapshot.discord ? <span>DISCORD LINKED</span> : null}</div>
            <div className="fd-profile-dates"><div><span>MEMBER SINCE</span><strong>{formatMemberSince(snapshot.account.createdAt)}</strong></div><div><span>NETWORK AGE</span><strong>{networkAge(snapshot.account.createdAt)}</strong></div></div>
            <Link className="fd-dashboard-wide-button" href="/dashboard/profile">View profile</Link>
          </section>

          <section className="fd-dash-card fd-stats-card">
            <div className="fd-dash-card-head"><span>YOUR STATS</span><small>All-time stored activity</small></div>
            <div className="fd-personal-metrics">
              <div><strong>{data.personal.signalsSeen}</strong><span>Signals seen</span><small>activity ledger</small></div>
              <div><strong>{data.personal.wishlistHits}</strong><span>Wishlist hits</span><small>activity ledger</small></div>
              <div><strong>{data.personal.storesTracked}</strong><span>Stores tracked</span><small>unique stores</small></div>
              <div><strong>{moneyFromPence(data.personal.savedPence) || "£0.00"}</strong><span>Saved vs market</span><small>recorded savings</small></div>
            </div>
            <div className="fd-activity-chart"><div><span>ACTIVITY OVER 30 DAYS</span><small>Signals + wishlist hits</small></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Stored dashboard activity over the last 30 days"><defs><linearGradient id="fdChartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9a36ff" stopOpacity=".35"/><stop offset="1" stopColor="#9a36ff" stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#fdChartFill)"/><polyline points={points} fill="none" stroke="#9a36ff" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg><div className="fd-chart-axis"><span>30d ago</span><span>Today</span></div></div>
          </section>

          <section className="fd-dash-card fd-stores-card">
            <div className="fd-dash-card-head"><span>FAVOURITE STORES</span><Link href="/dashboard/stores">Browse</Link></div>
            <div className="fd-dashboard-list compact-list">
              {data.personal.favoriteStores.length ? data.personal.favoriteStores.map((store) => <article key={store.name}><span className="fd-store-thumb">◇</span><div><strong>{store.name}</strong><small>{store.count} tracked interaction{store.count === 1 ? "" : "s"}</small></div><aside>♡<small>{relativeTime(store.latestAt, data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No stores tracked yet.</strong><span>Store counts are built only from saved activity events.</span></div>}
            </div>
            <Link className="fd-dashboard-wide-button" href="/dashboard/stores">Browse all stores →</Link>
          </section>

          <section className="fd-dash-card fd-events-card">
            <div className="fd-dash-card-head"><span>UPCOMING EVENTS</span><Link href="/dashboard/events">View all</Link></div>
            <div className="fd-event-list">
              {data.upcomingEvents.length ? data.upcomingEvents.map((event) => <article key={event.id}><time>{eventDate(event.startsAt)}</time><div><strong>{event.name}</strong><small>{event.venue || event.location || "Venue details pending"}</small>{event.vendorCount !== null ? <span>{event.vendorCount}+ vendors</span> : null}</div>{event.ticketUrl ? <a href={event.ticketUrl} target="_blank" rel="noreferrer" aria-label={`Open ${event.name} tickets`}>↗</a> : null}</article>) : <div className="fd-dashboard-empty"><strong>No live event feed connected yet.</strong><span>Upcoming listings will appear here when FateDrop Cloud includes verified event records in the network snapshot.</span></div>}
            </div>
            <Link className="fd-dashboard-wide-button" href="/dashboard/events">See all events</Link>
          </section>

          <section className="fd-dash-card fd-billing-card">
            <div className="fd-dash-card-head"><span>MEMBERSHIP + STRIPE</span><Link href="/dashboard/membership">Open billing</Link></div>
            <div className="fd-billing-state"><strong>{plan}</strong><span>{snapshot.membership.status.toUpperCase()}</span></div>
            <p>{snapshot.membership.status === "trialing" ? `Your trial has ${trialDaysLeft ?? 0} day${trialDaysLeft === 1 ? "" : "s"} remaining.` : premium ? "Your Premium entitlement is active across the FateDrop account layer." : trialEligible ? "Start a 14-day Plus trial when Stripe is connected." : "Manage or restart your subscription from the Membership page."}</p>
            <div className="fd-billing-facts"><span><small>CUSTOMER</small><b>{snapshot.membership.stripeCustomerId ? "Connected" : "Not created"}</b></span><span><small>DISCORD ROLE</small><b>{snapshot.discord?.roleSyncedAt ? "Synced" : "Not synced"}</b></span></div>
            {hasOpenSubscription ? <BillingPortalButton /> : <StartMembershipButton tier="plus" label={trialEligible ? "Start Plus free trial" : snapshot.membership.stripeCustomerId ? "Restart Plus" : "Choose Plus"} />}
          </section>

          <section className="fd-dash-card fd-whispers-card">
            <div className="fd-dash-card-head"><span>ECHO / WHISPERS</span><Link href="/dashboard/alerts">Live feed</Link></div>
            <div className="fd-dashboard-list compact-list">
              {data.echoWhispers.length ? data.echoWhispers.map((item) => <article key={item.id}><span className={`fd-signal-thumb ${item.state}`}>{item.state === "echo" ? "E" : "W"}</span><div><strong>{item.title}</strong><small>{item.detail || item.retailer || signalLabel(item)}</small></div><aside>{signalLabel(item)}<small>{relativeTime(item.occurredAt, data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No Whisper / Echo records yet.</strong><span>These populate only from persisted network snapshots.</span></div>}
            </div>
          </section>

          <section className="fd-dash-card fd-watchlist-card">
            <div className="fd-dash-card-head"><span>WATCHLIST HIGHLIGHTS</span><Link href="/dashboard/watchlist">Wishlist</Link></div>
            <div className="fd-dashboard-list compact-list">
              {data.personal.watchlist.length ? data.personal.watchlist.map((item) => <article key={item.id}><span className="fd-store-thumb">♡</span><div><strong>{item.title || "Wishlist match"}</strong><small>{item.retailer || item.subtitle || "FateDrop activity"}</small></div><aside>{item.amountPence ? moneyFromPence(item.amountPence) : "HIT"}<small>{relativeTime(item.occurredAt, data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No wishlist hits recorded yet.</strong><span>Your stats stay at zero until the app or site records a real match.</span></div>}
            </div>
          </section>

          <section className="fd-dash-card fd-community-card">
            <div><span>COMMUNITY</span><h2>Join the network beyond the dashboard.</h2><p>Connect with collectors, react to signals and unlock Premium Discord spaces when the server is ready.</p></div>
            <Link className="button button-primary" href="/dashboard/discord">Manage Discord →</Link>
          </section>

          <section className="fd-dash-card fd-data-card">
            <div className="fd-dash-card-head"><span>DATA PROVENANCE</span><Link href="/dashboard#data-provenance">Why these numbers?</Link></div>
            <div className="fd-provenance-list" id="data-provenance">
              {data.provenance.map((source) => <article key={source.label}><div><strong>{source.label}</strong><small>{source.source}</small></div><span>{source.updatedAt ? dateShort(source.updatedAt) : "Not connected"}</span><p>{source.note}</p></article>)}
            </div>
          </section>

          <section className="fd-dash-card fd-baseline-card">
            <div className="fd-dash-card-head"><span>PUBLISHED BETA SNAPSHOT</span><small>Static, not presented as live</small></div>
            <div className="fd-baseline-grid"><div><strong>{metric(data.publishedBaseline.productsTracked)}</strong><span>Products tracked</span></div><div><strong>{metric(data.publishedBaseline.inStock)}</strong><span>In stock</span></div><div><strong>{metric(data.publishedBaseline.catalogueRetailers)}</strong><span>Catalogue retailers</span></div><div><strong>{metric(data.publishedBaseline.healthyMonitors)}</strong><span>Healthy monitors</span></div></div>
            <p>This is the existing validated beta snapshot already used on the public site. It is deliberately separated from the live dashboard feed so stale figures can never masquerade as real-time data.</p>
          </section>
        </div>
      </section>
    </main>
  );
}
