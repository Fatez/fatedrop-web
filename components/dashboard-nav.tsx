"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [
  ["⌂", "Dashboard", "/dashboard", "Your FateDrop overview and the quickest route into each collector tool."],
  ["⌕", "Search", "/dashboard/search", "Find a product and see the live offers FateDrop currently knows about."],
  ["◎", "FateFind", "/dashboard/fatefind", "Find the strongest-value deal available now using RRP percentage and True Price intelligence."],
  ["◇", "FateMatch", "/dashboard/watchlist", "Set the product, budget and buying conditions; your companion watches until it qualifies."],
  ["♧", "Alerts", "/dashboard/alerts", "See the signals and personal alerts FateDrop has detected or delivered."],
  ["♡", "Wishlist", "/dashboard/wishlist", "Save products you want without creating a monitoring rule."],
  ["□", "Events", "/dashboard/events", "Discover relevant TCG events and Fate Encounters."],
  ["⌘", "Indies", "/dashboard/stores", "Discover independent retailers across the FateDrop network."],
] as const;

const secondary = [
  ["⌖", "Local Radar", "/dashboard/local-radar", "Discover useful physical TCG locations around you."],
  ["#", "Discord", "/dashboard/discord", "Connect your FateDrop account to Discord delivery and community features."],
  ["◇", "Koru & Friends", "/dashboard/avatar", "Choose the companion that represents your FateDrop experience and FateMatch watches."],
  ["♛", "Membership", "/dashboard/membership", "View your FateDrop membership and unlocked capabilities."],
] as const;

function active(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ pathname, item }: { pathname: string; item: readonly [string, string, string, string] }) {
  const [icon, label, href, description] = item;
  return <Link className={active(pathname, href) ? "active" : ""} href={href} title={description}>
    <span className="fd-nav-icon">{icon}</span><b>{label}</b><i aria-hidden="true"/>
  </Link>;
}

export function DashboardNav() {
  const pathname = usePathname();
  return <nav aria-label="Dashboard navigation" className="fd-ref-nav">
    <div className="fd-ref-nav-main">{primary.map((item) => <NavLink key={item[1]} pathname={pathname} item={item}/>)}</div>
    <div className="fd-ref-nav-more"><small>MORE</small>{secondary.map((item) => <NavLink key={item[1]} pathname={pathname} item={item}/>)}</div>
    <style jsx>{`
      .fd-ref-nav{display:grid;gap:22px;width:100%;min-width:0}.fd-ref-nav-main,.fd-ref-nav-more{display:grid;gap:5px}.fd-ref-nav-more{padding-top:6px;border-top:1px solid rgba(221,203,188,.065)}.fd-ref-nav-more>small{padding:10px 13px 6px;color:#756e74;font-size:10px;font-weight:900;letter-spacing:.16em}
      .fd-ref-nav :global(a){position:relative;min-height:44px;padding:0 12px;display:grid;grid-template-columns:27px minmax(0,1fr) 5px;gap:9px;align-items:center;border:1px solid transparent;border-radius:9px;color:#aaa2a8;font-size:13px;line-height:1.25;text-decoration:none;transition:.18s ease}.fd-ref-nav :global(a:hover){color:#e4dbd5;background:rgba(255,255,255,.025)}.fd-ref-nav :global(a.active){border-color:rgba(157,105,202,.18);color:#f0e7df;background:linear-gradient(90deg,rgba(120,70,179,.34),rgba(116,73,150,.14) 68%,transparent);box-shadow:inset 2px 0 rgba(172,111,235,.72)}.fd-ref-nav :global(a b){min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:inherit;font-weight:700}.fd-ref-nav :global(a i){width:4px;height:4px;border-radius:50%;background:transparent}.fd-ref-nav :global(a.active i){background:#b777e9;box-shadow:0 0 10px rgba(183,119,233,.72)}.fd-nav-icon{width:27px;display:grid;place-items:center;color:#b4acb4;font-size:16px}.fd-ref-nav :global(a.active .fd-nav-icon){color:#d3b5eb}@media(max-width:760px){.fd-ref-nav{grid-template-columns:1fr 1fr;gap:12px}.fd-ref-nav-main,.fd-ref-nav-more{padding:0;border:0}.fd-ref-nav-more>small{display:none}.fd-ref-nav :global(a){min-height:46px;font-size:13px}}
    `}</style>
  </nav>;
}
