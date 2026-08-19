import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = canonicalSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/dashboard"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
