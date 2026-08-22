import type { Metadata } from "next";
import Link from "next/link";
import { CompanionRenderer } from "@/components/companion-renderer";
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
    try { avatar = await getUserAvatar(snapshot.account.id) ?? avatar; } catch { /* keep default */ }
  }

  return <DashboardPageShell title="FateFind" eyebrow="TELL FATEDROP WHAT YOU WANT">
    <div className="fd-fatefind-page">
      <section className="fd-dash-card fd-ff-hero">
        <div className="fd-ff-main">
          <span>FATEFIND</span>
          <h1>You choose the hunt.<br/>FateDrop keeps looking.</h1>
          <p>A FateFind is just a saved hunt. Tell FateDrop <b>what product you want</b> and, if you care, the most you want to pay. FateDrop keeps checking real observed retailer offers for you.</p>
          <div className="fd-ff-simple">
            <div><b>1</b><strong>TELL US WHAT YOU WANT</strong><small>Example: “Destined Rivals ETB”.</small></div>
            <i>→</i>
            <div><b>2</b><strong>ADD YOUR RULES</strong><small>Example: max £60 True Price, online only.</small></div>
            <i>→</i>
            <div className="match"><b>3</b><strong>GET A FATEMATCH</strong><small>Only when a real observed offer actually fits your hunt.</small></div>
          </div>
          <p className="fd-ff-kid-copy"><b>Simple version:</b> you say “find me this for this price.” FateDrop watches the shops. When it finds one that fits, that result is your FateMatch.</p>
          <FateMatchBuilder premium={premium} initialQuery={initialQuery}/>
        </div>
        {avatar ? <aside className="fd-ff-companion"><div><span>YOUR COMPANION</span><small>Watching the network with you</small></div><CompanionRenderer request={{ companionId: avatar.loadout.companion, reaction: matches.some((match)=>match.enabled) ? "watching" : "idle", compact: true, label: "FateFind companion" }}/><Link href="/dashboard/avatar">CHOOSE COMPANION →</Link></aside> : null}
      </section>

      <div className="fd-ff-grid">
        <section className="fd-dash-card fd-ff-list"><div className="fd-ff-head"><div><span>YOUR FATEFINDS</span><h2>What are we hunting for?</h2></div><small>{migrationPending ? "Storage migration pending" : `${matches.length} saved`}</small></div>
          {matches.length ? <div className="fd-dashboard-list">{matches.map((match)=><article key={match.id}><span className="fd-store-thumb">⌕</span><div><strong>{match.query || "Resolved product"}</strong><small>{match.scope === "online" ? "Online only" : match.scope === "local" ? `Local${match.radiusKm ? ` · ${match.radiusKm} km` : ""}` : "Online or local"}{match.maxTruePricePence !== null ? ` · max £${(match.maxTruePricePence/100).toFixed(2)} True Price` : ""}{match.maxPercentAboveRrp !== null ? ` · max +${match.maxPercentAboveRrp}% RRP` : ""}</small></div><aside>{match.enabled ? "ACTIVE" : "PAUSED"}<small>{match.productIdentityId ? "product locked" : "search intent"}</small></aside></article>)}</div> : <div className="fd-dashboard-empty"><strong>{migrationPending ? "FateFind storage is staged, not live yet." : "No FateFind hunts yet."}</strong><span>{migrationPending ? "Existing history stays untouched while the additive migration waits for approval." : "Create one above. FateDrop only reports a FateMatch when a real observed offer satisfies your rules."}</span></div>}
        </section>

        <section className="fd-dash-card fd-ff-explain"><div className="fd-ff-head"><div><span>FATEFIND ≠ WISHLIST</span><h2>Two different jobs.</h2></div></div><div className="fd-ff-compare"><div><b>♡</b><strong>WISHLIST</strong><span>“I like / want this product.”</span><small>A simple saved item. No hunting rules required.</small></div><div><b>⌕</b><strong>FATEFIND</strong><span>“Find this when these rules are met.”</span><small>A monitored hunt that can produce a FateMatch.</small></div></div><div className="fd-ff-links"><Link href="/dashboard/search">Search products →</Link><Link href="/dashboard/true-price">Understand True Price →</Link></div></section>
      </div>

      <section className="fd-dash-card fd-ff-history"><div className="fd-ff-head"><div><span>PREVIOUS FATEMATCH RESULTS</span><h2>Matches the network already recorded.</h2></div><small>History is never invented</small></div><div className="fd-dashboard-list">{legacyHits.length && data ? legacyHits.map((item)=><article key={item.id}><span className="fd-store-thumb">◇</span><div><strong>{item.title || "FateMatch"}</strong><small>{item.retailer || item.subtitle || "FateDrop activity"}</small></div><aside>{item.amountPence ? moneyFromPence(item.amountPence) : "MATCH"}<small>{relativeTime(item.occurredAt,data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No previous FateMatch results.</strong><span>Nothing appears here until a real saved hunt has a real qualifying result.</span></div>}</div></section>
    </div>
    <style>{`
      .fd-fatefind-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-fatefind-page .fd-dash-card{border-color:rgba(221,203,188,.085);background:linear-gradient(145deg,#0e1216,#090d11 74%);border-radius:12px}.fd-ff-hero{padding:28px;display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:24px;background:radial-gradient(circle at 90% 8%,rgba(126,80,146,.14),transparent 28%),linear-gradient(145deg,#101318,#090c10 70%)!important}.fd-ff-main>span,.fd-ff-head span{color:#aa886d;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-ff-main h1{max-width:900px;margin:9px 0 13px;color:#eee4da;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.4rem,4vw,4.7rem);font-weight:500;line-height:.94;letter-spacing:-.05em}.fd-ff-main>p{max-width:870px;margin:0;color:#918885;font-size:12px;line-height:1.72}.fd-ff-main>p b{color:#d7c9bd}.fd-ff-simple{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:9px;align-items:center;margin:20px 0}.fd-ff-simple>div{min-height:84px;padding:13px;border:1px solid rgba(221,203,188,.07);border-radius:9px;background:rgba(255,255,255,.018);display:grid;grid-template-columns:25px 1fr;gap:4px 8px;align-content:center}.fd-ff-simple>div.match{border-color:rgba(132,164,117,.17);background:rgba(111,145,95,.045)}.fd-ff-simple b{grid-row:1/3;width:25px;height:25px;display:grid;place-items:center;border:1px solid rgba(172,129,193,.2);border-radius:7px;color:#b88dcc;font-size:8px}.fd-ff-simple strong{font-size:8px;color:#cec3bb;letter-spacing:.07em}.fd-ff-simple small{font-size:7px;color:#71696a;line-height:1.35}.fd-ff-simple>i{font-style:normal;color:#635861}.fd-ff-kid-copy{margin-bottom:18px!important;padding:11px 12px;border-left:2px solid rgba(172,129,193,.25);background:rgba(255,255,255,.012);font-size:8px!important}.fd-ff-companion{padding:12px;border:1px solid rgba(172,129,193,.13);border-radius:12px;background:linear-gradient(145deg,rgba(113,72,140,.05),rgba(151,117,91,.02));align-self:start}.fd-ff-companion>div{display:flex;justify-content:space-between;gap:8px;margin-bottom:8px}.fd-ff-companion span{color:#a98972;font-size:7px;font-weight:900;letter-spacing:.12em}.fd-ff-companion small{color:#6f6867;font-size:6px}.fd-ff-companion>a{display:block;margin-top:8px;text-align:center;color:#b58ac6;font-size:7px;font-weight:900;text-decoration:none}.fd-ff-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:12px}.fd-ff-list,.fd-ff-explain,.fd-ff-history{padding:22px}.fd-ff-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:16px}.fd-ff-head h2{margin:5px 0 0;color:#ded4cb;font-family:Georgia,serif;font-size:22px;font-weight:500}.fd-ff-head>small{color:#736c6c;font-size:8px}.fd-ff-compare{display:grid;gap:9px}.fd-ff-compare>div{padding:15px;border:1px solid rgba(221,203,188,.065);border-radius:9px;background:rgba(255,255,255,.015);display:grid;grid-template-columns:30px 1fr;gap:3px 9px}.fd-ff-compare b{grid-row:1/4;width:30px;height:30px;display:grid;place-items:center;border-radius:8px;background:rgba(119,76,146,.08);color:#b289c2}.fd-ff-compare strong{font-size:8px;letter-spacing:.08em}.fd-ff-compare span{color:#bdb3ac;font-size:8px}.fd-ff-compare small{color:#71696a;font-size:7px}.fd-ff-links{display:flex;gap:12px;margin-top:16px}.fd-ff-links a{color:#b58ac6;font-size:8px;font-weight:900;text-decoration:none}@media(max-width:1050px){.fd-ff-hero{grid-template-columns:1fr}.fd-ff-companion{max-width:320px}.fd-ff-simple{grid-template-columns:1fr}.fd-ff-simple>i{display:none}}@media(max-width:850px){.fd-ff-grid{grid-template-columns:1fr}.fd-ff-hero,.fd-ff-list,.fd-ff-explain,.fd-ff-history{padding:18px}}
    `}</style>
  </DashboardPageShell>;
}
