import type { MetadataRoute } from "next";

const routes = ["", "/about", "/businesses", "/collectors", "/events", "/free-drops", "/join", "/merch", "/subscriptions", "/trust", "/privacy", "/terms", "/cookies"];
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const modified = new Date("2026-08-17T00:00:00.000Z");
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: modified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/join" ? 0.9 : 0.7,
  }));
}
