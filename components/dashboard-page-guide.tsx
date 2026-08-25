import Link from "next/link";

type Guide = {
  kicker: string;
  simple: string;
  purpose: string;
  why: string;
  useWhen: string;
  next: readonly { label: string; href: string }[];
};

const guides: Record<string, Guide> = {
  Dashboard: {
    kicker: "YOUR FATEDROP HOME",
    simple: "This is the overview of what FateDrop is seeing for you and across the network.",
    purpose: "Use the Dashboard to understand recent signal activity, your FateMatch watches, live network health, current buying context and the quickest route into each collector tool.",
    why: "It brings the important evidence together so you do not have to open every tool just to understand what changed.",
    useWhen: "Start here when you open FateDrop and want the fastest picture of what is happening now.",
    next: [{ label: "Search the network", href: "/dashboard/search" }, { label: "Open FateFind", href: "/dashboard/fatefind" }, { label: "See Alerts", href: "/dashboard/alerts" }],
  },
  Search: {
    kicker: "FIND WHAT EXISTS",
    simple: "Search answers: “What does FateDrop currently know about this product?”",
    purpose: "It groups observed retailer offers under the product, then shows stock, item price, delivery when known, RRP/reference context and a direct route to the retailer.",
    why: "Search is deliberately factual. It shows the network evidence without pretending that the cheapest raw price is automatically the best deal.",
    useWhen: "Use Search when you know the product and want to see where it exists before deciding whether to compare value or start a watch.",
    next: [{ label: "Compare with FateFind", href: "/dashboard/fatefind" }, { label: "Create a FateMatch", href: "/dashboard/watchlist" }, { label: "Explore Indies", href: "/dashboard/stores" }],
  },
  FateFind: {
    kicker: "BEST VALUE NOW",
    simple: "FateFind answers: “Which comparable live option gives me the strongest value right now?”",
    purpose: "Choose comparable products or configurations and FateDrop judges item price against the correct RRP/reference first. Known delivery remains separate and is added into True Price only when the cost is real.",
    why: "A £9 single pack can be cheaper to buy than a £16 four-pack while still being far worse value. FateFind explains that difference instead of ranking by the smallest checkout number.",
    useWhen: "Use FateFind when you are ready to buy now and want an explainable value comparison rather than a simple price list.",
    next: [{ label: "Search first", href: "/dashboard/search" }, { label: "Watch with FateMatch", href: "/dashboard/watchlist" }, { label: "See signal history", href: "/dashboard/alerts" }],
  },
  FateMatch: {
    kicker: "WATCH MY CONDITIONS",
    simple: "FateMatch answers: “Tell me when this specific product becomes buyable on my terms.”",
    purpose: "Pick the product, then optionally set stock, item-price, True Price, RRP percentage or retailer conditions. FateDrop Cloud keeps watching even when you are away.",
    why: "You should not have to repeatedly search the same product or react to every generic stock ping. A FateMatch only matters when a real observed offer satisfies the rules you chose.",
    useWhen: "Use FateMatch when the product matters to you but the current stock or price does not yet fit.",
    next: [{ label: "Find value now", href: "/dashboard/fatefind" }, { label: "Review Alerts", href: "/dashboard/alerts" }, { label: "Choose companion", href: "/dashboard/avatar" }],
  },
  Alerts: {
    kicker: "WHAT ACTUALLY HAPPENED",
    simple: "Alerts is FateDrop’s evidence ledger: what changed, why it changed and where that opportunity sits in its lifecycle.",
    purpose: "Whisper means movement, Echo means readiness or access changed, Manifested means purchasable stock was confirmed, and Vanished means that previously confirmed availability is gone. Cause is recorded separately so queue, restock, security and sold-out events do not get blurred together.",
    why: "The goal is precision rather than noise. FateDrop would rather show fewer useful alerts than fill the feed with stale or misleading pings.",
    useWhen: "Use Alerts to understand network movement, inspect a signal, revisit a FateMatch result or check why something disappeared.",
    next: [{ label: "Tune notifications", href: "/dashboard/notifications" }, { label: "Compare value", href: "/dashboard/fatefind" }, { label: "Manage FateMatch", href: "/dashboard/watchlist" }],
  },
  Wishlist: {
    kicker: "SAVE IT WITHOUT WATCHING IT",
    simple: "Wishlist means “I want this.” It does not automatically create an alert rule.",
    purpose: "Save products independently of retailer, stock or price so you have one clean list of things you care about. From there you can Search, run FateFind or turn that intent into a FateMatch watch.",
    why: "Keeping Wishlist separate from monitoring prevents every saved product becoming notification noise.",
    useWhen: "Use Wishlist when you want to remember a product but are not yet asking FateDrop to actively watch buying conditions.",
    next: [{ label: "Search saved products", href: "/dashboard/search" }, { label: "Compare value", href: "/dashboard/fatefind" }, { label: "Start watching", href: "/dashboard/watchlist" }],
  },
  Events: {
    kicker: "FATE ENCOUNTERS",
    simple: "Events helps you discover real TCG shows, venues, organisers and published vendor information.",
    purpose: "FateDrop keeps event evidence separate from retailer inventory. You can inspect the source, plan where to go and see participating vendors only when that information is genuinely published.",
    why: "A useful events network should help collectors meet the hobby in the real world without turning an event listing into a fake stock claim.",
    useWhen: "Use Events when you want to find upcoming shows, card fairs, venues or participating sellers.",
    next: [{ label: "Open Local Radar", href: "/dashboard/local-radar" }, { label: "Explore Indies", href: "/dashboard/stores" }],
  },
  "Indies & Retailers": {
    kicker: "THE RETAILER NETWORK",
    simple: "This is where collectors discover the businesses FateDrop can see — from national comparison retailers to smaller independent stores.",
    purpose: "National/RRP retailers provide useful reference and availability context. Indies expand choice and can participate in the FateDrop network without surrendering their own checkout or customer relationship.",
    why: "More trustworthy retailer coverage makes Search, FateFind and FateMatch more useful while giving smaller businesses a route to collectors they may not otherwise reach.",
    useWhen: "Use this page when you want to explore where FateDrop gets its offers from or deliberately discover an independent retailer.",
    next: [{ label: "Search products", href: "/dashboard/search" }, { label: "Find best value", href: "/dashboard/fatefind" }, { label: "Open Local Radar", href: "/dashboard/local-radar" }],
  },
  "Indie Dashboard": {
    kicker: "PROVE THE VALUE TO RETAILERS",
    simple: "This private workspace shows an Indie what measurable value FateDrop is creating for its business.",
    purpose: "It reports privacy-safe product appearances, FateFind visibility, Best Value wins, storefront views, retailer visits, FateMatch handoffs and anonymous demand signals.",
    why: "FateDrop can demonstrate real traffic and intent before asking a small business to pay. We measure what we can prove and never call a retailer visit a sale without verified conversion data.",
    useWhen: "Retailer owners use this page to understand how collectors are finding them and where demand may exist in the network.",
    next: [{ label: "View retailer network", href: "/dashboard/stores" }, { label: "See FateFind", href: "/dashboard/fatefind" }],
  },
  "Local Radar": {
    kicker: "DISCOVER WHAT IS NEAR YOU",
    simple: "Local Radar finds useful physical TCG places around a location without pretending that a nearby shop has stock we have not verified.",
    purpose: "Use device location or a UK postcode to discover nearby shops and location-aware network information. Physical location evidence and live inventory evidence remain separate.",
    why: "A shop being nearby is useful; a shop being nearby and actually carrying the product is a different claim. FateDrop keeps that distinction honest.",
    useWhen: "Use Local Radar when you want to shop or attend the hobby locally rather than only online.",
    next: [{ label: "Explore Events", href: "/dashboard/events" }, { label: "Browse Indies", href: "/dashboard/stores" }],
  },
  Discord: {
    kicker: "ONE MEMBERSHIP · ANOTHER DELIVERY SURFACE",
    simple: "Discord is an extension of your FateDrop ID, not a separate subscription.",
    purpose: "Link your Discord identity so the same FateDrop Plus entitlement can control premium role access and eligible notification delivery. The community can remain open while deeper buying intelligence stays entitlement-gated.",
    why: "Your Website, App and Discord access should agree. Paying once should not create three disconnected membership records.",
    useWhen: "Use this page to connect Discord, confirm role eligibility or resynchronise your membership access.",
    next: [{ label: "Check Membership", href: "/dashboard/membership" }, { label: "Tune notifications", href: "/dashboard/notifications" }],
  },
  "Koru & Friends": {
    kicker: "PERSONALITY ON TOP OF THE EVIDENCE",
    simple: "Your companion changes how FateDrop feels, not what the underlying signal means.",
    purpose: "Choose Koru, Fenn, Aeris, Nyxen or Solix as the companion attached to your FateDrop experience and personal watches. Every companion reads the same Cloud evidence and lifecycle truth.",
    why: "The character layer gives FateDrop personality and makes monitoring feel personal without compromising the seriousness of the intelligence underneath.",
    useWhen: "Use this page when you want to change who represents your account and reacts to your FateMatch journey.",
    next: [{ label: "Create a FateMatch", href: "/dashboard/watchlist" }, { label: "Open Alerts", href: "/dashboard/alerts" }],
  },
  Membership: {
    kicker: "FREE OR FATEDROP PLUS",
    simple: "One paid collector membership unlocks the deeper FateDrop intelligence across Web, App and linked Discord.",
    purpose: "Free access keeps discovery useful. FateDrop Plus unlocks the intelligent monitoring and premium alert layer without creating a separate app plan or a second consumer tier.",
    why: "The membership model stays understandable: one FateDrop ID, one entitlement and no need to pay again just because you change device or delivery channel.",
    useWhen: "Use this page to start the trial, check your current entitlement, manage billing or confirm when access renews or ends.",
    next: [{ label: "Connect Discord", href: "/dashboard/discord" }, { label: "Tune notifications", href: "/dashboard/notifications" }, { label: "Open FateMatch", href: "/dashboard/watchlist" }],
  },
  "My FateDrop ID": {
    kicker: "ONE IDENTITY ACROSS THE NETWORK",
    simple: "Your FateDrop ID is the account that ties your username, membership, companion and connected surfaces together.",
    purpose: "The same identity should appear on Web and App, while linked Discord consumes the same entitlement instead of becoming a separate account system.",
    why: "A single identity makes watches, preferences and membership portable across the FateDrop ecosystem.",
    useWhen: "Use this page to confirm who you are signed in as, your membership state and the companion attached to your account.",
    next: [{ label: "Edit account", href: "/account" }, { label: "Choose companion", href: "/dashboard/avatar" }, { label: "Check Membership", href: "/dashboard/membership" }],
  },
  "Notification Preferences": {
    kicker: "CONTROL INTERRUPTION, NOT OBSERVATION",
    simple: "These settings decide what should reach you and through which channels. They do not turn the underlying FateDrop network monitoring off.",
    purpose: "Choose which lifecycle stages, product categories and personal events are important enough to notify you, then let the same preference profile feed supported Web, App and Discord delivery.",
    why: "FateDrop can keep broad intelligence in the background while only interrupting you for the signals you actually care about.",
    useWhen: "Use this page when alerts feel too broad, too frequent or you want different delivery behaviour across your account.",
    next: [{ label: "Review Alerts", href: "/dashboard/alerts" }, { label: "Connect Discord", href: "/dashboard/discord" }, { label: "Manage FateMatch", href: "/dashboard/watchlist" }],
  },
};

function keyFor(title: string) {
  if (title.startsWith("Dashboard ·")) return "Dashboard";
  return title;
}

export function DashboardPageGuide({ title }: { title: string }) {
  const guide = guides[keyFor(title)];
  if (!guide) return null;

  return <section className="fd-page-guide" aria-label={`${keyFor(title)} explained`}>
    <div className="fd-page-guide-main">
      <span>{guide.kicker}</span>
      <h2>{guide.simple}</h2>
      <p>{guide.purpose}</p>
    </div>
    <div className="fd-page-guide-facts">
      <article><small>WHY IT MATTERS</small><p>{guide.why}</p></article>
      <article><small>USE THIS WHEN</small><p>{guide.useWhen}</p></article>
    </div>
    <nav aria-label="Related FateDrop tools">{guide.next.map((item) => <Link key={`${item.href}-${item.label}`} href={item.href}>{item.label}<b>→</b></Link>)}</nav>
    <style>{`
      .fd-page-guide{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:18px 28px;margin:0 auto 12px;max-width:1600px;padding:22px 24px;border:1px solid rgba(221,203,188,.095);border-radius:13px;background:radial-gradient(circle at 92% 0%,rgba(127,89,143,.12),transparent 28%),linear-gradient(145deg,#101419,#0a0e12 72%);box-shadow:inset 0 1px rgba(255,255,255,.02)}
      .fd-page-guide:after{content:'';position:absolute;right:-72px;bottom:-110px;width:250px;height:250px;border:1px solid rgba(185,151,128,.07);border-radius:42% 58% 49% 51%;transform:rotate(24deg);pointer-events:none}.fd-page-guide-main{position:relative;z-index:1}.fd-page-guide-main>span{display:block;color:#b6977d;font-size:10px;font-weight:900;letter-spacing:.15em}.fd-page-guide-main h2{max-width:900px;margin:7px 0 9px;color:#eee5dd;font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.65rem,2.4vw,2.65rem);font-weight:500;line-height:1.06;letter-spacing:-.035em}.fd-page-guide-main p{max-width:900px;margin:0;color:#a59ca0;font-size:13px!important;line-height:1.7!important}.fd-page-guide-facts{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:8px}.fd-page-guide-facts article{padding:13px;border:1px solid rgba(221,203,188,.065);border-radius:9px;background:rgba(255,255,255,.015)}.fd-page-guide-facts small{display:block;color:#947d69;font-size:9px!important;font-weight:900;letter-spacing:.1em}.fd-page-guide-facts p{margin:6px 0 0;color:#92898d;font-size:11px!important;line-height:1.55!important}.fd-page-guide nav{position:relative;z-index:1;grid-column:1/-1;display:flex;gap:7px;flex-wrap:wrap;padding-top:12px;border-top:1px solid rgba(221,203,188,.06)}.fd-page-guide nav a{min-height:34px;padding:0 11px;display:inline-flex;align-items:center;gap:11px;border:1px solid rgba(183,151,125,.12);border-radius:8px;color:#c7b19f!important;background:rgba(183,151,125,.035);font-size:10px!important;font-weight:850;text-decoration:none}.fd-page-guide nav a:hover{border-color:rgba(188,143,205,.2);color:#e5d5ea!important;background:rgba(126,82,146,.06)}.fd-page-guide nav b{color:#8e6d98;font-weight:700}@media(max-width:960px){.fd-page-guide{grid-template-columns:1fr}.fd-page-guide nav{grid-column:auto}}@media(max-width:620px){.fd-page-guide{padding:18px}.fd-page-guide-facts{grid-template-columns:1fr}.fd-page-guide-main h2{font-size:1.75rem}.fd-page-guide nav{display:grid}.fd-page-guide nav a{justify-content:space-between}}
    `}</style>
  </section>;
}
