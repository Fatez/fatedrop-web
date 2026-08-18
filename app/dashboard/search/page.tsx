import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";

export const metadata: Metadata = { title: "Search | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return (
    <DashboardPageShell title="Search" eyebrow="NETWORK SEARCH">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-network-card">
          <div className="fd-dash-card-head"><span>SEARCH THE FATEDROP NETWORK</span><i className="live">● READY</i></div>
          <div className="fd-network-message"><h1>One search. Every connected catalogue.</h1><p>Search will use the same canonical product network that powers alerts, True Price and retailer comparisons as live catalogue data comes online.</p></div>
          <form action="/dashboard/search" method="get" className="fd-dashboard-search" style={{ maxWidth: 720, marginTop: 22 }}><span>⌕</span><input name="q" defaultValue={q} autoFocus aria-label="Search products" placeholder="Try: Elite Trainer Box, booster bundle, Charizard…" /></form>
        </section>
        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>{q ? `QUERY: ${q}` : "SEARCH STATUS"}</span><small>Live catalogue connection required</small></div>
          <div className="fd-dashboard-empty"><strong>{q ? "The search page is ready for live results." : "Enter a product or set above."}</strong><span>We will connect this view directly to the canonical FateDrop catalogue rather than duplicate the public marketing search.</span></div>
          <Link className="fd-dashboard-wide-button" href="/dashboard/alerts">View live signal feed →</Link>
        </section>
      </div>
    </DashboardPageShell>
  );
}
