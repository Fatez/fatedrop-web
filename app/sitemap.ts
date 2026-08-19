import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/site-url";

const routes = ["", "/about", "/businesses", "/collectors", "/events", "/free-drops", "/join", "/merch", "/subscriptions", "/trust", "/privacy", "/terms", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = canonicalSiteUrl();
  const modified = new Date("2026-08-19T00:00:00.000Z");
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: modified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/join" ? 0.9 : 0.7,
  }));
}
