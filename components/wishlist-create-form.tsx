"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WishlistCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const clean = title.trim();
    if (clean.length < 2) return;
    setStatus("saving");
    try {
      const response = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: clean, query: clean }) });
      if (!response.ok) throw new Error();
      setTitle(""); setStatus("idle"); router.refresh();
    } catch { setStatus("error"); }
  }
  return <form onSubmit={submit} className="fd-wishlist-create"><input aria-label="Product to save" value={title} onChange={(event)=>setTitle(event.target.value)} placeholder="Save a product, e.g. Destined Rivals ETB"/><button type="submit" disabled={status === "saving"}>{status === "saving" ? "SAVING…" : status === "error" ? "TRY AGAIN" : "SAVE PRODUCT →"}</button><style jsx>{`.fd-wishlist-create{display:flex;gap:8px;margin-top:18px;max-width:720px}.fd-wishlist-create input{min-width:0;flex:1;height:44px;padding:0 12px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:#09080d;color:#fff}.fd-wishlist-create button{min-height:44px;padding:0 14px;border:1px solid rgba(104,232,251,.22);border-radius:11px;background:linear-gradient(135deg,rgba(104,232,251,.08),rgba(157,109,255,.1));color:#fff;font-size:8px;font-weight:900}@media(max-width:560px){.fd-wishlist-create{flex-direction:column}}`}</style></form>;
}
