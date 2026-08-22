"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [
  ["⌂", "Dashboard", "/dashboard"],
  ["⌕", "Search", "/dashboard/search"],
  ["♧", "Alerts", "/dashboard/alerts"],
  ["◎", "FateFind", "/dashboard/watchlist"],
  ["♡", "Watchlist", "/dashboard/wishlist"],
  ["◈", "True Price", "/dashboard/true-price"],
  ["□", "Events", "/dashboard/events"],
  ["⌘", "Indies", "/dashboard/stores"],
] as const;

const secondary = [
  ["⌖", "Local Radar", "/dashboard/local-radar"],
  ["#", "Discord", "/dashboard/discord"],
  ["◇", "Koru & Friends", "/dashboard/avatar"],
  ["♛", "Membership", "/dashboard/membership"],
] as const;

function active(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ pathname, item }: { pathname: string; item: readonly [string, string, string] }) {
  const [icon, label, href] = item;
  return <Link className={active(pathname, href) ? "active" : ""} href={href}>
    <span className="fd-nav-icon">{icon}</span><b>{label}</b><i aria-hidden="true"/>
  </Link>;
}

export function DashboardNav() {
  const pathname = usePathname();
  return <nav aria-label="Dashboard navigation" className="fd-ref-nav">
    <div className="fd-ref-nav-main">{primary.map((item) => <NavLink key={item[1]} pathname={pathname} item={item}/>)}</div>
    <div className="fd-ref-nav-more"><small>MORE</small>{secondary.map((item) => <NavLink key={item[1]} pathname={pathname} item={item}/>)}</div>
    <style jsx>{`
      .fd-ref-nav{display:grid;gap:22px;width:100%;min-width:0}.fd-ref-nav-main,.fd-ref-nav-more{display:grid;gap:4px}.fd-ref-nav-more{padding-top:4px;border-top:1px solid rgba(221,203,188,.065)}.fd-ref-nav-more>small{padding:9px 13px 5px;color:#504b50;font-size:6px;font-weight:900;letter-spacing:.18em}
      .fd-ref-nav :global(a){position:relative;min-height:40px;padding:0 12px;display:grid;grid-template-columns:25px minmax(0,1fr) 5px;gap:8px;align-items:center;border:1px solid transparent;border-radius:8px;color:#9d969d;font-size:10px;text-decoration:none;transition:.18s ease}.fd-ref-nav :global(a:hover){color:#e4dbd5;background:rgba(255,255,255,.025)}.fd-ref-nav :global(a.active){border-color:rgba(157,105,202,.18);color:#f0e7df;background:linear-gradient(90deg,rgba(120,70,179,.34),rgba(116,73,150,.14) 68%,transparent);box-shadow:inset 2px 0 rgba(172,111,235,.72)}.fd-ref-nav :global(a b){min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:inherit;font-weight:650}.fd-ref-nav :global(a i){width:4px;height:4px;border-radius:50%;background:transparent}.fd-ref-nav :global(a.active i){background:#b777e9;box-shadow:0 0 10px rgba(183,119,233,.72)}.fd-nav-icon{width:25px;display:grid;place-items:center;color:#b4acb4;font-size:14px}.fd-ref-nav :global(a.active .fd-nav-icon){color:#d3b5eb}@media(max-width:760px){.fd-ref-nav{grid-template-columns:1fr 1fr;gap:12px}.fd-ref-nav-main,.fd-ref-nav-more{padding:0;border:0}.fd-ref-nav-more>small{display:none}}
    `}</style>
  </nav>;
}
