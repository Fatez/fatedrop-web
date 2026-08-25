"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type HandoffContext = "alerts" | "fatefind" | "fatematch" | "search" | "independent_stores";

function contextForPath(pathname: string): HandoffContext | null {
  if (pathname === "/dashboard/alerts") return "alerts";
  if (pathname === "/dashboard/watchlist") return "fatematch";
  if (pathname === "/dashboard/fatefind" || pathname === "/dashboard/true-price") return "fatefind";
  if (pathname === "/dashboard/search") return "search";
  if (pathname === "/dashboard/stores" || pathname.startsWith("/dashboard/stores/")) return "independent_stores";
  return null;
}

function textFrom(root: Element | Document | null, selector: string) {
  return root?.querySelector(selector)?.textContent?.trim() || null;
}

function externalDestination(anchor: HTMLAnchorElement | null) {
  if (!anchor) return null;
  try {
    const destination = new URL(anchor.href, window.location.href);
    if (destination.protocol !== "https:" || destination.origin === window.location.origin) return null;
    return destination;
  } catch { return null; }
}

function storeId(destination: URL) {
  return destination.hostname.toLowerCase().replace(/^www\./, "");
}

function handoffDetails(anchor: HTMLAnchorElement, context: HandoffContext) {
  const explicitRetailer = anchor.dataset.fdRetailer?.trim() || null;
  if (explicitRetailer) return { retailer: explicitRetailer, productTitle: anchor.dataset.fdProductTitle?.trim() || explicitRetailer };

  if (context === "alerts") {
    const row = anchor.closest(".fd-ledger-row");
    return { retailer: textFrom(row, ".fd-ledger-product > small"), productTitle: textFrom(row, ".fd-ledger-product > strong") };
  }

  if (context === "search") {
    const offer = anchor.closest(".fd-search-offer");
    const group = anchor.closest(".fd-search-group");
    return { retailer: textFrom(offer, "div:first-child strong"), productTitle: textFrom(group, "header h2") };
  }

  if (context === "fatefind") {
    const offer = anchor.closest(".fd-tp-offer");
    const group = anchor.closest(".fd-tp-group");
    return { retailer: textFrom(offer, ".fd-tp-store strong"), productTitle: textFrom(group, "header h2") };
  }

  if (context === "fatematch") return { retailer: null, productTitle: null };
  const card = anchor.closest(".fd-indies-network-grid article");
  const retailer = textFrom(card, "h3");
  return { retailer, productTitle: retailer };
}

function send(payload: Record<string, unknown>) {
  void fetch("/api/dashboard/activity", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

function recordSearchAppearances() {
  document.querySelectorAll(".fd-search-group").forEach((group) => {
    const productTitle = textFrom(group, "header h2");
    group.querySelectorAll(".fd-search-offer").forEach((offer) => {
      const retailer = textFrom(offer, "div:first-child strong");
      const destination = externalDestination(offer.querySelector("a[target='_blank']"));
      if (!retailer || !productTitle || !destination) return;
      send({ type: "search_appearance", retailer, storeId: storeId(destination), title: productTitle, subtitle: "Product appeared in Search" });
    });
  });
}

function recordFateFindAppearances() {
  const groups = [...document.querySelectorAll(".fd-tp-group")];
  for (const group of groups) {
    const productTitle = textFrom(group, "header h2");
    group.querySelectorAll(".fd-tp-offer").forEach((offer) => {
      const retailer = textFrom(offer, ".fd-tp-store strong");
      const destination = externalDestination(offer.querySelector("a[target='_blank']"));
      if (!retailer || !productTitle || !destination) return;
      send({ type: "fatefind_appearance", retailer, storeId: storeId(destination), title: productTitle, subtitle: "Offer appeared in FateFind value comparison" });
    });
  }

  const verdict = textFrom(document, ".fd-value-verdict.winner strong");
  if (!verdict) return;
  const winningGroup = groups.find((group) => {
    const title = textFrom(group, "header h2");
    return Boolean(title && verdict.includes(title));
  });
  if (!winningGroup) return;
  const winningOffer = winningGroup.querySelector(".fd-tp-offer.best") ?? winningGroup.querySelector(".fd-tp-offer");
  const anchor = winningOffer?.querySelector("a[target='_blank']") as HTMLAnchorElement | null;
  const destination = externalDestination(anchor);
  const retailer = textFrom(winningOffer, ".fd-tp-store strong");
  const productTitle = textFrom(winningGroup, "header h2");
  if (!retailer || !productTitle || !destination) return;
  send({ type: "fatefind_best_value", retailer, storeId: storeId(destination), title: productTitle, subtitle: "Visible FateFind Value Compare winner" });
}

function recordStorefrontView(pathname: string) {
  if (!pathname.startsWith("/dashboard/stores/")) return;
  const main = document.querySelector("main") ?? document.body;
  const anchor = [...main.querySelectorAll("a[target='_blank']")].find((item) => externalDestination(item as HTMLAnchorElement)) as HTMLAnchorElement | undefined;
  const destination = externalDestination(anchor ?? null);
  const retailer = textFrom(main, "h1") ?? textFrom(main, "h2");
  if (!destination || !retailer) return;
  send({ type: "storefront_view", retailer, storeId: storeId(destination), title: retailer, subtitle: "FateDrop retailer storefront viewed" });
}

export function RetailerHandoffObserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();

  useEffect(() => {
    const context = contextForPath(pathname);
    const timer = window.setTimeout(() => {
      if (context === "search") recordSearchAppearances();
      if (context === "fatefind") recordFateFindAppearances();
      if (context === "independent_stores") recordStorefrontView(pathname);
    }, 0);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[target='_blank']");
      if (!(anchor instanceof HTMLAnchorElement) || !context) return;
      const destination = externalDestination(anchor);
      if (!destination) return;

      const details = handoffDetails(anchor, context);
      if (!details.retailer) return;
      const common = { retailer: details.retailer, storeId: storeId(destination), title: details.productTitle || details.retailer };
      send({ type: "store_tracked", ...common, subtitle: `Retailer handoff · ${context}` });
      if (anchor.dataset.fdHandoff === "fatematch" || context === "fatematch") {
        send({ type: "fatematch_handoff", ...common, subtitle: "Qualified FateMatch retailer handoff" });
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [pathname, queryKey]);

  return null;
}
