import type { Metadata } from "next";
import { canonicalSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalSiteUrl()),
  title: "FateDrop — UK TCG Discovery Network",
  description:
    "A UK TCG founding-beta network for catalogue discovery, evidence-backed stock intelligence, independent retailers and events.",
  openGraph: {
    title: "FateDrop — Find stock. Support independents. Collect smarter.",
    description:
      "A founding-beta TCG discovery network connecting collector demand with participating catalogues, evidence-backed stock intelligence, independent retailers and events.",
    type: "website",
    images: [{ url: "/assets/fatedrop-header.webp", width: 1817, height: 866, alt: "FateDrop ultraviolet network artwork" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FateDrop — Find stock. Support independents. Collect smarter.",
    description: "Search participating UK TCG catalogues, compare known costs and follow evidence-backed stock signals.",
    images: ["/assets/fatedrop-header.webp"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
