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

  return <DashboardPageShell title="Wishlist" eyebrow="SAVE IT · DECIDE LATER">
    <div className="fd-wishlist-page">
      <section className="fd-dash-card fd-wishlist-hero">
        <div className="fd-dash-card-head"><span>UNIVERSAL WISHLIST</span><i className={persistent ? "live" : "pending"}>{persistent ? "● PERSISTENT" : "○ MIGRATION READY"}</i></div>
        <h1>Keep the products you care about.<br/><em>Choose what FateDrop should do with them later.</em></h1>
        <p><b>Wishlist means “I want this.”</b> <b>FateMatch means “let me know when this is in stock.”</b> Wishlist does not create a monitoring rule or guarantee an alert. When you are ready, Search can show current offers, FateFind can compare the strongest live value, and FateMatch can actively watch your buying conditions.</p>
        {persistent ? <WishlistCreateForm/> : null}
        <div className="fd-wishlist-path"><span><b>1</b><strong>SAVE</strong><small>Remember the product.</small></span><i>→</i><span><b>2</b><strong>COMPARE</strong><small>Use FateFind when buying now.</small></span><i>→</i><span><b>3</b><strong>WATCH</strong><small>Use FateMatch when waiting.</small></span></div>
        <div className="fd-wishlist-links"><Link href="/dashboard/fatefind">Open FateFind →</Link><Link href="/dashboard/watchlist">Open FateMatch →</Link></div>
      </section>

      <section className="fd-dash-card fd-wishlist-list">
        <div className="fd-dash-card-head"><span>YOUR SAVED PRODUCTS</span><small>{items.length} SAVED</small></div>
        {!persistent ? <div className="fd-dashboard-empty"><strong>Wishlist persistence is staged.</strong><span>The additive `2026-08-19-user-preferences.sql` migration must be applied to the production database before saves become persistent. No fake local fallback is shown.</span></div> : items.length ? <div className="fd-wishlist-grid">{items.map((item) => <article key={item.id}><div><small>{item.tcg || "TCG"}</small><h2>{item.title}</h2><p>Saved {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.updatedAt * 1000))}</p></div><div className="fd-wishlist-actions"><Link href={`/dashboard/search?q=${encodeURIComponent(item.query)}`}>SEARCH →</Link><Link href={`/dashboard/fatefind?q=${encodeURIComponent(item.query)}`}>FATEFIND →</Link><Link href={`/dashboard/watchlist?q=${encodeURIComponent(item.query)}`}>FATEMATCH →</Link><RemoveWishlistButton id={item.id}/></div></article>)}</div> : <div className="fd-dashboard-empty"><strong>Your Wishlist is empty.</strong><span>Save a product above or search the network. Wishlist stays deliberately simpler than FateFind or FateMatch.</span><Link className="fd-dashboard-wide-button" href="/dashboard/search">Search the network →</Link></div>}
      </section>
    </div>
    <style>{`
      .fd-wishlist-page{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-wishlist-page .fd-dash-card{border-color:rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0e1216,#090d11 74%)}.fd-wishlist-hero,.fd-wishlist-list{padding:28px}.fd-wishlist-hero{background:radial-gradient(circle at 90% 5%,rgba(126,87,143,.14),transparent 28%),linear-gradient(145deg,#101419,#090d11 70%)!important}.fd-wishlist-hero h1{max-width:980px;margin:18px 0 12px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4vw,4.7rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.fd-wishlist-hero h1 em{font-style:normal;color:#baa5b9}.fd-wishlist-hero p{max-width:920px;color:#a0989d;line-height:1.75}.fd-wishlist-hero p b{color:#d7c8bd}.fd-wishlist-path{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:8px;align-items:center;margin:20px 0}.fd-wishlist-path>span{min-height:76px;padding:12px;border:1px solid rgba(221,203,188,.065);border-radius:9px;background:rgba(255,255,255,.015);display:grid;grid-template-columns:25px 1fr;gap:3px 8px;align-content:center}.fd-wishlist-path b{grid-row:1/3;width:25px;height:25px;display:grid;place-items:center;border:1px solid rgba(183,151,125,.17);border-radius:7px;color:#c1a17e}.fd-wishlist-path strong{font-size:10px;letter-spacing:.07em}.fd-wishlist-path small{color:#7c7478;font-size:10px}.fd-wishlist-path>i{color:#61575e;font-style:normal}.fd-wishlist-links{display:flex;gap:10px;margin-top:20px}.fd-wishlist-hero a,.fd-wishlist-actions a{color:#c6a9cc;font-size:10px;font-weight:900;text-decoration:none}.fd-wishlist-grid{display:grid;gap:8px;margin-top:18px}.fd-wishlist-grid article{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:17px;border:1px solid rgba(221,203,188,.065);border-radius:11px;background:#0b0f13}.fd-wishlist-grid small{color:#aa886d;font-size:10px;font-weight:900;letter-spacing:.1em}.fd-wishlist-grid h2{margin:5px 0;color:#ded5ce;font-family:Georgia,serif;font-size:18px;font-weight:500}.fd-wishlist-grid p{margin:0;color:#81797d;font-size:11px}.fd-wishlist-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.fd-wishlist-actions :global(.fd-inline-remove){border:1px solid rgba(221,203,188,.08);border-radius:8px;background:transparent;color:#938a8f;padding:7px 9px;font-size:9px;font-weight:900}@media(max-width:760px){.fd-wishlist-path{grid-template-columns:1fr}.fd-wishlist-path>i{display:none}.fd-wishlist-grid article{align-items:flex-start;flex-direction:column}.fd-wishlist-links{flex-direction:column}.fd-wishlist-hero,.fd-wishlist-list{padding:18px}}
    `}</style>
  </DashboardPageShell>;
}
