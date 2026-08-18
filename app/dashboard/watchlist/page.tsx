import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData, moneyFromPence, relativeTime } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Watchlist | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardWatchlistPage() {
  const snapshot = await getCurrentSnapshot();
  const data = snapshot ? await buildDashboardData(snapshot) : null;
  const items = data?.personal.watchlist ?? [];
  return (
    <DashboardPageShell title="Watchlist" eyebrow="SAVED HUNTS">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-watchlist-card">
          <div className="fd-dash-card-head"><span>WATCHLIST</span><small>{items.length} stored hit{items.length === 1 ? "" : "s"}</small></div>
          <div className="fd-dashboard-list">
            {items.length && data ? items.map((item) => <article key={item.id}><span className="fd-store-thumb">♡</span><div><strong>{item.title || "Wishlist match"}</strong><small>{item.retailer || item.subtitle || "FateDrop activity"}</small></div><aside>{item.amountPence ? moneyFromPence(item.amountPence) : "HIT"}<small>{relativeTime(item.occurredAt, data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No stored watchlist hits yet.</strong><span>Saved products and FateFind matches will appear here without disappearing when stock sells out.</span></div>}
          </div>
        </section>
        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>HOW IT WILL WORK</span><small>One saved-intent system</small></div>
          <div className="fd-network-message"><h1>Save the hunt, not just the listing.</h1><p>Watchlist will preserve the product you want across retailers and stock states, then connect matching Echo, Manifested and price signals when catalogue data is live.</p></div>
        </section>
      </div>
    </DashboardPageShell>
  );
}
