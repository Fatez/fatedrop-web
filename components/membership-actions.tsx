"use client";

import { useState } from "react";
import type { MembershipTier } from "@/lib/account-storage";

export function StartMembershipButton({ tier, label }: { tier: Exclude<MembershipTier, "free">; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setError(result.error || "Checkout could not be started.");
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError("FateDrop could not reach billing.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="membership-action-wrap"><button className="button button-primary" type="button" onClick={start} disabled={busy}>{busy ? "Opening Stripe…" : label} <span>↗</span></button>{error ? <small className="action-error">{error}</small> : null}</div>;
}

export function BillingPortalButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setError(result.error || "Billing portal could not be opened.");
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError("FateDrop could not reach billing.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="membership-action-wrap"><button className="button button-secondary" type="button" onClick={openPortal} disabled={busy}>{busy ? "Opening…" : "Manage billing"}</button>{error ? <small className="action-error">{error}</small> : null}</div>;
}
