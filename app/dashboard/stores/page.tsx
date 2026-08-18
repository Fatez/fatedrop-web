import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData, relativeTime } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Indie Stores | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardStoresPage() {
  const snapshot = await getCurrentSnapshot();
  const data = snapshot ? await buildDashboardData(snapshot) : null;
  const stores = data?.personal.favoriteStores ?? [];
  return (
    <DashboardPageShell title="Indie Stores" eyebrow="RETAILER NETWORK">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-stores-card">
          <div className="fd-dash-card-head"><span>YOUR STORES</span><Link href="/businesses">Public directory ↗</Link></div>
          <div className="fd-dashboard-list">
            {stores.length && data ? stores.map((store) => <article key={store.name}><span className="fd-store-thumb">◇</span><div><strong>{store.name}</strong><small>{store.count} tracked interaction{store.count === 1 ? "" : "s"}</small></div><aside>♡<small>{relativeTime(store.latestAt, data.generatedAt)}</small></aside></article>) : <div className="fd-dashboard-empty"><strong>No stores tracked yet.</strong><span>Your retailer activity and saved shops will collect here as the catalogue network becomes live.</span></div>}
          </div>
        </section>
        <section className="fd-dash-card">
          <div className="fd-dash-card-head"><span>CONNECTED RETAIL</span><small>Direct checkout remains with the retailer</small></div>
          <div className="fd-network-message"><h1>Your preferred shops in one place.</h1><p>FateDrop will surface verified storefronts, catalogue health, delivery context and the products each retailer currently has available.</p></div>
          <Link className="fd-dashboard-wide-button" href="/businesses">Explore retailer network →</Link>
        </section>
      </div>
    </DashboardPageShell>
  );
}
