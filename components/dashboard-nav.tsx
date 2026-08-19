"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { label: "DISCOVER", items: [["▦", "Home", "/dashboard"], ["⌕", "Search", "/dashboard/search"], ["⇄", "True Price", "/dashboard/true-price"], ["⌂", "Indie Stores", "/dashboard/stores"]] },
  { label: "TRACK", items: [["◉", "Alerts", "/dashboard/alerts"], ["♡", "FateFind", "/dashboard/watchlist"], ["☆", "Wishlist", "/dashboard/wishlist"], ["≋", "Preferences", "/dashboard/notifications"]] },
  { label: "NETWORK", items: [["□", "Events", "/dashboard/events"], ["⌖", "Local Radar", "/dashboard/local-radar"], ["◌", "Discord", "/dashboard/discord"]] },
  { label: "ACCOUNT", items: [["◎", "My FateDrop ID", "/dashboard/profile"], ["◇", "Companion", "/dashboard/avatar"], ["♛", "Membership", "/dashboard/membership"]] },
] as const;

function active(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();
  return <nav aria-label="Dashboard navigation" className="fd-organised-nav">
    {groups.map((group) => <div className="fd-nav-group" key={group.label}>
      <small>{group.label}</small>
      {group.items.map(([icon, label, href]) => <Link key={label} className={active(pathname, href) ? "active" : ""} href={href}>
        <span className="fd-nav-icon">{icon}</span><b className="fd-nav-label">{label}</b>{label === "Discord" ? <i>COMMUNITY</i> : null}<em aria-hidden="true"/>
      </Link>)}
    </div>)}
    <style jsx>{`
      .fd-organised-nav{display:grid!important;gap:15px!important;width:100%!important;min-width:0!important}
      .fd-nav-group{display:grid;gap:3px;width:100%;min-width:0}.fd-nav-group>small{padding:0 12px 5px;color:#56515d;font-size:7px;font-weight:900;letter-spacing:.19em}
      .fd-nav-group :global(a){position:relative;width:100%!important;min-width:0!important;max-width:100%!important;display:grid!important;grid-template-columns:28px minmax(0,1fr) auto 8px!important;align-items:center!important;column-gap:8px!important;box-sizing:border-box!important;overflow:hidden!important}
      .fd-nav-icon{width:28px!important;min-width:28px!important;display:grid!important;place-items:center!important}.fd-nav-label{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font:inherit!important;font-weight:inherit!important}
      .fd-nav-group :global(a i){margin:0!important;min-width:0!important;font-size:6px!important;color:#746d7b!important;white-space:nowrap!important}.fd-nav-group :global(a em){width:4px;height:4px;border-radius:50%;background:transparent}.fd-nav-group :global(a.active em){background:#72e9fb;box-shadow:0 0 12px #72e9fb}
      @media(max-width:980px){.fd-nav-group :global(a){grid-template-columns:26px minmax(0,1fr) 8px!important}.fd-nav-group :global(a i){display:none!important}.fd-nav-icon{width:26px!important;min-width:26px!important}}
    `}</style>
  </nav>;
}
