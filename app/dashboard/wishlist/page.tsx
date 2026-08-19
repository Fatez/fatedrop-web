import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { RemoveWishlistButton } from "@/components/wishlist-actions";
import { WishlistCreateForm } from "@/components/wishlist-create-form";
import { getCurrentSnapshot } from "@/lib/auth";
import { listWishlist } from "@/lib/wishlist-storage";

export const metadata: Metadata = { title: "Wishlist | FateDrop Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/wishlist");
  let items = [] as Awaited<ReturnType<typeof listWishlist>>;
  let persistent = true;
  try { items = await listWishlist(snapshot.account.id); } catch { persistent = false; }

  return <DashboardPageShell title="Wishlist" eyebrow="SAVE WHAT YOU WANT">
    <div className="fd-wishlist-page">
      <section className="fd-dash-card fd-wishlist-hero">
        <div className="fd-dash-card-head"><span>UNIVERSAL WISHLIST</span><i className={persistent ? "live" : "pending"}>{persistent ? "● PERSISTENT" : "○ MIGRATION READY"}</i></div>
        <h1>Wishlist means “I want this.”<br/><em>FateFind means “go hunt this for me.”</em></h1>
        <p>Save a product regardless of retailer or stock state. When you want conditions such as a maximum delivered price, RRP premium or local radius, turn that intent into a FateFind instead.</p>
        {persistent ? <WishlistCreateForm/> : null}
        <div className="fd-wishlist-links"><Link href="/dashboard/search">Search products →</Link><Link href="/dashboard/watchlist">Open FateFind →</Link></div>
      </section>

      <section className="fd-dash-card fd-wishlist-list">
        <div className="fd-dash-card-head"><span>YOUR SAVED PRODUCTS</span><small>{items.length} SAVED</small></div>
        {!persistent ? <div className="fd-dashboard-empty"><strong>Wishlist persistence is staged.</strong><span>The additive `2026-08-19-user-preferences.sql` migration must be applied to the production database before saves become persistent. No fake local fallback is shown.</span></div> : items.length ? <div className="fd-wishlist-grid">{items.map((item) => <article key={item.id}><div><small>{item.tcg || "TCG"}</small><h2>{item.title}</h2><p>Saved {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.updatedAt * 1000))}</p></div><div className="fd-wishlist-actions"><Link href={`/dashboard/search?q=${encodeURIComponent(item.query)}`}>SEARCH →</Link><Link href={`/dashboard/watchlist?q=${encodeURIComponent(item.query)}`}>CREATE FATEFIND →</Link><RemoveWishlistButton id={item.id}/></div></article>)}</div> : <div className="fd-dashboard-empty"><strong>Your Wishlist is empty.</strong><span>Save a product above or search the network. Wishlist stays deliberately simpler than FateFind.</span><Link className="fd-dashboard-wide-button" href="/dashboard/search">Search the network →</Link></div>}
      </section>
    </div>
    <style>{`.fd-wishlist-page{display:grid;gap:22px}.fd-wishlist-hero,.fd-wishlist-list{padding:28px}.fd-wishlist-hero h1{margin:18px 0 10px;font-size:clamp(2rem,4vw,4rem);line-height:.96;letter-spacing:-.05em}.fd-wishlist-hero h1 em{font-style:normal;color:#9eefff}.fd-wishlist-hero p{max-width:850px;color:#99929f;line-height:1.7}.fd-wishlist-links{display:flex;gap:10px;margin-top:20px}.fd-wishlist-hero a,.fd-wishlist-actions a{color:#bfefff;font-size:9px;font-weight:900;text-decoration:none}.fd-wishlist-grid{display:grid;gap:10px;margin-top:18px}.fd-wishlist-grid article{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px;border:1px solid rgba(255,255,255,.075);border-radius:15px;background:#0b0a10}.fd-wishlist-grid small{color:#73e9fb;font-size:7px;font-weight:900;letter-spacing:.12em}.fd-wishlist-grid h2{margin:5px 0;font-size:17px}.fd-wishlist-grid p{margin:0;color:#716b77;font-size:9px}.fd-wishlist-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.fd-wishlist-actions :global(.fd-inline-remove){border:1px solid rgba(255,255,255,.1);border-radius:8px;background:transparent;color:#8c8591;padding:7px 9px;font-size:7px;font-weight:900}@media(max-width:700px){.fd-wishlist-grid article{align-items:flex-start;flex-direction:column}.fd-wishlist-links{flex-direction:column}}`}</style>
  </DashboardPageShell>;
}
