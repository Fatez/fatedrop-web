"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Screen = "home" | "search" | "indies" | "alerts" | "more";
type AlertMode = "lifecycle" | "fatefind";
type MoreMode = "radar" | "events";

const lifecycle = [
  { name: "Echo", copy: "Meaningful early movement is visible, but confirmed purchasable stock is not established yet.", tone: "cyan" },
  { name: "Manifested", copy: "The product has been verified as live and available to purchase.", tone: "green" },
  { name: "Vanished", copy: "Previously confirmed availability is no longer observed.", tone: "pink" },
] as const;

const navigation: { id: Screen; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "search", label: "Search", icon: "⌕" },
  { id: "indies", label: "Indies", icon: "▥" },
  { id: "alerts", label: "Alerts", icon: "♢" },
  { id: "more", label: "More", icon: "•••" },
];

const offers = [
  { retailer: "Northstar Cards", price: 49.95, postage: 3.49, pulse: "Confirmed", availability: "In stock" },
  { retailer: "Card Corner UK", price: 51.5, postage: 0, pulse: "High activity", availability: "Observed movement" },
  { retailer: "The Indie Deck", price: 47.99, postage: 4.25, pulse: "Recent change", availability: "Low stock" },
];

export function InteractivePhoneDemo() {
  const [screen, setScreen] = useState<Screen>("home");
  const [alertMode, setAlertMode] = useState<AlertMode>("lifecycle");
  const [moreMode, setMoreMode] = useState<MoreMode>("radar");
  const [lifecycleIndex, setLifecycleIndex] = useState(1);
  const [showTruePrice, setShowTruePrice] = useState(false);
  const [phoneNotice, setPhoneNotice] = useState("");
  const [productSaved, setProductSaved] = useState(false);
  const [maximumPrice, setMaximumPrice] = useState("55");
  const [condition, setCondition] = useState("Sealed");
  const [preorders, setPreorders] = useState(false);
  const [purchaseMethod, setPurchaseMethod] = useState("Online purchase");
  const [fateFindActive, setFateFindActive] = useState(false);
  const [vendorMode, setVendorMode] = useState(false);
  const [stallResult, setStallResult] = useState(false);

  const goTo = (next: Screen) => {
    setScreen(next);
    setPhoneNotice("");
    if (next === "alerts") setAlertMode("lifecycle");
  };

  const openFateFind = () => {
    setScreen("alerts");
    setAlertMode("fatefind");
    setPhoneNotice("");
  };

  const openEvent = () => {
    setScreen("more");
    setMoreMode("events");
    setPhoneNotice("");
  };

  const returnToOffer = () => {
    setScreen("search");
    setPhoneNotice("Signal journey complete. Choose a sample retailer to finish the journey.");
  };

  const journeyStep = useMemo(() => {
    if (screen === "search" && phoneNotice.includes("checkout")) return 9;
    if (screen === "search" && productSaved) return 4;
    if (screen === "search" && showTruePrice) return 3;
    if (screen === "search") return 2;
    if (screen === "alerts" && alertMode === "fatefind") return fateFindActive ? 5 : 4;
    if (screen === "alerts" && lifecycleIndex === 2) return 8;
    if (screen === "alerts" && lifecycleIndex === 1) return 7;
    if (screen === "alerts") return 6;
    return 1;
  }, [alertMode, fateFindActive, lifecycleIndex, phoneNotice, productSaved, screen, showTruePrice]);

  const companion = useMemo(() => {
    if (screen === "search") return {
      kicker: "Market search",
      title: "Search the market—not twenty different websites.",
      benefit: "Compare sample offers by product price, known postage and expected delivered cost before continuing to the retailer.",
      cta: "Explore collector search",
      href: "/collectors",
    };
    if (screen === "indies") return {
      kicker: "Independent discovery",
      title: "Discover the business behind the product and buy directly from the retailer.",
      benefit: "Verified profiles bring storefront details, supplied delivery information and sample catalogues into one useful view.",
      cta: "Meet the retailer network",
      href: "/businesses",
    };
    if (screen === "alerts" && alertMode === "fatefind") return {
      kicker: "FateFind",
      title: "Tell the network exactly what you are waiting for.",
      benefit: "Shape a watch request around price, condition, preorder preference and how you want to buy—without repeating the search.",
      cta: "Join the collector beta",
      href: "/join?type=collector",
    };
    if (screen === "alerts") return {
      kicker: lifecycle[lifecycleIndex].name,
      title: lifecycle[lifecycleIndex].copy,
      benefit: "Follow early intelligence into confirmed availability and eventual availability loss, with each state grounded in observable retailer data.",
      cta: "How stock intelligence works",
      href: "/trust",
    };
    if (screen === "more" && moreMode === "events") return {
      kicker: "Fate Encounters",
      title: "Discover the event before the day. Search the vendors when you arrive.",
      benefit: "Event Vendor Mode turns a schedule and vendor list into a searchable, on-the-floor collector tool.",
      cta: "Explore Fate Encounters",
      href: "/events",
    };
    if (screen === "more") return {
      kicker: "Local Radar",
      title: "See the collecting network around a sample postcode.",
      benefit: "Move between nearby independent stores and card events without sharing your real location in this demonstration.",
      cta: "Explore local discovery",
      href: "/collectors",
    };
    return {
      kicker: "Collector home",
      title: "See the network move from one focused overview.",
      benefit: "Recent product signals, confirmed availability, events and shortcuts make the next useful action immediately visible.",
      cta: "Explore the collector experience",
      href: "/collectors",
    };
  }, [alertMode, lifecycleIndex, moreMode, screen]);

  return (
    <div className="interactive-phone-demo">
      <div className="interactive-demo-intro">
        <span>TRY FATEDROP</span>
        <p>Explore an interactive product preview using sample data.</p>
        <small>Interactive product preview — sample data</small>
      </div>

      <div className="interactive-demo-layout">
        <div className="interactive-phone-column">
          <div className="phone-frame interactive-phone-frame">
            <div className="phone-island" aria-hidden="true" />
            <div className="interactive-app-screen" aria-label={`${companion.kicker} preview screen`}>
              <header className="preview-app-header">
                <span>09:41</span>
                <div><i aria-hidden="true">F</i><strong>Fate<em>Drop</em></strong></div>
                <small>SAMPLE</small>
              </header>

              <div className="preview-screen-scroll" key={`${screen}-${alertMode}-${moreMode}`}>
                {screen === "home" && <HomePreview goTo={goTo} openFateFind={openFateFind} openEvent={openEvent} />}
                {screen === "search" && (
                  <SearchPreview
                    showTruePrice={showTruePrice}
                    setShowTruePrice={setShowTruePrice}
                    notice={phoneNotice}
                    setNotice={setPhoneNotice}
                    productSaved={productSaved}
                    setProductSaved={setProductSaved}
                    openFateFind={openFateFind}
                  />
                )}
                {screen === "indies" && <IndiesPreview notice={phoneNotice} setNotice={setPhoneNotice} />}
                {screen === "alerts" && (
                  <AlertsPreview
                    alertMode={alertMode}
                    setAlertMode={setAlertMode}
                    lifecycleIndex={lifecycleIndex}
                    setLifecycleIndex={setLifecycleIndex}
                    productSaved={productSaved}
                    setProductSaved={setProductSaved}
                    maximumPrice={maximumPrice}
                    setMaximumPrice={setMaximumPrice}
                    condition={condition}
                    setCondition={setCondition}
                    preorders={preorders}
                    setPreorders={setPreorders}
                    purchaseMethod={purchaseMethod}
                    setPurchaseMethod={setPurchaseMethod}
                    fateFindActive={fateFindActive}
                    setFateFindActive={setFateFindActive}
                    returnToOffer={returnToOffer}
                  />
                )}
                {screen === "more" && (
                  <MorePreview
                    mode={moreMode}
                    setMode={setMoreMode}
                    vendorMode={vendorMode}
                    setVendorMode={setVendorMode}
                    stallResult={stallResult}
                    setStallResult={setStallResult}
                  />
                )}
              </div>

              <nav className="preview-app-nav" aria-label="Interactive preview navigation">
                {navigation.map((item) => (
                  <button
                    type="button"
                    className={screen === item.id ? "active" : ""}
                    aria-current={screen === item.id ? "page" : undefined}
                    aria-label={`Open ${item.label} preview`}
                    onClick={() => goTo(item.id)}
                    key={item.id}
                  >
                    <span aria-hidden="true">{item.icon}</span><small>{item.label}</small>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <nav className="preview-fallback-nav" aria-label="Small screen preview controls">
            {navigation.map((item) => (
              <button type="button" className={screen === item.id ? "active" : ""} onClick={() => goTo(item.id)} key={item.id}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <aside className="preview-companion" aria-live="polite" aria-atomic="true">
          <span>{companion.kicker}</span>
          <h2>{companion.title}</h2>
          <div className="demo-journey-progress">
            <span>GUIDED JOURNEY · {String(journeyStep).padStart(2, "0")} / 09</span>
            <div aria-hidden="true"><i style={{ width: `${(journeyStep / 9) * 100}%` }} /></div>
            <p>{["Search an example product", "Review sample retailer offers", "Compare the True Price", "Save to Universal Wishlist", "Activate FateFind", "See Echo early intelligence", "See Manifested confirmation", "Step into Vanished", "Continue to a sample retailer"][journeyStep - 1]}</p>
          </div>
          <div className="companion-benefit"><small>COLLECTOR BENEFIT</small><p>{companion.benefit}</p></div>
          <Link href={companion.href}>{companion.cta} <b>↗</b></Link>
          <em>Interactive product preview — sample data</em>
        </aside>
      </div>
    </div>
  );
}

function ScreenTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="preview-screen-title"><span>{eyebrow}</span><h3>{title}</h3></div>;
}

function HomePreview({ goTo, openFateFind, openEvent }: { goTo: (screen: Screen) => void; openFateFind: () => void; openEvent: () => void }) {
  return (
    <div className="preview-view">
      <ScreenTitle eyebrow="NETWORK ACTIVITY · SAMPLE" title="Know what moved." />
      <div className="preview-metric-grid">
        <article><strong>6,332</strong><span>sample products mapped</span></article>
        <article><strong>3</strong><span>sample monitors</span></article>
      </div>
      <div className="preview-activity-list">
        <article><i className="signal-green" /><div><small>MANIFESTED · SAMPLE</small><strong>Journey Together ETB</strong><span>Confirmed example availability</span></div></article>
        <article><i className="signal-cyan" /><div><small>ECHO · SAMPLE</small><strong>Prismatic Evolutions Bundle</strong><span>Example early catalogue movement</span></div></article>
      </div>
      <button type="button" className="preview-event-teaser" onClick={openEvent}>
        <span>UPCOMING EVENT · SAMPLE</span><strong>Fate Encounters Demo Day</strong><small>12 Sep · Example Hall · Birmingham</small>
      </button>
      <div className="preview-shortcuts" aria-label="Collector shortcuts">
        <button type="button" onClick={() => goTo("search")}><span>⌕</span>Search</button>
        <button type="button" onClick={() => goTo("indies")}><span>▥</span>Indies</button>
        <button type="button" onClick={openFateFind}><span>♢</span>FateFind</button>
      </div>
    </div>
  );
}

function SearchPreview({ showTruePrice, setShowTruePrice, notice, setNotice, productSaved, setProductSaved, openFateFind }: {
  showTruePrice: boolean;
  setShowTruePrice: (value: boolean) => void;
  notice: string;
  setNotice: (value: string) => void;
  productSaved: boolean;
  setProductSaved: (value: boolean) => void;
  openFateFind: () => void;
}) {
  return (
    <div className="preview-view">
      <ScreenTitle eyebrow="SEARCH · SAMPLE DATA" title="Compare the market." />
      <label className="preview-field">
        <span>Example product</span>
        <select aria-label="Select a preconfigured example product">
          <option>Journey Together ETB</option>
          <option>Prismatic Evolutions Bundle</option>
          <option>Destined Rivals Booster Box</option>
        </select>
      </label>
      <div className="preview-offer-list">
        {offers.map((offer) => (
          <article key={offer.retailer}>
            <div><small>DROP PULSE · {offer.pulse} · SAMPLE</small><strong>{offer.retailer}</strong><span>Sample retailer · {offer.availability}</span></div>
            <div className="preview-offer-price"><strong>£{offer.price.toFixed(2)}</strong><small>{offer.postage === 0 ? "Free post" : `+ £${offer.postage.toFixed(2)} post`}</small></div>
            {showTruePrice && <p>Expected delivered cost <b>£{(offer.price + offer.postage).toFixed(2)}</b></p>}
            <button type="button" onClick={() => setNotice(`${offer.retailer} checkout would open here.`)}>Buy direct ↗</button>
          </article>
        ))}
      </div>
      <button type="button" className={`preview-primary-action ${showTruePrice ? "active" : ""}`} onClick={() => setShowTruePrice(!showTruePrice)} aria-pressed={showTruePrice}>
        {showTruePrice ? "Hide True Price" : "Compare True Price"}
      </button>
      <button type="button" className={`preview-wishlist-action ${productSaved ? "active" : ""}`} aria-pressed={productSaved} onClick={() => setProductSaved(!productSaved)}>
        <span>{productSaved ? "✓" : "+"}</span><div><strong>{productSaved ? "Saved to Universal Wishlist" : "Save to Universal Wishlist"}</strong><small>Journey Together ETB · simulation only</small></div>
      </button>
      {productSaved ? <button type="button" className="preview-next-action" onClick={openFateFind}>Create a FateFind request <span>→</span></button> : null}
      {notice && <p className="preview-confirmation" role="status">{notice}</p>}
      <p className="preview-disclaimer">Expected delivered cost uses known sample postage. Final price and availability are confirmed at retailer checkout.</p>
    </div>
  );
}

function IndiesPreview({ notice, setNotice }: { notice: string; setNotice: (value: string) => void }) {
  return (
    <div className="preview-view">
      <ScreenTitle eyebrow="INDIES · SAMPLE DIRECTORY" title="Meet the retailer." />
      <div className="preview-indie-directory">
        <button type="button" className="active"><span>Northstar Cards</span><small>1.8 mi · sample</small></button>
        <button type="button"><span>Card Corner UK</span><small>3.2 mi · sample</small></button>
      </div>
      <article className="preview-storefront">
        <div className="preview-store-art" aria-hidden="true"><span>N</span></div>
        <span className="preview-verified">✓ VERIFIED BUSINESS · SAMPLE</span>
        <h4>Northstar Cards</h4>
        <p>Example independent TCG retailer and community space.</p>
        <dl><div><dt>Opening hours</dt><dd>Mon–Sat · 10:00–18:00</dd></div><div><dt>Delivery</dt><dd>Royal Mail from £3.49</dd></div></dl>
        <div className="preview-store-products"><span>Journey Together ETB <b>£49.95</b></span><span>Sample sleeves <b>£6.50</b></span></div>
        <button type="button" className="preview-primary-action" onClick={() => setNotice("The sample retailer website would open in a new tab.")}>Visit retailer website ↗</button>
      </article>
      {notice && <p className="preview-confirmation" role="status">{notice}</p>}
    </div>
  );
}

type AlertsPreviewProps = {
  alertMode: AlertMode;
  setAlertMode: (value: AlertMode) => void;
  lifecycleIndex: number;
  setLifecycleIndex: (value: number) => void;
  productSaved: boolean;
  setProductSaved: (value: boolean) => void;
  maximumPrice: string;
  setMaximumPrice: (value: string) => void;
  condition: string;
  setCondition: (value: string) => void;
  preorders: boolean;
  setPreorders: (value: boolean) => void;
  purchaseMethod: string;
  setPurchaseMethod: (value: string) => void;
  fateFindActive: boolean;
  setFateFindActive: (value: boolean) => void;
  returnToOffer: () => void;
};

function AlertsPreview(props: AlertsPreviewProps) {
  const activeState = lifecycle[props.lifecycleIndex];
  return (
    <div className="preview-view">
      <ScreenTitle eyebrow="ALERTS · SIMULATION" title="Follow every signal." />
      <div className="preview-segmented" role="group" aria-label="Alerts demonstration mode">
        <button type="button" className={props.alertMode === "lifecycle" ? "active" : ""} onClick={() => props.setAlertMode("lifecycle")}>Signals</button>
        <button type="button" className={props.alertMode === "fatefind" ? "active" : ""} onClick={() => props.setAlertMode("fatefind")}>FateFind</button>
      </div>
      {props.alertMode === "lifecycle" ? (
        <>
          <article className={`preview-lifecycle-card tone-${activeState.tone}`}>
            <small>JOURNEY TOGETHER ETB · SAMPLE</small>
            <div className="preview-lifecycle-orbit"><i /><i /></div>
            <strong>{activeState.name}</strong>
            <p>{activeState.copy}</p>
          </article>
          <div className="preview-lifecycle-steps" aria-label="Public FateDrop signal states">
            {lifecycle.map((state, index) => (
              <button type="button" className={index === props.lifecycleIndex ? "active" : ""} aria-pressed={index === props.lifecycleIndex} onClick={() => props.setLifecycleIndex(index)} key={state.name}>
                <span>{index + 1}</span>{state.name}
              </button>
            ))}
          </div>
          <p className="preview-evidence-line">Echo is early intelligence. Manifested is confirmed. Vanished records lost confirmed availability.</p>
          <p className="preview-disclaimer">Demonstration only. This preview is not displaying real-time stock, and Echo never guarantees a drop.</p>
          <button type="button" className="preview-next-action" onClick={props.returnToOffer}>Return to the sample offer <span>→</span></button>
        </>
      ) : (
        <div className="preview-fatefind-form">
          <button type="button" className={`preview-save-product ${props.productSaved ? "active" : ""}`} aria-pressed={props.productSaved} onClick={() => props.setProductSaved(!props.productSaved)}>
            <span>{props.productSaved ? "✓" : "+"}</span><div><strong>Journey Together ETB</strong><small>{props.productSaved ? "Saved to this simulation" : "Save example product"}</small></div>
          </button>
          <label className="preview-field"><span>Maximum price</span><div className="price-input"><b>£</b><input aria-label="Maximum sample price" type="number" min="1" max="999" value={props.maximumPrice} onChange={(event) => props.setMaximumPrice(event.target.value)} /></div></label>
          <label className="preview-field"><span>Condition</span><select aria-label="Select product condition" value={props.condition} onChange={(event) => props.setCondition(event.target.value)}><option>Sealed</option><option>New</option><option>Pre-owned</option></select></label>
          <label className="preview-check"><input type="checkbox" checked={props.preorders} onChange={(event) => props.setPreorders(event.target.checked)} /><span>Preorders are acceptable</span></label>
          <fieldset><legend>How would you like to buy?</legend><div className="preview-choice-grid">{["Online purchase", "Local collection"].map((method) => <button type="button" className={props.purchaseMethod === method ? "active" : ""} aria-pressed={props.purchaseMethod === method} onClick={() => props.setPurchaseMethod(method)} key={method}>{method}</button>)}</div></fieldset>
          <button type="button" className="preview-primary-action" onClick={() => props.setFateFindActive(true)}>Activate simulated FateFind</button>
          {props.fateFindActive && <><p className="preview-fatefind-confirmation" role="status"><span>✓</span><strong>FateFind is watching the network.</strong><small>Simulation only — no information has been collected or stored.</small></p><button type="button" className="preview-next-action" onClick={() => { props.setAlertMode("lifecycle"); props.setLifecycleIndex(1); }}>Show Manifested stock signal <span>→</span></button></>}
        </div>
      )}
    </div>
  );
}

function MorePreview({ mode, setMode, vendorMode, setVendorMode, stallResult, setStallResult }: {
  mode: MoreMode;
  setMode: (value: MoreMode) => void;
  vendorMode: boolean;
  setVendorMode: (value: boolean) => void;
  stallResult: boolean;
  setStallResult: (value: boolean) => void;
}) {
  return (
    <div className="preview-view">
      <ScreenTitle eyebrow="DISCOVER · SAMPLE DATA" title={mode === "radar" ? "Local Radar" : "Fate Encounters"} />
      <div className="preview-segmented" role="group" aria-label="More demonstration mode">
        <button type="button" className={mode === "radar" ? "active" : ""} onClick={() => setMode("radar")}>Local Radar</button>
        <button type="button" className={mode === "events" ? "active" : ""} onClick={() => setMode("events")}>Event demo</button>
      </div>
      {mode === "radar" ? (
        <>
          <p className="preview-sample-postcode"><span>EXAMPLE POSTCODE</span>AB1 2CD · no location requested</p>
          <div className="preview-radar-map" aria-label="Map-style sample preview"><i /><i /><i /><div><span /></div></div>
          <div className="preview-radar-list">
            <article><i className="signal-cyan" /><div><strong>Northstar Cards</strong><span>Independent shop · sample</span></div><b>1.8 mi</b></article>
            <article><i className="signal-violet" /><div><strong>Fate Encounters Demo Day</strong><span>Card event · sample</span></div><b>2.4 mi</b></article>
            <article><i className="signal-green" /><div><strong>Card Corner UK</strong><span>Independent shop · sample</span></div><b>3.2 mi</b></article>
          </div>
        </>
      ) : (
        <article className="preview-event-detail">
          <span className="preview-sample-chip">SAMPLE EVENT + VENDORS</span>
          <h4>Fate Encounters Demo Day</h4>
          <div className="preview-event-facts"><span><b>12 SEP 2026</b>Date</span><span><b>£8</b>Demo ticket</span></div>
          <p>Example Hall · Birmingham · sample venue</p>
          <dl><div><dt>Vendors</dt><dd>Northstar Cards · Card Corner UK · The Indie Deck (all sample)</dd></div><div><dt>Schedule</dt><dd>10:00 doors · 12:30 trade clinic · 15:00 tournament</dd></div></dl>
          <button type="button" className={`preview-vendor-toggle ${vendorMode ? "active" : ""}`} aria-pressed={vendorMode} onClick={() => setVendorMode(!vendorMode)}><span>Event Vendor Mode</span><i>{vendorMode ? "ON" : "OFF"}</i></button>
          {vendorMode && <div className="preview-vendor-search"><label className="preview-field"><span>Search a sample product</span><select aria-label="Search event vendor sample product"><option>Journey Together ETB</option><option>Prismatic Evolutions Bundle</option></select></label><button type="button" className="preview-primary-action" onClick={() => setStallResult(true)}>Find demonstration stall</button>{stallResult && <p role="status"><span>FOUND · SAMPLE</span><strong>Stall B12 · Northstar Cards</strong><small>Example result only</small></p>}</div>}
        </article>
      )}
    </div>
  );
}
