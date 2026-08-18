"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["▦", "Dashboard", "/dashboard"],
  ["⌕", "Search", "/dashboard/search"],
  ["◉", "Alerts", "/dashboard/alerts"],
  ["♡", "Watchlist", "/dashboard/watchlist"],
  ["⌂", "Indie Stores", "/dashboard/stores"],
  ["□", "Events", "/dashboard/events"],
  ["⇄", "True Price", "/dashboard/true-price"],
  ["⌖", "Local Radar", "/dashboard/local-radar"],
] as const;

const accountItems = [
  ["◎", "My FateDrop ID", "/dashboard/profile"],
  ["♛", "Membership", "/dashboard/membership"],
  ["◌", "Discord", "/dashboard/discord"],
] as const;

function active(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard navigation">
      {items.map(([icon, label, href]) => (
        <Link key={label} className={active(pathname, href) ? "active" : ""} href={href}>
          <span>{icon}</span>{label}
        </Link>
      ))}
      <div className="fd-dashboard-nav-separator" />
      {accountItems.map(([icon, label, href]) => (
        <Link key={label} className={active(pathname, href) ? "active" : ""} href={href}>
          <span>{icon}</span>{label}{label === "Discord" ? <i>PREMIUM</i> : null}
        </Link>
      ))}
    </nav>
  );
}
