"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Status = { kind: "idle" | "loading" | "error" | "success"; message: string };

export function AppBetaForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "loading" || status.kind === "success") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const contactName = String(data.get("contactName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const contactConsent = data.get("contactConsent") === "on";

    if (!contactName || !email || !contactConsent) {
      setStatus({ kind: "error", message: "Add your name and email, then confirm we can contact you about beta access." });
      return;
    }

    setStatus({ kind: "loading", message: "Joining the App Beta list…" });
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: "collector",
          contactName,
          email,
          region: String(data.get("region") ?? "").trim(),
          primaryTcg: String(data.get("primaryTcg") ?? "Pokémon"),
          wantedFeature: "FateDrop App Beta",
          contactConsent,
          marketingConsent: data.get("marketingConsent") === "on",
          companyFax: String(data.get("companyFax") ?? ""),
        }),
      });
      const result = await response.json() as { stored?: boolean; error?: string };

      if (response.status === 409) {
        setStatus({ kind: "success", message: "You’re already on the FateDrop beta list — no second registration is needed for App Beta access." });
        return;
      }
      if (!response.ok || !result.stored) {
        setStatus({ kind: "error", message: result.error ?? "We couldn’t save your App Beta request. Please try again." });
        return;
      }
      form.reset();
      setStatus({ kind: "success", message: "You’re on the FateDrop App Beta list. We’ll contact you with controlled install access when your place is ready." });
    } catch {
      setStatus({ kind: "error", message: "The beta signup service didn’t respond. Nothing was saved — please try again." });
    }
  }

  return (
    <div className="join-panel">
      <div className="form-heading">
        <small>Controlled mobile beta</small>
        <h2>Request App Beta access.</h2>
        <p>This registers beta interest only. It does not publish an install link or create a second FateDrop account.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="spam-field" aria-hidden="true"><label htmlFor="companyFax">Company fax</label><input id="companyFax" name="companyFax" tabIndex={-1} autoComplete="off" /></div>
        <div className="form-grid">
          <label><span>Name</span><input name="contactName" autoComplete="name" required /></label>
          <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
          <label><span>Postcode or region <small>(optional)</small></span><input name="region" autoComplete="postal-code" /></label>
          <label><span>Primary TCG</span><select name="primaryTcg" defaultValue="Pokémon"><option>Pokémon</option><option>Magic: The Gathering — future expansion</option><option>Yu-Gi-Oh! — future expansion</option><option>One Piece — future expansion</option><option>Disney Lorcana — future expansion</option><option>Other / multiple — future expansion</option></select></label>
        </div>
        <label className="checkbox-field"><input type="checkbox" name="contactConsent" /><span>I agree that FateDrop may store these details and contact me about App Beta access.</span></label>
        <label className="checkbox-field optional-consent"><input type="checkbox" name="marketingConsent" /><span>Optional: send me occasional FateDrop product and launch updates.</span></label>
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={status.kind === "loading" || status.kind === "success"}>{status.kind === "loading" ? "Joining…" : "Join the App Beta"} <span>↗</span></button>
          {status.message ? <p className={`form-status ${status.kind}`} role="status" aria-live="polite">{status.message}</p> : null}
          {status.kind === "success" ? <p style={{ marginTop: 12 }}>Need a FateDrop ID? <Link href="/account/register">Create your sign-in account →</Link></p> : null}
        </div>
      </form>
    </div>
  );
}
