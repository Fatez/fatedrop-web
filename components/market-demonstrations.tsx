const journey = [
  "Search one product",
  "Compare participating offers",
  "Check known delivery cost",
  "Save to Universal Wishlist",
  "Create a FateFind request",
  "Receive a Manifested signal",
  "See the product Vanish",
  "Receive an Echo return alert",
  "Find nearby independents",
  "Search event-vendor stock",
] as const;

export function MarketDemonstrations() {
  return (
    <div className="market-demo">
      <div className="demo-disclaimer"><span>Illustrative product preview</span><p>Designed in FateDrop’s current app language. Prices and retailer names below are demonstrations, not live offers.</p></div>
      <div className="market-demo-grid">
        <article className="comparison-demo">
          <small>UNIFIED SEARCH / TRUE PRICE</small>
          <div className="preview-search">⌕ Search: premium collection</div>
          <div className="preview-offer"><span><i className="offer-art" /><b>Verified retailer A</b></span><em>£49.99 + £3.95</em><strong>£53.94</strong></div>
          <div className="preview-offer best"><span><i className="offer-art violet" /><b>Independent retailer B</b></span><em>£51.99 · free delivery</em><strong>£51.99</strong></div>
          <p>Final price and availability are always confirmed at retailer checkout.</p>
        </article>
        <article className="wanted-demo">
          <small>WISHLIST / FATEFIND</small>
          <div className="wanted-product"><i /><span><b>Wanted product</b><em>Saved across the network</em></span><strong>♥</strong></div>
          <div className="fatefind-request"><span>MAX PRICE</span><b>£55</b><span>CONDITION</span><b>Sealed</b><span>COLLECTION</span><b>Yes</b></div>
          <p>One structured request replaces another evening spent interrogating twenty browser tabs.</p>
        </article>
        <article className="signal-demo">
          <small>STOCK LIFECYCLE / PREVIEW</small>
          <div className="signal-event manifested"><i />Manifested <span>Verified live · now</span></div>
          <div className="signal-event vanished"><i />Vanished <span>Observed transition · 12m</span></div>
          <div className="signal-event echo"><i />Echo <span>Availability returned · 41m</span></div>
          <p>Evidence-backed transitions, not a dramatic purple crystal ball pretending it knows everything.</p>
        </article>
        <article className="local-demo">
          <small>LOCAL RADAR / EVENT VENDOR MODE</small>
          <div className="local-map-preview"><i /><i /><i /><strong>YOU</strong></div>
          <div className="local-result"><span>Independent shop</span><b>Local stock discovered</b></div>
          <div className="local-result event"><span>Upcoming event</span><b>Vendor stall catalogue preview</b></div>
        </article>
      </div>
      <ol className="journey-rail">
        {journey.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
      </ol>
    </div>
  );
}
