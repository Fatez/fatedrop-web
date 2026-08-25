/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSignOut } from "@/components/account-signout";
import { BrandMark } from "@/components/brand-mark";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardPageGuide } from "@/components/dashboard-page-guide";
import { getCurrentSnapshot } from "@/lib/auth";
import { membershipLabel } from "@/lib/membership";

export async function DashboardPageShell({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect(`/account/login?next=/dashboard`);
  const plan = membershipLabel(snapshot.membership);

  return <main className="fd-dashboard fd-collector-dashboard fd-reference-dashboard">
    <aside className="fd-ref-sidebar">
      <div className="fd-ref-brand"><BrandMark/></div>
      <DashboardNav/>
      <div className="fd-ref-sidebar-foot">
        <Link href="/dashboard/notifications" className="fd-ref-settings"><span>⚙</span><b>Settings</b></Link>
        <div className="fd-ref-divider" />
        <Link href="/dashboard/profile" className="fd-ref-account">
          {snapshot.account.avatarUrl ? <span className="fd-ref-avatar" style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }}/> : <img src="/assets/fatedrop-logo-mark.png" alt=""/>}
          <div><strong>{snapshot.account.displayName}</strong><small>{plan}</small></div><i>⌄</i>
        </Link>
        <div className="fd-ref-signout"><AccountSignOut/></div>
        <div className="fd-ref-trust"><b>FATEDROP</b><span>TRUST THE SIGNAL.</span><i/></div>
      </div>
    </aside>

    <section className="fd-ref-main">
      <header className="fd-ref-topbar">
        <form action="/dashboard/search" method="get" className="fd-ref-search">
          <span>⌕</span><input name="q" aria-label="Search cards, sets or retailers" placeholder="Search cards, sets or retailers…"/><kbd>⌘K</kbd>
        </form>
        <nav className="fd-ref-top-actions" aria-label="Dashboard quick actions">
          <Link href="/dashboard/alerts" aria-label="Open alerts"><span>♧</span></Link>
          <Link href="/dashboard/wishlist" aria-label="Open wishlist"><span>☆</span></Link>
          <Link href="/dashboard/profile" className="fd-ref-profile">
            {snapshot.account.avatarUrl ? <span className="fd-ref-top-avatar" style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }}/> : <img src="/assets/fatedrop-logo-mark.png" alt=""/>}
            <div><strong>{snapshot.account.displayName}</strong><small>{plan}</small></div><i>⌄</i>
          </Link>
        </nav>
      </header>
      <div className="fd-ref-mobile-title"><small>{eyebrow || "FATEDROP"}</small><span>{title}</span></div>
      <div className="fd-dashboard-content-frame"><DashboardPageGuide title={title}/>{children}</div>
    </section>

    <style>{`
      .fd-reference-dashboard{position:relative;display:grid!important;grid-template-columns:238px minmax(0,1fr)!important;min-height:100vh;background:#070a0d!important;color:#e9e1db!important}.fd-ref-sidebar{position:sticky;top:0;height:100vh;padding:18px 12px 16px;display:flex;flex-direction:column;gap:20px;overflow-y:auto;border-right:1px solid rgba(221,203,188,.075);background:linear-gradient(180deg,#080b0f 0%,#090c10 58%,#080b0e 100%)}.fd-ref-brand{padding:2px 7px 10px}.fd-ref-brand .brand-logo-image{width:33px;height:33px;flex-basis:33px}.fd-ref-brand .brand-word{font-size:18px}.fd-ref-sidebar-foot{margin-top:auto;display:grid;gap:9px}.fd-ref-settings{min-height:44px;padding:0 12px;display:grid;grid-template-columns:25px 1fr;gap:8px;align-items:center;border-radius:8px;color:#aaa2a8;font-size:12px;text-decoration:none}.fd-ref-settings:hover{background:rgba(255,255,255,.025);color:#e8dfd8}.fd-ref-settings b{font:inherit;font-weight:650}.fd-ref-settings span{display:grid;place-items:center;font-size:13px}.fd-ref-divider{height:1px;background:rgba(221,203,188,.07);margin:3px 0}.fd-ref-account{min-height:54px;padding:7px 8px;display:grid;grid-template-columns:34px 1fr auto;gap:9px;align-items:center;border:1px solid rgba(221,203,188,.06);border-radius:10px;background:rgba(255,255,255,.015);text-decoration:none}.fd-ref-account>img,.fd-ref-avatar{width:34px;height:34px;border-radius:50%;background:#0f1115 center/cover no-repeat;object-fit:cover}.fd-ref-account div{display:grid;gap:2px;min-width:0}.fd-ref-account strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.fd-ref-account small{color:#aaa1a7;font-size:11px}.fd-ref-account i{color:#675f65;font-size:10px;font-style:normal}.fd-ref-signout{padding:0 10px}.fd-ref-signout .account-signout{color:#9a9297!important;font-size:11px!important}.fd-ref-trust{margin-top:9px;padding:18px 8px 5px;display:grid;place-items:center;gap:4px;color:#8d775f;text-align:center}.fd-ref-trust b{font-family:Georgia,serif;font-size:12px;font-weight:500;letter-spacing:.24em}.fd-ref-trust span{font-size:8px;font-weight:900;letter-spacing:.22em}.fd-ref-trust i{width:112px;height:1px;margin-top:9px;background:linear-gradient(90deg,transparent,#8b745f,transparent);opacity:.45}
      .fd-ref-main{min-width:0;overflow:hidden;background:radial-gradient(circle at 76% 2%,rgba(103,63,127,.055),transparent 28rem),#080b0f}.fd-ref-topbar{height:66px;padding:10px 18px;display:flex;align-items:center;gap:16px;border-bottom:1px solid rgba(221,203,188,.06);background:rgba(8,11,15,.91);backdrop-filter:blur(16px);position:sticky;top:0;z-index:20}.fd-ref-search{height:40px;max-width:650px;flex:1;margin-left:auto;display:grid;grid-template-columns:26px 1fr auto;align-items:center;border:1px solid rgba(221,203,188,.085);border-radius:10px;background:#0d1115;box-shadow:inset 0 1px rgba(255,255,255,.015)}.fd-ref-search>span{display:grid;place-items:center;color:#888187;font-size:16px}.fd-ref-search input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#ece3dc;font-size:14px}.fd-ref-search input::placeholder{color:#827b80}.fd-ref-search kbd{margin-right:8px;padding:5px 7px;border:1px solid rgba(221,203,188,.08);border-radius:6px;color:#8e878c;background:#0a0d11;font-size:10px;font-family:inherit}.fd-ref-top-actions{display:flex;align-items:center;gap:8px}.fd-ref-top-actions>a:not(.fd-ref-profile){width:36px;height:36px;display:grid;place-items:center;border:1px solid rgba(221,203,188,.07);border-radius:50%;color:#aba2a6;background:#0b0e12;font-size:15px}.fd-ref-top-actions>a:not(.fd-ref-profile):hover{border-color:rgba(171,118,210,.2);color:#cfafe6}.fd-ref-profile{min-width:154px;height:44px;padding:5px 9px;display:grid;grid-template-columns:30px 1fr auto;gap:8px;align-items:center;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:#0b0e12;text-decoration:none}.fd-ref-profile>img,.fd-ref-top-avatar{width:30px;height:30px;border-radius:50%;object-fit:cover;background:#101318 center/cover no-repeat}.fd-ref-profile div{display:grid;gap:1px}.fd-ref-profile strong{font-size:13px}.fd-ref-profile small{color:#aaa1a7;font-size:11px}.fd-ref-profile i{color:#655f64;font-size:10px;font-style:normal}.fd-ref-mobile-title{display:none}.fd-dashboard-content-frame{min-width:0;padding:18px 22px 34px}.fd-dashboard-content-frame:before{display:none!important}
      .fd-dashboard-content-frame p{font-size:max(13px,1em)!important;line-height:1.65!important}.fd-dashboard-content-frame small{font-size:max(10.5px,1em)!important;line-height:1.45!important}.fd-dashboard-content-frame label{font-size:max(11px,1em)!important;line-height:1.4!important}.fd-dashboard-content-frame button,.fd-dashboard-content-frame input,.fd-dashboard-content-frame select,.fd-dashboard-content-frame textarea{font-size:max(12px,1em)!important}.fd-dashboard-content-frame a{font-size:max(11.5px,1em)}.fd-dashboard-content-frame [class*="copy"],.fd-dashboard-content-frame [class*="detail"],.fd-dashboard-content-frame [class*="sub"]{line-height:1.6!important}.fd-dashboard-content-frame h1{line-height:1.12!important}.fd-dashboard-content-frame h2,.fd-dashboard-content-frame h3{line-height:1.2!important}
      @media(max-width:1040px){.fd-reference-dashboard{grid-template-columns:220px minmax(0,1fr)!important}.fd-ref-sidebar{padding-inline:10px}.fd-ref-profile{min-width:44px;width:44px;padding:6px}.fd-ref-profile div,.fd-ref-profile i{display:none}.fd-ref-profile>img,.fd-ref-top-avatar{width:30px;height:30px}.fd-ref-search{max-width:none}}
      @media(max-width:760px){.fd-reference-dashboard{display:block!important}.fd-ref-sidebar{position:relative;width:100%;height:auto;max-height:none;border-right:0;border-bottom:1px solid rgba(221,203,188,.07)}.fd-ref-sidebar-foot{margin-top:0}.fd-ref-account,.fd-ref-signout,.fd-ref-trust{display:none}.fd-ref-topbar{position:relative;height:auto;flex-wrap:wrap;padding:10px}.fd-ref-search{order:2;flex-basis:100%;height:42px}.fd-ref-top-actions{margin-left:auto}.fd-ref-mobile-title{padding:14px 14px 0;display:grid;gap:3px}.fd-ref-mobile-title small{color:#ac927a;font-size:11px;font-weight:900;letter-spacing:.16em}.fd-ref-mobile-title span{color:#e9e1db;font-family:Georgia,serif;font-size:24px}.fd-dashboard-content-frame{padding:12px 10px 24px}}
    `}</style>
  </main>;
}
