"use client";

import { useMemo, useState } from "react";
import { retailerCategoryLabels, type RetailerCategory, type RetailerRecord } from "@/lib/retailer-registry";

const tabs: Array<{ id: "all" | RetailerCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "major-retail", label: "Major Retail" },
  { id: "tcg-specialist", label: "TCG Specialists" },
  { id: "indie", label: "Indies" },
];

export function RetailerNetworkBrowser({ stores }: { stores: RetailerRecord[] }) {
  const [active, setActive] = useState<"all" | RetailerCategory>("all");
  const visible = useMemo(() => active === "all" ? stores : stores.filter((store) => store.category === active), [active, stores]);
  return (
    <section className="fd-dash-card" style={{ marginTop: 18 }}>
      <div className="fd-dash-card-head"><span>STORE DIRECTORY</span><small>{visible.length} shown</small></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActive(tab.id)} className="fd-dashboard-wide-button" style={{ width: "auto", opacity: active === tab.id ? 1 : .58 }}>{tab.label}</button>)}
      </div>
      <div className="fd-dashboard-list">
        {visible.map((store) => (
          <article key={store.id}>
            <span className="fd-store-thumb">◇</span>
            <div><strong>{store.name}</strong><small>{retailerCategoryLabels[store.category]} · {store.onlineCatalogue ? "online catalogue" : "retail network"}{store.physicalStores ? " · physical stores" : ""}{store.freeDeliveryThresholdPence ? ` · free delivery £${(store.freeDeliveryThresholdPence / 100).toFixed(0)}+` : ""}</small></div>
            <aside><span>{store.catalogueStatus === "connected" ? "LIVE" : store.catalogueStatus === "candidate" ? "CATALOGUE NEXT" : "MAPPED"}</span><a href={store.website} target="_blank" rel="noreferrer" aria-label={`Open ${store.name}`}>↗</a></aside>
          </article>
        ))}
      </div>
    </section>
  );
}
