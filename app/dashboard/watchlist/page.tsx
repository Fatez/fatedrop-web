import type { Metadata } from "next";
import Link from "next/link";
import { AvatarPreview } from "@/components/avatar-preview";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { FateMatchBuilder } from "@/components/fate-match-builder";
import { getCurrentSnapshot } from "@/lib/auth";
import { defaultAvatarRecord, getUserAvatar } from "@/lib/avatar-storage";
import { buildDashboardData, moneyFromPence, relativeTime } from "@/lib/dashboard";
import { hasCapability } from "@/lib/entitlements";
import { listUserFateMatches } from "@/lib/fate-match-storage";

export const metadata: Metadata = { title: "FateFind | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardFateFindPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const initialQuery = (params.q ?? "").trim().slice(0, 160);
  const snapshot = await getCurrentSnapshot();
  const data = snapshot ? await buildDashboardData(snapshot) : null;
  const legacyHits = data?.personal.watchlist ?? [];
  const premium = snapshot ? hasCapability(snapshot.membership, "advanced_fate_match") : false;
  let matches: Awaited<ReturnType<typeof listUserFateMatches>> = [];
  let migrationPending = false;
  let avatar = snapshot ? defaultAvatarRecord(snapshot.account.id) : null;
  if (snapshot) {
    try { matches = await listUserFateMatches(snapshot.account.id); }
    catch { migrationPending = true; }
    try { avatar = await getUserAvatar(snapshot.account.id) ?? avatar; } catch { /* default companion remains visible */ }
  }

  return <DashboardPageShell title="FateFind" eyebrow="SAVED HUNTS · PREMIUM MONITORING">
    <div className="fd-fatematch-page">
      <section className="fd-dash-card fd-fm-hero">
        <div className="fd-dash-card-head"><span>FATEFIND</span><i className={premium ? "live" : "pending"}>{premium ? "● ACTIVE ENTITLEMENT" : "○ PREMIUM MONITORING"}</i></div>
        <div className="fd-fm-hero-grid"><div><div className="fd-network-message"><h1>Tell FateDrop what you want.<br/>Let the network do the hunting.</h1><p><b>FateFind</b> is the hunt: product plus limits such as maximum delivered True Price, RRP premium and online/local scope. When a real observed offer satisfies those conditions, that successful result is a <b>FateMatch</b>. A Universal Wishlist remains a separate, simpler “I want this” product save.</p></div><FateMatchBuilder premium={premium} initialQuery={initialQuery}/></div>{avatar ? <aside className="fd-fm-companion"><div><span>YOUR COMPANION</span><small>Watching the network with you</small></div><AvatarPreview loadout={avatar.loadout} mood={matches.some((match)=>match.enabled) ? "watching" : "idle"} compact label="FateFind companion"/><Link href="/dashboard/avatar">CUSTOMISE →</Link></aside> : null}</div>
      </section>

      <div className="fd-fm-grid">
        <section className="fd-dash-card fd-fm-list"><div className="fd-dash-card-head"><span>YOUR FATEFINDS</span><small>{migrationPending ? "Fate Network migration pending" : `${matches.length} saved`}</small></div>
          {matches.length ? <div className="fd-dashboard-list">{matches.map((match)=><article key={match.id}><span className="fd-store-thumb">♡</span><div><strong>{match.query || "Resolved product"}</strong><small>{match.scope === "online" ? "Online only" : match.scope === "local" ? `Local${match.radiusKm ? ` · ${match.radiusKm} km` : ""}` : "Online or local"}{match.maxTruePricePence !== null ? ` · max £${(match.maxTruePricePence/100).toFixed(2)} True Price` : ""}{match.maxPercentAboveRrp !== null ? ` · max +${match.maxPercentAboveRrp}% RRP` : ""}</small></div><aside>{match.enabled ? "ACTIVE" : "PAUSED"}<small>{match.productIdentityId ? "identity locked" : "search intent"}</small></aside></article>)}</div> : <div className="fd-dashboard-empty"><strong>{migrationPending ? "FateFind storage is staged, not live yet." : "No FateFind rules yet."}</strong><span>{migrationPending ? "Existing saved-hit history remains untouched while the additive Fate Network migration waits for approval." : "Create a hunt above. A qualifying result becomes a FateMatch."}</span></div>}
        </section>

        <section className="fd-dash-card fd-fm-explain"><div className="fd-dash-card-head"><span>FATEFIND → FATEMATCH</span><small>One clear loop</small></div><div className="fd-fm-flow"><span><b>1</b><strong>CREATE A FATEFIND</strong><small>Product · True Price · RRP · online/local</small></span><i>→</i><span><b>2</b><strong>FATEDROP WATCHES</strong><small>Canonical offers · stock · network evidence</small></span><i>→</i><span><b>3</b><strong>FATEMATCH</strong><small>A real offer satisfied your saved hunt</small></span></div><div className="fd-fm-links"><Link href="/dashboard/search">Search products →</Link><Link href="/dashboard/true-price">Compare True Price →</Link></div></section>
      </div>

      <section className="fd-dash-card fd-fm-legacy"><div className="fd-dash-card-head"><span>PREVIOUS SAVED-HUNT HITS</span><small>Retained history · not deleted</small></div><div className="fd-dashboard-list">{legacyHits.length && data ? legacyHits.map((item)=><article key={item.id}><span className="fd-store-thumb">◇</span><div><strong>{item.title || "FateMatch"}</strong><small>{item.retailer || item.subtitle || "FateDrop activity"}</small></div><aside>{item.amountPence ? moneyFromPence(item.amountPence) : "MATCH"}<small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No previous FateMatch hits.</strong><span>Nothing is fabricated or migrated into FateFind without a real user intent record.</span></div>}</div></section>
    </div>
    <style>{`.fd-fatematch-page{display:grid;gap:22px}.fd-fm-hero{padding:30px}.fd-fm-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:22px;align-items:start}.fd-fm-hero .fd-network-message{margin-bottom:22px}.fd-fm-hero .fd-network-message h1{font-size:clamp(2rem,3.2vw,3.6rem);line-height:.98}.fd-fm-hero .fd-network-message p b{color:#c7aaff}.fd-fm-companion{padding:12px;border:1px solid rgba(157,109,255,.14);border-radius:16px;background:linear-gradient(145deg,rgba(157,109,255,.055),rgba(88,232,255,.02))}.fd-fm-companion>div{display:flex;justify-content:space-between;gap:8px;margin-bottom:8px}.fd-fm-companion span{color:#79eaff;font-size:7px;font-weight:900;letter-spacing:.13em}.fd-fm-companion small{color:#6f6975;font-size:6px}.fd-fm-companion>a{display:block;margin-top:8px;text-align:center;color:#9eefff;font-size:7px;font-weight:900;text-decoration:none;letter-spacing:.09em}.fd-fm-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:22px}.fd-fm-list,.fd-fm-explain,.fd-fm-legacy{padding:25px}.fd-fm-flow{display:grid;gap:12px;margin-top:20px}.fd-fm-flow>span{padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.02)}.fd-fm-flow b{display:inline-grid;width:23px;height:23px;place-items:center;margin-right:8px;border:1px solid rgba(88,232,255,.2);border-radius:7px;color:#74eaff;font-size:8px}.fd-fm-flow strong{font-size:10px;letter-spacing:.07em}.fd-fm-flow small{display:block;margin:6px 0 0 31px;color:#79727f;font-size:9px}.fd-fm-flow>i{text-align:center;color:#564f5d;font-style:normal}.fd-fm-links{display:flex;gap:12px;margin-top:18px;flex-wrap:wrap}.fd-fm-links a{color:#9eefff;font-size:8px;font-weight:900;text-decoration:none}@media(max-width:1050px){.fd-fm-hero-grid{grid-template-columns:1fr}.fd-fm-companion{max-width:320px}}@media(max-width:900px){.fd-fm-grid{grid-template-columns:1fr}.fd-fm-hero{padding:20px}}`}</style>
  </DashboardPageShell>;
}
