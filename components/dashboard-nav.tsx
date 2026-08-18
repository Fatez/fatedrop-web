"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { label: "DISCOVER", items: [["▦","Home","/dashboard"],["⇄","True Price","/dashboard/true-price"],["⌂","Indie Stores","/dashboard/stores"]] },
  { label: "TRACK", items: [["◉","Alerts","/dashboard/alerts"],["♡","Watchlist / FateFind","/dashboard/watchlist"]] },
  { label: "NETWORK", items: [["□","Events","/dashboard/events"],["⌖","Local Radar","/dashboard/local-radar"],["◌","Discord","/dashboard/discord"]] },
  { label: "ACCOUNT", items: [["◎","My FateDrop ID","/dashboard/profile"],["♛","Membership","/dashboard/membership"]] },
] as const;

function active(pathname:string,href:string){return href==="/dashboard"?pathname===href:pathname===href||pathname.startsWith(`${href}/`)}

export function DashboardNav(){const pathname=usePathname();return <nav aria-label="Dashboard navigation" className="fd-organised-nav">{groups.map((group)=><div className="fd-nav-group" key={group.label}><small>{group.label}</small>{group.items.map(([icon,label,href])=><Link key={label} className={active(pathname,href)?"active":""} href={href}><span>{icon}</span>{label}{label==="Discord"?<i>COMMUNITY</i>:null}</Link>)}</div>)}<style jsx>{`.fd-organised-nav{display:grid!important;gap:15px!important}.fd-nav-group{display:grid;gap:3px}.fd-nav-group>small{padding:0 12px 5px;color:#56515d;font-size:7px;font-weight:900;letter-spacing:.19em}.fd-nav-group :global(a){position:relative}.fd-nav-group :global(a.active:after){content:"";position:absolute;right:10px;width:4px;height:4px;border-radius:50%;background:#72e9fb;box-shadow:0 0 12px #72e9fb}.fd-nav-group :global(a i){margin-left:auto;font-size:6px!important;color:#746d7b!important}`}</style></nav>}
