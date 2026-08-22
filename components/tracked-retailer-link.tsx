"use client";

import type { MouseEventHandler, ReactNode } from "react";

type TrackedRetailerLinkProps = {
  href: string;
  retailer: string;
  storeId?: string | null;
  productTitle?: string | null;
  context: "search" | "true_price" | "independent_stores";
  amountPence?: number | null;
  className?: string;
  children: ReactNode;
};

function recordRetailerHandoff(input: Omit<TrackedRetailerLinkProps, "href" | "className" | "children">) {
  const payload = JSON.stringify({
    type: "store_tracked",
    retailer: input.retailer,
    storeId: input.storeId ?? null,
    title: input.productTitle ?? input.retailer,
    subtitle: `Retailer handoff · ${input.context}`,
    amountPence: input.amountPence ?? null,
  });

  void fetch("/api/dashboard/activity", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: payload,
  }).catch(() => undefined);
}

export function TrackedRetailerLink({
  href,
  retailer,
  storeId,
  productTitle,
  context,
  amountPence,
  className,
  children,
}: TrackedRetailerLinkProps) {
  const onClick: MouseEventHandler<HTMLAnchorElement> = () => {
    recordRetailerHandoff({ retailer, storeId, productTitle, context, amountPence });
  };

  return <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>{children}</a>;
}
