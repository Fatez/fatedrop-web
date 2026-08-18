import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { siteConfig } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <BrandMark />
          <p>{siteConfig.tagline}</p>
        </div>
        <div className="footer-links">
          <div>
            <span>Explore</span>
            {siteConfig.nav.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
            <Link href="/subscriptions">Subscriptions</Link>
            <Link href="/about">About</Link>
          </div>
          <div>
            <span>Join</span>
            <Link href="/join?type=collector">Collector beta</Link>
            <Link href="/join?type=business">Business enquiry</Link>
            <Link href="/join?type=event">List an event</Link>
            <Link href="/join?type=collector">Free Drops list</Link>
          </div>
          <div>
            <span>Legal</span>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookie information</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} FateDrop. Independent by design.</span>
        <span>Product availability and retailer prices can change.</span>
      </div>
      <p className="non-affiliation">FateDrop is an independent service and is not affiliated with, endorsed by or sponsored by Nintendo, The Pokémon Company or Pokémon. Pokémon and related names are trademarks of their respective owners.</p>
    </footer>
  );
}
