import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("homepage keeps the approved Koru landing as the visual anchor", () => {
  const home = read("app/page.tsx");
  const reference = read("components/koru-home-reference.tsx");
  assert.ok(home.includes("<KoruReferenceLanding"));
  assert.ok(reference.includes("You don&apos;t chase drops."));
  assert.ok(reference.includes("You get the signal."));
  assert.ok(reference.includes("MEET THE VOICE OF FATEDROP"));
  assert.ok(reference.includes('href="/demo"'));
  assert.ok(reference.includes("/assets/home/koru-home-hero.png"));
  assert.ok(fs.existsSync("public/assets/home/koru-home-hero.png"));
  assert.ok(fs.existsSync("public/assets/home/koru-home-section.png"));
  assert.equal(reference.includes("koru-home-hero.avif"), false);
});

test("homepage explains the product before the brand world and keeps the phone off home", () => {
  const home = read("app/page.tsx");
  const valuePosition = home.indexOf("<FateDropValueSection");
  const koruPosition = home.indexOf("<KoruFriendsMerchSection");
  assert.ok(valuePosition >= 0);
  assert.ok(koruPosition > valuePosition);
  assert.ok(home.includes("<FateNetworkHomeSection"));
  assert.equal(home.includes("<IndieBridgeSection"), false);
  assert.ok(home.includes("<EventsHomeLink"));
  assert.ok(home.includes("<MembershipConversionSection"));
  assert.equal(home.includes("<FateDropPhoneSection"), false);
  assert.equal(home.includes("<FutureExpansion"), false);
});

test("homepage sells the core FateDrop USPs accurately", () => {
  const value = read("components/fatedrop-value-section-v2.tsx");
  assert.ok(value.includes("WHAT FATEDROP ACTUALLY DOES"));
  assert.ok(value.includes("FateDrop does the checking before you reach checkout."));
  assert.ok(value.includes("Product or catalogue movement. Stock is not confirmed."));
  assert.ok(value.includes("Access, queue, traffic or security readiness changed."));
  assert.ok(value.includes("Purchasable availability is confirmed live."));
  assert.ok(value.includes("Previously confirmed availability is no longer live."));
  assert.ok(value.includes("RRP / REFERENCE"));
  assert.ok(value.includes("FATEFIND · BEST VALUE NOW"));
  assert.ok(value.includes("FATEMATCH · WATCH MY CONDITIONS"));
  assert.ok(value.includes("FATE NETWORK"));
  assert.ok(value.includes("buy directly from the retailer"));
});

test("interactive phone has moved to a dedicated demo page", () => {
  const demo = read("app/demo/page.tsx");
  const sections = read("components/koru-final-sections.tsx");
  const sitemap = read("app/sitemap.ts");
  assert.ok(demo.includes("<FateDropDemoSection"));
  assert.ok(sections.includes("<InteractivePhoneDemo"));
  assert.ok(sitemap.includes('"/demo"'));
});

test("public product language preserves FateFind, FateMatch and the final lifecycle", () => {
  const siteData = read("lib/site-data.ts");
  const trust = read("app/trust/page.tsx");
  const collectors = read("app/collectors/page.tsx");
  const layout = read("app/layout.tsx");
  assert.ok(siteData.includes('title: "FateFind"'));
  assert.ok(siteData.includes('title: "FateMatch"'));
  assert.ok(siteData.includes("strongest-value option"));
  assert.ok(siteData.includes("buying conditions"));
  assert.ok(layout.includes("FateFind live value comparison"));
  assert.ok(layout.includes("FateMatch personal monitoring"));
  assert.ok(trust.includes("Whisper. Echo. Manifested. Vanished."));
  assert.ok(collectors.includes("Whisper → Echo → Manifested → Vanished"));
  assert.ok(collectors.includes("FateFind is the live decision tool"));
  assert.ok(collectors.includes("FateMatch handles the waiting"));
});

test("free drops are removed from public discovery", () => {
  const siteData = read("lib/site-data.ts");
  const footer = read("components/footer.tsx");
  const retired = read("app/free-drops/page.tsx");
  const sitemap = read("app/sitemap.ts");
  assert.equal(siteData.includes('label: "Free Drops"'), false);
  assert.equal(footer.includes('href="/free-drops"'), false);
  assert.equal(sitemap.includes('"/free-drops"'), false);
  assert.ok(retired.includes('redirect("/")'));
});

test("Koru and Friends is the merch bridge rather than a second product", () => {
  const sections = read("components/koru-final-sections.tsx");
  const merch = read("app/merch/page.tsx");
  assert.ok(sections.includes("/assets/home/koru-home-section.png"));
  assert.ok(sections.includes('href="/merch"'));
  assert.ok(merch.includes("The culture around the signal."));
});

test("merch page uses one approved campaign, two closed drops and Stripe-ready product slots", () => {
  const merch = read("app/merch/page.tsx");
  const brand = read("lib/koru-brand.ts");
  const nav = read("components/nav.tsx");
  assert.ok(fs.existsSync("public/assets/merch/koru-friends-merch-hero.png"));
  assert.ok(brand.includes("/assets/merch/koru-friends-merch-hero.png"));
  assert.equal((merch.match(/KORU_MERCH\.campaign/g) || []).length, 1);
  assert.ok(merch.includes('id="koru-friends"'));
  assert.ok(merch.includes('id="signal-collection"'));
  assert.equal(merch.includes('<details className="merch-drop" open>'), false);
  assert.ok(merch.includes("Koru &amp; Friends"));
  assert.ok(merch.includes("FateDrop Signal"));
  assert.ok(merch.includes("Oru Wanderer Tee"));
  assert.ok(merch.includes("five selectable app companions"));
  assert.ok(merch.includes("Buy via Stripe"));
  assert.ok(merch.includes("Price + Stripe checkout to be connected"));
  assert.ok(nav.includes("merch-menu-trigger"));
  assert.ok(nav.includes('href="/merch#koru-friends"'));
  assert.ok(nav.includes('href="/merch#signal-collection"'));
});

test("market-facing pages use the same simple full-image construction as the approved homepage", () => {
  const hero = read("components/market-story-hero.tsx");
  assert.ok(hero.includes("prh-shell"));
  assert.ok(hero.includes("prh-hero"));
  assert.ok(hero.includes("prh-image"));
  assert.ok(hero.includes("prh-shade"));
  assert.ok(hero.includes("prh-copy"));
  assert.ok(hero.includes("prh-proof"));
  assert.ok(hero.includes("position:absolute;z-index:0;inset:0"));
  assert.equal(hero.includes("market-story-visual"), false);
  assert.equal(hero.includes("market-story-signal-field"), false);
  assert.equal(hero.includes("grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr)"), false);
  for (const path of ["app/collectors/page.tsx", "app/businesses/page.tsx", "app/events/page.tsx", "app/trust/page.tsx", "app/about/page.tsx", "app/subscriptions/page.tsx"]) {
    const source = read(path);
    assert.ok(source.includes("MarketStoryHero"), `${path} should use the rebuilt public hero`);
    assert.equal(source.includes("<PageHero"), false, `${path} should not use the retired generic page header`);
  }
});

test("collector and retailer pages stay visibly grounded in the TCG market", () => {
  const collectors = read("app/collectors/page.tsx");
  const retailers = read("app/businesses/page.tsx");
  assert.ok(fs.existsSync("public/assets/market/collectors.png"));
  assert.ok(fs.existsSync("public/assets/market/retailers.png"));
  assert.ok(collectors.includes("One network. More ways to find what you collect."));
  assert.ok(collectors.includes("Search connected stock"));
  assert.ok(collectors.includes("Trade with Fate Trader"));
  assert.ok(retailers.includes("Put your stock where collectors are already looking."));
  assert.ok(retailers.includes("Connect genuine stock"));
  assert.ok(retailers.includes("Keep your checkout"));
});

test("collector page keeps retail buying and Fate Trader as separate journeys", () => {
  const collectors = read("app/collectors/page.tsx");
  assert.ok(collectors.includes("Buying and trading are different journeys."));
  assert.ok(collectors.includes("Fate Trade Finder"));
  assert.ok(collectors.includes("Fate Trade Found"));
  assert.ok(collectors.includes("Fate Trade Hunt"));
  assert.ok(collectors.includes("fateTraderWebEnabled"));
});

test("retired Indie umbrella and old FateFind hunt semantics do not return", () => {
  const siteData = read("lib/site-data.ts");
  const dashboardNav = read("components/dashboard-nav.tsx");
  const retailerDashboard = read("app/dashboard/indie/page.tsx");
  const subscriptions = read("app/subscriptions/page.tsx");
  const about = read("app/about/page.tsx");
  const home = read("app/page.tsx");
  assert.equal(siteData.includes("Signal Intelligence & Indie Discovery"), false);
  assert.equal(siteData.includes('title: "Independent Discovery"'), false);
  assert.equal(siteData.includes('name: "FateDrop Indie"'), false);
  assert.equal(dashboardNav.includes('["⌘", "Indies"'), false);
  assert.equal(dashboardNav.includes('"Indie Dashboard"'), false);
  assert.equal(retailerDashboard.includes("FATEDROP INDIE"), false);
  assert.equal(subscriptions.includes("£9.99"), false);
  assert.equal(about.includes("FateFind hunts → FateMatch results"), false);
  assert.equal(home.includes("<IndieBridgeSection"), false);
  assert.ok(siteData.includes('title: "Fate Network"'));
  assert.ok(siteData.includes('title: "Fate Trader"'));
});

test("events page uses the rebuilt hero and fails open when the hosted encounters service is slow", () => {
  const nav = read("lib/site-data.ts");
  const events = read("app/events/page.tsx");
  const encounters = read("lib/encounters.ts");
  assert.ok(nav.includes('{ label: "Events", href: "/events" }'));
  assert.ok(events.includes("Find the events. Find your people."));
  assert.ok(events.includes("<MarketStoryHero"));
  assert.ok(encounters.includes("ENCOUNTERS_TIMEOUT_MS"));
  assert.ok(encounters.includes("AbortSignal.timeout(ENCOUNTERS_TIMEOUT_MS)"));
  assert.ok(encounters.includes("return { live: false, events: [] as EncounterEvent[] }"));
});

test("dashboard home matches the approved evidence-backed collector workspace", () => {
  const dashboard = read("app/dashboard/page.tsx");
  const shell = read("components/dashboard-page-shell.tsx");
  const pulse = read("components/dashboard-network-pulse.tsx");
  assert.ok(dashboard.includes("Signals Overview"));
  assert.ok(dashboard.includes("Recent Signals"));
  assert.ok(dashboard.includes("FateFind Pricing Context"));
  assert.ok(dashboard.includes("DashboardToolGuide"));
  assert.ok(dashboard.includes("FateMatch"));
  assert.ok(dashboard.includes("Network Pulse"));
  assert.ok(dashboard.includes("Recent Manifested Drops"));
  assert.ok(dashboard.includes("Fate Network"));
  assert.ok(dashboard.includes("Retailers you have discovered or interacted with."));
  assert.ok(dashboard.includes("Explore Fate Network"));
  assert.ok(dashboard.includes("/assets/dashboard/koru-network-guide.png"));
  assert.ok(dashboard.includes("Choose your companion"));
  assert.ok(fs.existsSync("public/assets/dashboard/koru-network-guide.png"));
  assert.ok(shell.includes("Search cards, sets or retailers"));
  assert.ok(pulse.includes("Products"));
  assert.ok(pulse.includes("Signals"));
  assert.ok(pulse.includes("Retailers"));
  assert.ok(dashboard.includes("signals={signalActivity7d}"));
  assert.equal(dashboard.includes("COLLECTOR COMMAND CENTRE"), false);
});
