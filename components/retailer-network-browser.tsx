"use client";

import { useMemo, useState } from "react";
import { retailerCategoryLabels, type RetailerCategory, type RetailerRecord } from "@/lib/retailer-registry";

const tabs: Array<{ id: "all" | RetailerCategory; label: string }> = [
  { id: "all", label: "All stores" },
  { id: "major-retail", label: "Major retail" },
  { id: "tcg-specialist", label: "TCG specialists" },
  { id: "indie", label: "Indies" },
];

export function RetailerNetworkBrowser({ stores }: { stores: RetailerRecord[] }) {
  const [active, setActive] = useState<"all" | RetailerCategory>("all");
  const visible = useMemo(() => active === "all" ? stores : stores.filter((store) => store.category === active), [active, stores]);

  return (
    <div className="fd-store-directory-browser">
      <div className="fd-store-directory-controls">
        <div className="fd-store-directory-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className="fd-store-directory-tab"
              data-active={active === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="fd-store-directory-count">{visible.length} shown</span>
      </div>

      <div className="fd-dashboard-list fd-store-directory-list">
        {visible.map((store) => (
          <article key={store.id}>
            <span className="fd-store-thumb">◇</span>
            <div>
              <strong>{store.name}</strong>
              <small>
                {retailerCategoryLabels[store.category]} · {store.onlineCatalogue ? "online catalogue" : "retail network"}
                {store.physicalStores ? " · physical stores" : ""}
                {store.freeDeliveryThresholdPence ? ` · free delivery £${(store.freeDeliveryThresholdPence / 100).toFixed(0)}+` : ""}
              </small>
            </div>
            <aside>
              <span>{store.catalogueStatus === "connected" ? "LIVE" : store.catalogueStatus === "candidate" ? "CATALOGUE NEXT" : "MAPPED"}</span>
              <a href={store.website} target="_blank" rel="noreferrer" aria-label={`Open ${store.name}`}>OPEN ↗</a>
            </aside>
          </article>
        ))}
      </div>
    </div>
  );
}
