import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Terms Placeholder | FateDrop", description: "FateDrop terms and conditions placeholder." };

export default function TermsPage() {
  return <SiteShell><article className="legal-shell section-shell"><p className="eyebrow"><span />Legal placeholder</p><h1>Terms.</h1><div className="legal-placeholder"><strong>Terms not yet published.</strong><br />This page is not a contract or final legal text. Proper terms should be reviewed and supplied before the service opens publicly.</div><h2>Important product context</h2><p>FateDrop is a discovery network. Product availability and pricing can change, and purchases are completed with the independent retailer rather than FateDrop.</p><h2>Before launch</h2><p>Final terms should cover eligibility, acceptable use, retailer responsibilities, availability data, intellectual property, liability, account closure and governing law.</p></article></SiteShell>;
}

