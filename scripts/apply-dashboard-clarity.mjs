import { readFileSync, writeFileSync } from 'node:fs';

const path = 'app/dashboard/page.tsx';
let source = readFileSync(path, 'utf8');

function replaceOnce(before, after, label) {
  if (!source.includes(before)) throw new Error(`Dashboard clarity patch could not find: ${label}`);
  source = source.replace(before, after);
}

replaceOnce(
`  const series = Object.fromEntries(\n    lifecycle.map(([key]) => [key, data.signalSummary?.[key].trend ?? []]),\n  ) as Record<LifecycleKey, TrendPoint[]>;`,
`  const series = Object.fromEntries(\n    lifecycle.map(([key]) => [key, data.signalSummary?.[key].trend ?? []]),\n  ) as Record<LifecycleKey, TrendPoint[]>;\n  const signalActivity7d = lifecycle.every(([key]) => data.publicSignalMetrics[key] === null || data.publicSignalMetrics[key] === undefined)\n    ? null\n    : lifecycle.reduce((total, [key]) => total + (data.publicSignalMetrics[key] ?? 0), 0);`,
'7D signal activity total',
);

replaceOnce(
'<div><h1>Signals Overview</h1><p>Daily Whisper, Echo, Manifested and Vanished alerts recorded across the last seven days.</p></div>',
'<div><h1>Signals Overview</h1><p>What’s changing across the network — Whisper, Echo, Manifested and Vanished activity recorded across the last seven days.</p></div>',
'Signals Overview explainer',
);

replaceOnce(
'<div className="fd-ref-card-head compact"><div><h2>Recent Signals</h2><p>Newest observed movement.</p></div></div>',
'<div className="fd-ref-card-head compact"><div><h2>Recent Signals</h2><p>Latest network movement.</p></div></div>',
'Recent Signals subtitle',
);

replaceOnce(
'<div className="fd-ref-card-head compact"><div><h2>True Price Comparison</h2><p>{priceGroup?.[0]?.title || "Latest evidence-backed comparison"}</p></div></div>',
'<div className="fd-ref-card-head compact"><div><h2>True Price Comparison</h2><p>What you really pay.</p></div></div>',
'True Price subtitle',
);

replaceOnce(
'<p>Dashboard summaries only show the delivered value persisted with the signal. Item price and postage remain separate on the full True Price view where the source provides them.</p>',
'<p><b>{priceGroup[0]?.title}</b> · Item price + known mandatory delivery = True Price. Compare who is actually cheapest before checkout.</p>',
'True Price explainer',
);

replaceOnce(
'<div className="fd-ref-empty tall"><strong>No comparable delivered prices yet.</strong><span>FateDrop will not manufacture retailer rows to make this card look busy.</span></div>',
'<div className="fd-ref-empty tall"><strong>No comparable True Prices yet.</strong><span>FateDrop only compares delivered totals when the required price and delivery evidence is known.</span></div>',
'True Price empty state',
);

replaceOnce(
'<div className="fd-ref-card-head compact"><div><h2>FateFind</h2><p>Your saved product intent.</p></div></div>',
'<div className="fd-ref-card-head compact"><div><h2>FateFind</h2><p>Your saved hunts — FateMatch is a live offer that matches your rules.</p></div></div>',
'FateFind subtitle',
);

replaceOnce(
'<div className="fd-ref-empty"><strong>No FateFind activity yet.</strong><span>Create a hunt and qualifying results will surface here.</span></div>',
'<div className="fd-ref-empty"><strong>No FateFind activity yet.</strong><span>Tell FateDrop what you want and what you’re willing to pay. We keep watching the network for you.</span></div>',
'FateFind empty state',
);

replaceOnce(
'<Link className="fd-card-link" href="/dashboard/watchlist">Manage searches <span>→</span></Link>',
'<Link className="fd-card-link" href="/dashboard/watchlist">Manage FateFinds <span>→</span></Link>',
'FateFind CTA',
);

replaceOnce(
'<div className="fd-ref-card-head compact"><div><h2>Network Pulse</h2><p>Live scale across the network.</p></div></div>\n          <DashboardNetworkPulse retailers={network?.metrics.catalogueRetailers} products={network?.metrics.productsTracked} />',
'<div className="fd-ref-card-head compact"><div><h2>Network Pulse</h2><p>Live across the network.</p></div></div>\n          <DashboardNetworkPulse retailers={network?.metrics.catalogueRetailers} products={network?.metrics.productsTracked} signals={signalActivity7d} />',
'Network Pulse props and subtitle',
);

replaceOnce(
'<div className="fd-ref-card-head compact"><div><h2>Recent Manifested Drops</h2><p>Confirmed purchasable availability.</p></div></div>',
'<div className="fd-ref-card-head compact"><div><h2>Recent Manifested Drops</h2><p>Confirmed live stock.</p></div></div>',
'Manifested drops subtitle',
);

replaceOnce(
'<div className="fd-ref-card-head compact"><div><h2>Retailers You Track</h2><p>Stores connected to your activity.</p></div></div>',
'<div className="fd-ref-card-head compact"><div><h2>Independent Stores</h2><p>Discover more places to buy.</p></div></div>',
'Independent Stores heading',
);

replaceOnce(
'<div className="fd-ref-empty"><strong>No tracked retailers yet.</strong><span>Stores you interact with through FateDrop will appear here.</span></div>',
'<div className="fd-ref-empty"><strong>No independent stores in your activity yet.</strong><span>Explore the FateDrop network to discover more places to buy directly from the retailer.</span></div>',
'Independent Stores empty state',
);

replaceOnce(
'<Link className="fd-card-link" href="/dashboard/stores">Manage retailers <span>→</span></Link>',
'<Link className="fd-card-link" href="/dashboard/stores">Explore Independent Stores <span>→</span></Link>',
'Independent Stores CTA',
);

writeFileSync(path, source);
console.log('Dashboard clarity pass applied.');
