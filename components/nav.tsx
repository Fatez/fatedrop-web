"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-data";
import { BrandMark } from "./brand-mark";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="nav-shell">
        <BrandMark />
        <nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
          {siteConfig.nav.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={`account-menu${pathname.startsWith("/dashboard") || pathname.startsWith("/account") ? " active" : ""}${accountOpen ? " is-open" : ""}`}>
            <button
              className="account-menu-trigger"
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((current) => !current)}
            >
              <span className="account-menu-signal" aria-hidden="true" />
              FateDrop ID
              <span className="account-menu-chevron" aria-hidden="true">⌄</span>
            </button>
            <div className="account-menu-popover" role="menu">
              <Link href="/account" role="menuitem" onClick={() => { setAccountOpen(false); setOpen(false); }}>
                <span><b>My FateDrop ID</b><small>Profile, member since & identity</small></span><i>◎</i>
              </Link>
              <Link href="/dashboard" role="menuitem" onClick={() => { setAccountOpen(false); setOpen(false); }}>
                <span><b>Dashboard</b><small>Search, signals, True Price & activity</small></span><i>▦</i>
              </Link>
              <Link href="/dashboard/avatar" role="menuitem" onClick={() => { setAccountOpen(false); setOpen(false); }}>
                <span><b>Koru &amp; Friends</b><small>Choose your FateDrop companion</small></span><i>◇</i>
              </Link>
              <Link href="/subscriptions#collectors" role="menuitem" onClick={() => { setAccountOpen(false); setOpen(false); }}>
                <span><b>Membership</b><small>Trial, Premium & billing</small></span><i>♛</i>
              </Link>
            </div>
          </div>
          <Link
            className="button button-small button-primary nav-cta"
            href="/join"
            onClick={() => {
              trackEvent("cta_click", { location: "navigation", target: "join" });
              setOpen(false);
            }}
          >
            Join the beta <span aria-hidden="true">↗</span>
          </Link>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => { setOpen((current) => !current); setAccountOpen(false); }}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
