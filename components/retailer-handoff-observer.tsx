"use client";

import { useEffect } from "react";

type HandoffContext = "alerts" | "fatefind" | "search" | "true_price" | "independent_stores";

function contextForPath(pathname: string): HandoffContext | null {
  if (pathname === "/dashboard/alerts") return "alerts";
  if (pathname === "/dashboard/watchlist") return "fatefind";
  if (pathname === "/dashboard/search") return "search";
  if (pathname === "/dashboard/true-price") return "true_price";
  if (pathname === "/dashboard/stores") return "independent_stores";
  return null;
}

function textFrom(root: Element | null, selector: string) {
  return root?.querySelector(selector)?.textContent?.trim() || null;
}

function handoffDetails(anchor: HTMLAnchorElement, context: HandoffContext) {
  const explicitRetailer = anchor.dataset.fdRetailer?.trim() || null;
  if (explicitRetailer) {
    return {
      retailer: explicitRetailer,
      productTitle: anchor.dataset.fdProductTitle?.trim() || explicitRetailer,
    };
  }

  if (context === "alerts") {
    const row = anchor.closest(".fd-ledger-row");
    return {
      retailer: textFrom(row, ".fd-ledger-product > small"),
      productTitle: textFrom(row, ".fd-ledger-product > strong"),
    };
  }

  if (context === "search") {
    const offer = anchor.closest(".fd-search-offer");
    const group = anchor.closest(".fd-search-group");
    return {
      retailer: textFrom(offer, "div:first-child strong"),
      productTitle: textFrom(group, "header h2"),
    };
  }

  if (context === "true_price") {
    const offer = anchor.closest(".fd-tp-offer");
    const group = anchor.closest(".fd-tp-group");
    return {
      retailer: textFrom(offer, ".fd-tp-store strong"),
      productTitle: textFrom(group, "header h2"),
    };
  }

  if (context === "fatefind") return { retailer: null, productTitle: null };

  const card = anchor.closest(".fd-indies-network-grid article");
  const retailer = textFrom(card, "h3");
  return { retailer, productTitle: retailer };
}

export function RetailerHandoffObserver() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[target='_blank']");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const context = contextForPath(window.location.pathname);
      if (!context) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (destination.protocol !== "https:" || destination.origin === window.location.origin) return;

      const details = handoffDetails(anchor, context);
      if (!details.retailer) return;

      const payload = JSON.stringify({
        type: "store_tracked",
        retailer: details.retailer,
        storeId: destination.hostname.toLowerCase(),
        title: details.productTitle || details.retailer,
        subtitle: `Retailer handoff · ${context}`,
      });

      void fetch("/api/dashboard/activity", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(() => undefined);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
