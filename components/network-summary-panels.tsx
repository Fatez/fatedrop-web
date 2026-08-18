import type { CatalogueProduct } from "@/lib/retailer-catalogue";
import type { RetailerRecord } from "@/lib/retailer-registry";

function statusLabel(store: RetailerRecord) {
  if (store.catalogueStatus === "connected") return "LIVE";
  if (store.catalogueStatus === "candidate") return "CONNECTING";
  return "MAPPED";
}

export function NetworkSummaryPanels({ stores, products }: { stores: RetailerRecord[]; products: CatalogueProduct[] }) {
  const retail = stores.filter((store) => store.category !== "indie");
  const indies = stores.filter((store) => store.category === "indie");
  const retailLive = retail.filter((store) => store.catalogueStatus === "connected").length;
  const indieLive = indies.filter((store) => store.catalogueStatus === "connected").length;

  return (
    <div className="fd-network-summary-grid">
      <section className="fd-dash-card fd-network-summary-card">
        <div className="fd-dash-card-head"><span>RETAIL NETWORK</span><small>{retail.length} mapped · {retailLive} live</small></div>
        <div className="fd-network-message"><h1>National retail + TCG specialists.</h1><p>Pokémon Center, high-street retailers and established TCG specialists feed the same universal product engine as they are connected.</p></div>
        <div className="fd-network-mini-list">
          {retail.slice(0, 6).map((store) => <div key={store.id}><strong>{store.name}</strong><span>{statusLabel(store)}</span></div>)}
        </div>
      </section>

      <section className="fd-dash-card fd-network-summary-card">
        <div className="fd-dash-card-head"><span>INDEPENDENT NETWORK</span><small>{indies.length} mapped · {indieLive} live</small></div>
        <div className="fd-network-message"><h1>Independent stores, given proper visibility.</h1><p>Indies sit beside the retail network without being buried or ranked. Their live offers enter the same product comparison and buying journey.</p></div>
        <div className="fd-network-mini-list">
          {indies.slice(0, 6).map((store) => <div key={store.id}><strong>{store.name}</strong><span>{store.id === "cob-and-pip" && products.length ? `${products.length} OFFERS` : statusLabel(store)}</span></div>)}
        </div>
      </section>
    </div>
  );
}
