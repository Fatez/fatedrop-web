"use client";

import { useEffect } from "react";

export type RetailerExposureType = "search_appearance" | "fatefind_appearance" | "fatefind_best_value" | "storefront_view" | "fatematch_handoff";

export type RetailerExposure = {
  type: RetailerExposureType;
  retailer: string;
  storeId: string;
  title: string;
  subtitle?: string;
};

export function RetailerExposureObserver({ exposures }: { exposures: RetailerExposure[] }) {
  useEffect(() => {
    if (!exposures.length) return;
    for (const exposure of exposures) {
      const payload = JSON.stringify({
        type: exposure.type,
        retailer: exposure.retailer,
        storeId: exposure.storeId,
        title: exposure.title,
        subtitle: exposure.subtitle ?? null,
      });
      void fetch("/api/dashboard/activity", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(() => undefined);
    }
  }, [exposures]);

  return null;
}
