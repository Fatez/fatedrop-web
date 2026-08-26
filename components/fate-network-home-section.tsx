import Link from "next/link";

export function FateNetworkHomeSection() {
  return (
    <section className="content-section section-shell split-section" aria-labelledby="fate-network-home-title">
      <div className="copy-stack">
        <p className="eyebrow"><span />Fate Network</p>
        <h2 id="fate-network-home-title">One connected market. More useful places to buy.</h2>
        <p>Fate Network is the retailer layer underneath Search, FateFind and FateMatch. Major retailers, specialist TCG stores and independent businesses can all become part of the answer when FateDrop has reliable product, catalogue or availability evidence.</p>
        <p>FateDrop does not become the shop. It creates the discovery and intelligence layer, then sends the collector directly to the retailer to confirm the final offer and buy.</p>
        <div className="button-row">
          <Link className="button button-primary" href="/collectors">For collectors <span>↗</span></Link>
          <Link className="button button-secondary" href="/businesses">For retailers</Link>
        </div>
      </div>

      <div className="insight-panel retailer-network-panel">
        <small>COLLECTOR INTENT → FATE NETWORK → RETAILER</small>
        <div className="retailer-network-flow" aria-label="Fate Network buying journey">
          <span>Search</span><i /><span>FateFind</span><i /><span>FateMatch</span><i /><span>Retailer</span>
        </div>
        <div className="search-journey">
          <div className="search-query">⌕ Search the connected market</div>
          <div className="journey-result"><span className="journey-thumb" /><div><b>Compare evidence-backed offers</b><small>Correct product identity, retailer, stock and value context</small></div><span>Find</span></div>
          <div className="journey-result"><span className="journey-thumb" /><div><b>Wait when the deal is not right</b><small>FateMatch watches your buying conditions</small></div><span>Watch</span></div>
          <div className="journey-arrow" />
          <div className="journey-store"><small>BUY DIRECT</small><strong>The retailer keeps the transaction.</strong><p>FateDrop helps you reach the right store; the retailer keeps checkout, fulfilment and service.</p></div>
        </div>
      </div>
    </section>
  );
}
