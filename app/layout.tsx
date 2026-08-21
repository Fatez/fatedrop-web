import type { Metadata } from "next";
import { canonicalSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalSiteUrl()),
  title: "FateDrop — UK TCG Signal Intelligence & Indie Discovery",
  description:
    "FateDrop connects collectors with evidence-backed stock signals, True Price context, FateMatch, independent retailers and real-world TCG events.",
  openGraph: {
    title: "FateDrop — You don't chase drops. You get the signal.",
    description:
      "Follow the signal, understand the real price and discover independent TCG retailers through one connected UK collector network.",
    type: "website",
    images: [{ url: "/assets/home/koru-home-hero.png", width: 1672, height: 941, alt: "Koru overlooking the FateDrop landscape at sunset" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FateDrop — You don't chase drops. You get the signal.",
    description: "Signals, True Price, FateMatch and independent-retailer discovery for TCG collectors.",
    images: ["/assets/home/koru-home-hero.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
