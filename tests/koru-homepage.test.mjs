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
  assert.ok(home.includes("<IndieBridgeSection"));
  assert.ok(home.includes("<EventsHomeLink"));
  assert.ok(home.includes("<MembershipConversionSection"));
  assert.equal(home.includes("<FateDropPhoneSection"), false);
  assert.equal(home.includes("<FutureExpansion"), false);
});

test("homepage sells the four core FateDrop USPs accurately", () => {
  const sections = read("components/koru-final-sections.tsx");
  assert.ok(sections.includes("WHAT FATEDROP DOES"));
  assert.ok(sections.includes("FateDrop does the work before checkout."));
  assert.ok(sections.includes("Product or catalogue movement. Something may be coming."));
  assert.ok(sections.includes("Queue, traffic or security conditions changed. Get ready."));
  assert.ok(sections.includes("Confirmed purchasable stock is live."));
  assert.ok(sections.includes("Previously confirmed availability is gone."));
  assert.ok(sections.includes("OFFICIAL RRP"));
  assert.ok(sections.includes("FateFind"));
  assert.ok(sections.includes("FateMatch"));
  assert.ok(sections.includes("buy direct from the store"));
  assert.ok(sections.includes("£4.99"));
});

test("interactive phone has moved to a dedicated demo page", () => {
  const demo = read("app/demo/page.tsx");
  const sections = read("components/koru-final-sections.tsx");
  const sitemap = read("app/sitemap.ts");
  assert.ok(demo.includes("<FateDropDemoSection"));
  assert.ok(sections.includes("<InteractivePhoneDemo"));
  assert.ok(sitemap.includes('"/demo"'));
});

test("public product language preserves FateFind to FateMatch and the final lifecycle", () => {
  const siteData = read("lib/site-data.ts");
  const trust = read("app/trust/page.tsx");
  const collectors = read("app/collectors/page.tsx");
  const layout = read("app/layout.tsx");
  assert.ok(siteData.includes("FateFind → FateMatch"));
  assert.ok(siteData.includes("successful result is a FateMatch"));
  assert.ok(layout.includes("FateFind hunts"));
  assert.ok(layout.includes("FateMatch results"));
  assert.ok(trust.includes("Whisper. Echo. Manifested. Vanished."));
  assert.ok(collectors.includes("Whisper → Echo → Manifested → Vanished"));
  assert.ok(collectors.includes("A FateFind is the hunt you create."));
  assert.ok(collectors.includes("the result is a FateMatch"));
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
  assert.ok(collectors.includes("Find the cards. Know the price. Catch the signal."));
  assert.ok(collectors.includes("Search the network"));
  assert.ok(collectors.includes("Buy direct from stores"));
  assert.ok(retailers.includes("The bridge between indie stores and collector demand."));
  assert.ok(retailers.includes("Surface live products"));
  assert.ok(retailers.includes("Keep your checkout"));
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
  assert.ok(dashboard.includes("True Price Comparison"));
  assert.ok(dashboard.includes("FateMatch"));
  assert.ok(dashboard.includes("Network Pulse"));
  assert.ok(dashboard.includes("Recent Manifested Drops"));
  assert.ok(dashboard.includes("Independent Stores"));
  assert.ok(dashboard.includes("Discover more places to buy"));
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