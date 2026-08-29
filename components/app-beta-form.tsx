"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./app-beta-form.module.css";

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

  const statusClass = status.kind === "error"
    ? styles.statusError
    : status.kind === "success"
      ? styles.statusSuccess
      : styles.statusLoading;

  return (
    <div className={styles.panel}>
      <div className={styles.heading}>
        <small>Controlled mobile beta</small>
        <h2>Request App Beta access.</h2>
        <p>This registers beta interest only. It does not publish an install link or create a second FateDrop account.</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.spamField} aria-hidden="true">
          <label htmlFor="companyFax">Company fax</label>
          <input id="companyFax" name="companyFax" tabIndex={-1} autoComplete="off" />
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <input className={styles.input} name="contactName" autoComplete="name" placeholder="Your name" required />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input className={styles.input} name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Postcode or region <small className={styles.optional}>(optional)</small></span>
            <input className={styles.input} name="region" autoComplete="postal-code" placeholder="e.g. ME7 1HS" />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Primary TCG</span>
            <select className={styles.select} name="primaryTcg" defaultValue="Pokémon">
              <option>Pokémon</option>
              <option>Magic: The Gathering — future expansion</option>
              <option>Yu-Gi-Oh! — future expansion</option>
              <option>One Piece — future expansion</option>
              <option>Disney Lorcana — future expansion</option>
              <option>Other / multiple — future expansion</option>
            </select>
          </label>
        </div>

        <div className={styles.consentGroup}>
          <label className={styles.checkbox}>
            <input type="checkbox" name="contactConsent" />
            <span>I agree that FateDrop may store these details and contact me about App Beta access.</span>
          </label>
          <label className={`${styles.checkbox} ${styles.optionalConsent}`}>
            <input type="checkbox" name="marketingConsent" />
            <span>Optional: send me occasional FateDrop product and launch updates.</span>
          </label>
        </div>

        <div className={styles.actions}>
          <button className={`button button-primary ${styles.submit}`} type="submit" disabled={status.kind === "loading" || status.kind === "success"}>
            {status.kind === "loading" ? "Joining…" : "Join the App Beta"} <span>↗</span>
          </button>
          {status.message ? <p className={`${styles.status} ${statusClass}`} role="status" aria-live="polite">{status.message}</p> : null}
          {status.kind === "success" ? <p className={styles.accountPrompt}>Need a FateDrop ID? <Link href="/account/register">Create your sign-in account →</Link></p> : null}
        </div>
      </form>
    </div>
  );
}
