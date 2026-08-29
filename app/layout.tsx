import type { Metadata } from "next";
import { canonicalSiteUrl } from "@/lib/site-url";
import "./globals.css";
import "./accessibility.css";
import "./koru-theme.css";
import "./koru-product-theme.css";
import "./companion-presentation.css";
import "./lifecycle-palette.css";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalSiteUrl()),
  title: "FateDrop — UK TCG Signal Intelligence & Indie Discovery",
  description:
    "FateDrop connects collectors with evidence-backed stock signals, FateFind live value comparison, FateMatch personal monitoring, independent retailers and real-world TCG events.",
  openGraph: {
    title: "FateDrop — You don't chase drops. You get the signal.",
    description:
      "Follow the signal, use FateFind to identify the strongest live value and let FateMatch watch the buying conditions that matter to you across the UK TCG network.",
    type: "website",
    images: [{ url: "/assets/home/koru-home-hero.png", width: 1672, height: 941, alt: "Koru overlooking the FateDrop landscape at sunset" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FateDrop — You don't chase drops. You get the signal.",
    description: "Signals, FateFind live value comparison, FateMatch monitoring and independent-retailer discovery for TCG collectors.",
    images: ["/assets/home/koru-home-hero.png"],
  },
  icons: {
    icon: "/assets/fatedrop-logo-mark.png",
    shortcut: "/assets/fatedrop-logo-mark.png",
    apple: "/assets/fatedrop-logo-mark.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
