import type { ReactNode } from "react";
import Link from "next/link";
import { Nav } from "./nav";
import { Footer } from "./footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero section-shell">
      <div className="orb orb-one" />
      <div className="page-hero-copy reveal">
        <p className="eyebrow"><span />{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow"><span />{eyebrow}</p>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export function FinalCta() {
  return (
    <section className="final-cta section-shell">
      <div className="final-cta-inner">
        <p className="eyebrow"><span />Join the network</p>
        <h2>Find the drop. Support independents. Collect smarter.</h2>
        <p>Join the FateDrop beta network and help connect collectors, retailers, vendors and events through one useful search.</p>
        <div className="button-row">
          <Link className="button button-primary" href="/join?type=collector">Join the Collector Beta <span>↗</span></Link>
          <Link className="button button-secondary" href="/join?type=business">Connect Your Catalogue</Link>
          <Link className="text-link" href="/join?type=event">List an Event <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}
