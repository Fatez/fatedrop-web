"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SaveWishlistButton({ title, query, productIdentityId, tcg, imageUrl, label = "SAVE TO WISHLIST" }: { title: string; query?: string; productIdentityId?: string | null; tcg?: string | null; imageUrl?: string | null; label?: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  async function save() {
    setState("saving");
    try {
      const response = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, query: query || title, productIdentityId, tcg, imageUrl }) });
      if (!response.ok) throw new Error();
      setState("saved");
    } catch { setState("error"); }
  }
  return <button type="button" onClick={save} disabled={state === "saving" || state === "saved"} className="fd-inline-save">{state === "saving" ? "SAVING…" : state === "saved" ? "✓ SAVED" : state === "error" ? "TRY AGAIN" : label}</button>;
}

export function RemoveWishlistButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    try {
      const response = await fetch("/api/wishlist", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!response.ok) throw new Error();
      router.refresh();
    } finally { setBusy(false); }
  }
  return <button type="button" onClick={remove} disabled={busy} className="fd-inline-remove">{busy ? "REMOVING…" : "REMOVE"}</button>;
}
