import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Cookie Information | FateDrop", description: "Current FateDrop website cookie information." };

export default function CookiesPage() {
  return <SiteShell><article className="legal-shell section-shell"><p className="eyebrow"><span />Cookie information</p><h1>Cookies.</h1><div className="legal-placeholder"><strong>No optional analytics provider is currently configured.</strong><br />The current public marketing site does not intentionally set advertising or behavioural analytics cookies.</div><h2>Essential technology</h2><p>The hosting platform may use strictly necessary security or delivery mechanisms required to serve the website. These are not used by FateDrop to build advertising profiles.</p><h2>When this changes</h2><p>If analytics, embedded services or preference tools are connected later, this page and any required consent controls must be updated before those technologies are enabled.</p></article></SiteShell>;
}
