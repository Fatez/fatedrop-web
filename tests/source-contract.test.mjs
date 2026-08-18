import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("all current FateDrop routes and core project files are present", async () => {
  for (const file of [
    "app/page.tsx",
    "app/about/page.tsx",
    "app/businesses/page.tsx",
    "app/collectors/page.tsx",
    "app/cookies/page.tsx",
    "app/events/page.tsx",
    "app/free-drops/page.tsx",
    "app/join/page.tsx",
    "app/merch/page.tsx",
    "app/privacy/page.tsx",
    "app/subscriptions/page.tsx",
    "app/terms/page.tsx",
    "app/trust/page.tsx",
    "app/api/leads/route.ts",
    "app/dashboard/page.tsx",
    "app/api/dashboard/activity/route.ts",
    "app/api/dashboard/network-snapshot/route.ts",
    "lib/dashboard-storage.ts",
    "docs/dashboard-metrics.md",
    "app/globals.css",
    "package.json",
    ".env.example",
    "README.md",
  ]) {
    await access(new URL(file, root));
  }
});

test("interactive phone preview retains every controlled screen and safeguard", async () => {
  const source = await readFile(new URL("components/interactive-phone-demo.tsx", root), "utf8");

  for (const screen of ["home", "search", "indies", "alerts", "more"]) {
    assert.match(source, new RegExp(`id: \\"${screen}\\"`));
    assert.match(source, new RegExp(`screen === \\"${screen}\\"`));
  }

  for (const state of ["Whisper", "Manifested", "Vanished", "Echo"]) {
    assert.match(source, new RegExp(`name: \\"${state}\\"`));
  }

  for (const requirement of [
    "Interactive product preview — sample data",
    "Compare True Price",
    "Save to Universal Wishlist",
    "FateFind is watching the network.",
    "Event Vendor Mode",
    "This preview is not displaying real-time stock.",
  ]) {
    assert.ok(source.includes(requirement));
  }

  assert.ok(!source.includes("navigator.geolocation"));
  assert.ok(!source.includes("localStorage"));
});

test("visual assets, animation rules and responsive behaviour remain included", async () => {
  const css = await readFile(new URL("app/globals.css", root), "utf8");
  for (const rule of [
    "@keyframes phoneFloat",
    "@keyframes previewScreenIn",
    "@media (max-width: 820px)",
    "@media (max-width: 560px)",
    "@media (prefers-reduced-motion: reduce)",
    ".interactive-phone-demo",
  ]) assert.ok(css.includes(rule), `${rule} is missing`);

  for (const asset of [
    "public/assets/fatedrop-header.webp",
    "public/assets/cardwave-bg.webp",
    "public/assets/fatedrop-three-phase-capsule.webp",
    "public/assets/app-home.jpeg",
    "public/assets/app-search.jpeg",
    "public/assets/app-indie.jpeg",
    "public/assets/app-settings.jpeg",
    "public/assets/fatedrop-logo-mark.png",
  ]) await access(new URL(asset, root));
});

test("standalone project excludes ChatGPT Sites build identity and Vinext runtime", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(packageJson.name, "fatedrop-web");
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.equal(packageJson.dependencies?.vinext, undefined);
  assert.equal(packageJson.devDependencies?.wrangler, undefined);
  assert.equal(packageJson.devDependencies?.vite, undefined);
});
