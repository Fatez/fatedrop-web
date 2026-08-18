import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Cookie Information | FateDrop", description: "Current FateDrop website cookie information." };

export default function CookiesPage() {
  return <SiteShell><article className="legal-shell section-shell"><p className="eyebrow"><span />Cookie information</p><h1>Cookies.</h1><div className="legal-placeholder"><strong>No optional advertising or behavioural analytics cookies are intentionally configured.</strong><br />FateDrop ID adds one strictly necessary sign-in cookie when you authenticate.</div><h2>FateDrop session cookie</h2><p>The <code>fd_session</code> cookie keeps a signed-in FateDrop ID connected to its server-side session. It is configured as HttpOnly, SameSite=Lax and Secure in production, and it is not available to normal browser JavaScript.</p><h2>Payments and connected services</h2><p>If you choose to start Stripe checkout or connect Discord, those third-party pages may use their own essential technology under their respective policies. FateDrop should update consent controls if optional analytics, advertising or preference technologies are introduced later.</p><h2>When this changes</h2><p>This page and any required consent interface must be updated before optional tracking technology is enabled.</p></article></SiteShell>;
}
