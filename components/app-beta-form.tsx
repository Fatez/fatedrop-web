"use client";

import { FormEvent, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Status = { kind: "idle" | "loading" | "error" | "success"; message: string };

export function AppBetaForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const started = useRef(false);

  function beginForm() {
    if (started.current) return;
    started.current = true;
    trackEvent("form_start", { journey: "app_beta" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "loading" || status.kind === "success") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const contactName = String(data.get("contactName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const deviceType = String(data.get("deviceType") ?? "").trim();
    const contactConsent = data.get("contactConsent") === "on";

    if (!contactName) nextErrors.contactName = "Enter your name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!deviceType) nextErrors.deviceType = "Choose your test device.";
    if (!contactConsent) nextErrors.contactConsent = "Consent is required so FateDrop can send your beta invite.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ kind: "error", message: "A few details need your attention before you can join the App Beta list." });
      return;
    }

    const payload = {
      contactName,
      email,
      deviceType,
      contactConsent,
      marketingConsent: data.get("marketingConsent") === "on",
      companyFax: String(data.get("companyFax") ?? ""),
    };

    setStatus({ kind: "loading", message: "Adding you to the App Beta list…" });
    trackEvent("form_submit_attempt", { journey: "app_beta", deviceType });

    try {
      const response = await fetch("/api/app-beta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { stored?: boolean; error?: string; message?: string; fields?: Record<string, string> };
      if (!response.ok || !result.stored) {
        setErrors(result.fields ?? {});
        setStatus({ kind: "error", message: result.error ?? "Nothing was saved. Please try again." });
        return;
      }
      form.reset();
      setErrors({});
      setStatus({ kind: "success", message: result.message ?? "You’re on the FateDrop App Beta list." });
      trackEvent("form_submit_stored", { journey: "app_beta", deviceType });
    } catch {
      setStatus({ kind: "error", message: "The signup service did not respond. Nothing has been saved—please try again." });
    }
  }

  const fieldProps = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="app-beta-panel">
      <div className="app-beta-form-heading">
        <small>Private app beta</small>
        <h2>Get the install invite.</h2>
        <p>This is only the App Beta waiting list. It does not create a FateDrop ID or change an existing FateDrop account.</p>
      </div>
      <form onSubmit={handleSubmit} onFocus={beginForm} noValidate>
        <div className="spam-field" aria-hidden="true"><label htmlFor="companyFax">Company fax</label><input id="companyFax" name="companyFax" tabIndex={-1} autoComplete="off" /></div>
        <div className="app-beta-form-grid">
          <label className="app-beta-field" htmlFor="contactName">
            <span>Name</span>
            <input id="contactName" name="contactName" autoComplete="name" {...fieldProps("contactName")} />
            {errors.contactName ? <small id="contactName-error" className="field-error">{errors.contactName}</small> : null}
          </label>
          <label className="app-beta-field" htmlFor="email">
            <span>Email</span>
            <input id="email" name="email" type="email" autoComplete="email" {...fieldProps("email")} />
            {errors.email ? <small id="email-error" className="field-error">{errors.email}</small> : null}
          </label>
          <label className="app-beta-field app-beta-field-full" htmlFor="deviceType">
            <span>Device you want to test on</span>
            <select id="deviceType" name="deviceType" defaultValue="" {...fieldProps("deviceType")}>
              <option value="" disabled>Select your device</option>
              <option value="iphone">iPhone — current TestFlight beta</option>
              <option value="ipad">iPad — current TestFlight beta</option>
              <option value="android">Android — register interest for the later beta</option>
              <option value="other">Other / not sure</option>
            </select>
            {errors.deviceType ? <small id="deviceType-error" className="field-error">{errors.deviceType}</small> : null}
          </label>
          <label className="checkbox-field app-beta-field-full">
            <input type="checkbox" name="contactConsent" aria-invalid={Boolean(errors.contactConsent)} aria-describedby={errors.contactConsent ? "contactConsent-error" : undefined} />
            <span>I agree that FateDrop may store these details and email me about App Beta access and installation.</span>
            {errors.contactConsent ? <small id="contactConsent-error" className="field-error">{errors.contactConsent}</small> : null}
          </label>
          <label className="checkbox-field optional-consent app-beta-field-full">
            <input type="checkbox" name="marketingConsent" />
            <span>Optional: send me occasional FateDrop launch and product updates. This is not required for beta access.</span>
          </label>
        </div>
        <div className="form-actions app-beta-actions">
          <button className="button button-primary" type="submit" disabled={status.kind === "loading" || status.kind === "success"}>
            {status.kind === "loading" ? "Joining…" : "Join the App Beta"} <span>↗</span>
          </button>
          {status.message ? <p className={`form-status ${status.kind}`} role="status" aria-live="polite">{status.message}</p> : null}
        </div>
      </form>
    </div>
  );
}
