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
  const [merchOpen, setMerchOpen] = useState(false);
  const pathname = usePathname();

  const closeMenus = () => {
    setOpen(false);
    setAccountOpen(false);
    setMerchOpen(false);
  };

  return (
    <header className="site-header">
      <div className="nav-shell">
        <BrandMark />
        <nav className={open ? "nav-links is-open" : "nav-links"} aria-label="Main navigation">
          {siteConfig.nav.map((item) => item.label === "Merch" ? (
            <div className={`merch-menu${pathname.startsWith("/merch") ? " active" : ""}${merchOpen ? " is-open" : ""}`} key={item.href}>
              <button
                className="merch-menu-trigger"
                type="button"
                aria-haspopup="menu"
                aria-expanded={merchOpen}
                onClick={() => {
                  setMerchOpen((current) => !current);
                  setAccountOpen(false);
                }}
              >
                Merch
                <span aria-hidden="true">⌄</span>
              </button>
              <div className="merch-menu-popover" role="menu">
                <Link href="/merch" role="menuitem" onClick={closeMenus}>
                  <span><b>All Merch</b><small>Campaign, collections and future drops</small></span><i>◇</i>
                </Link>
                <Link href="/merch#koru-friends" role="menuitem" onClick={closeMenus}>
                  <span><b>Koru &amp; Friends</b><small>Character collection · 6 pieces</small></span><i>01</i>
                </Link>
                <Link href="/merch#signal-collection" role="menuitem" onClick={closeMenus}>
                  <span><b>FateDrop Signal</b><small>Core tee · limited jersey · snapback</small></span><i>02</i>
                </Link>
              </div>
            </div>
          ) : (
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
              onClick={() => {
                setAccountOpen((current) => !current);
                setMerchOpen(false);
              }}
            >
              <span className="account-menu-signal" aria-hidden="true" />
              FateDrop ID
              <span className="account-menu-chevron" aria-hidden="true">⌄</span>
            </button>
            <div className="account-menu-popover" role="menu">
              <Link href="/account" role="menuitem" onClick={closeMenus}>
                <span><b>My FateDrop ID</b><small>Profile, member since & identity</small></span><i>◎</i>
              </Link>
              <Link href="/dashboard" role="menuitem" onClick={closeMenus}>
                <span><b>Dashboard</b><small>Search, signals, True Price & activity</small></span><i>▦</i>
              </Link>
              <Link href="/dashboard/avatar" role="menuitem" onClick={closeMenus}>
                <span><b>Koru &amp; Friends</b><small>Choose your FateDrop companion</small></span><i>◇</i>
              </Link>
              <Link href="/subscriptions#collectors" role="menuitem" onClick={closeMenus}>
                <span><b>Membership</b><small>Trial, Premium & billing</small></span><i>♛</i>
              </Link>
            </div>
          </div>
          <Link
            className="button button-small button-primary nav-cta"
            href="/join"
            onClick={() => {
              trackEvent("cta_click", { location: "navigation", target: "join" });
              closeMenus();
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
          onClick={() => {
            setOpen((current) => !current);
            setAccountOpen(false);
            setMerchOpen(false);
          }}
        >
          <span />
          <span />
        </button>
      </div>

      <style jsx>{`
        .merch-menu { position: relative; }
        .merch-menu-trigger {
          min-height: 42px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          border-radius: 12px;
          color: #c8c5d0;
          background: transparent;
          font: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: .2s ease;
        }
        .merch-menu-trigger span { color: #8b8498; font-size: 11px; transition: transform .18s ease; }
        .merch-menu-trigger:hover,
        .merch-menu.active .merch-menu-trigger,
        .merch-menu.is-open .merch-menu-trigger { color: white; background: rgba(255,255,255,.06); }
        .merch-menu.is-open .merch-menu-trigger span { transform: rotate(180deg); }
        .merch-menu-popover {
          position: absolute;
          z-index: 40;
          top: calc(100% + 10px);
          left: 0;
          width: 310px;
          padding: 8px;
          display: none;
          gap: 4px;
          border: 1px solid rgba(192,164,135,.2);
          border-radius: 16px;
          background: radial-gradient(circle at 0 0,rgba(166,116,76,.12),transparent 42%),rgba(8,7,10,.985);
          box-shadow: 0 24px 60px rgba(0,0,0,.5),0 0 35px rgba(174,124,82,.06);
          backdrop-filter: blur(22px);
        }
        .merch-menu.is-open .merch-menu-popover { display: grid; }
        .merch-menu-popover :global(a) {
          min-height: 62px;
          padding: 10px 11px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
          border: 1px solid transparent;
          border-radius: 11px;
          color: #d7d2df;
        }
        .merch-menu-popover :global(a:hover), .merch-menu-popover :global(a:focus-visible) {
          border-color: rgba(192,164,135,.18);
          color: white;
          background: rgba(192,164,135,.055);
          outline: none;
        }
        .merch-menu-popover :global(a > span) { display: grid; gap: 3px; }
        .merch-menu-popover :global(b) { font-size: 12px; font-weight: 720; }
        .merch-menu-popover :global(small) { color: #77717f; font-size: 9px; line-height: 1.35; }
        .merch-menu-popover :global(i) {
          min-width: 30px;
          height: 28px;
          padding: 0 6px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(192,164,135,.18);
          border-radius: 9px;
          color: #c4a383;
          background: rgba(192,164,135,.05);
          font-size: 9px;
          font-style: normal;
        }
        .merch-menu-trigger:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }
        @media (max-width: 760px) {
          .merch-menu { width: 100%; }
          .merch-menu-trigger { width: 100%; min-height: 48px; justify-content: flex-start; padding: 0 14px; }
          .merch-menu-trigger span { margin-left: auto; }
          .merch-menu-popover { position: static; width: 100%; margin-top: 5px; box-shadow: none; backdrop-filter: none; }
        }
      `}</style>
    </header>
  );
}
