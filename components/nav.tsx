"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-data";
import { BrandMark } from "./brand-mark";

export function Nav() {
  const [open, setOpen] = useState(false);
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
          onClick={() => setOpen((current) => !current)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

