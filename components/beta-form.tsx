"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Role = "collector" | "business" | "event";
type Status = { kind: "idle" | "loading" | "error" | "success"; message: string };

type RolePresentation = {
  tab: string;
  eyebrow: string;
  title: string;
  button: string;
  image: string;
  alt: string;
  visualLabel: string;
  lede: string;
};

const roleCopy: Record<Role, RolePresentation> = {
  collector: {
    tab: "Collector",
    eyebrow: "Free collector beta",
    title: "Find your way in early.",
    button: "Join the Collector Beta",
    image: "/assets/signup/collector-signup.webp",
    alt: "Collector overlooking the FateDrop signal network with their companion and trading-card products",
    visualLabel: "COLLECTOR ACCESS",
    lede: "Search the network, compare live value and follow the signal with one FateDrop ID.",
  },
  business: {
    tab: "Retailer or vendor",
    eyebrow: "Founding partner enquiry",
    title: "Put your catalogue on the map.",
    button: "Connect Your Catalogue",
    image: "/assets/signup/retailer-signup.webp",
    alt: "FateDrop retailer space with trading-card displays, signal mapping and Oru behind the counter",
    visualLabel: "RETAILER ACCESS",
    lede: "Connect useful stock to collector demand while keeping your own shop, checkout and customer relationship.",
  },
  event: {
    tab: "Event organiser",
    eyebrow: "Event listing enquiry",
    title: "Bring your event into the network.",
    button: "List an Event",
    image: "/assets/signup/events-signup.webp",
    alt: "Busy FateDrop trading-card event with collectors, vendors and the city beyond",
    visualLabel: "EVENT ACCESS",
    lede: "Make source-backed shows, venues and participating vendors easier for collectors to discover.",
  },
};

const requiredByRole: Record<Role, string[]> = {
  collector: ["contactName", "email", "primaryTcg", "wantedFeature", "contactConsent"],
  business: ["contactName", "businessName", "email", "website", "ecommercePlatform", "productCount", "businessType", "catalogueMethod", "attendsEvents", "contactConsent"],
  event: ["contactName", "eventName", "email", "website", "eventLocation", "eventDate", "vendorCount", "ticketLink", "eventVendorMode", "contactConsent"],
};

export function BetaForm({ initialRole = "collector" }: { initialRole?: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const started = useRef(false);
  const presentation = roleCopy[role];

  function beginForm() {
    if (started.current) return;
    started.current = true;
    trackEvent("form_start", { role });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "loading" || status.kind === "success") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};

    for (const field of requiredByRole[role]) {
      const value = data.get(field);
      if (!value || String(value).trim() === "") nextErrors[field] = "Please complete this field.";
    }

    const email = String(data.get("email") ?? "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    for (const field of ["website", "ticketLink"]) {
      const value = String(data.get(field) ?? "").trim();
      if (value) {
        try {
          const url = new URL(value);
          if (url.protocol !== "https:") throw new Error("Invalid protocol");
        } catch {
          nextErrors[field] = "Enter a secure address beginning with https://";
        }
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ kind: "error", message: "A few details need your attention before this can be stored." });
      return;
    }

    const payload = Object.fromEntries(data.entries()) as Record<string, unknown>;
    payload.role = role;
    payload.contactConsent = data.get("contactConsent") === "on";
    payload.marketingConsent = data.get("marketingConsent") === "on";
    payload.eventVendorMode = data.get("eventVendorMode") === "yes";

    setStatus({ kind: "loading", message: "Securely storing your details…" });
    trackEvent("form_submit_attempt", { role });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; message?: string; fields?: Record<string, string>; stored?: boolean };

      if (!response.ok || !result.stored) {
        setErrors(result.fields ?? {});
        setStatus({ kind: "error", message: result.error ?? "Nothing was stored. Please try again." });
        return;
      }

      form.reset();
      setErrors({});
      setStatus({ kind: "success", message: result.message ?? "Your details have been stored for the FateDrop founding beta." });
      trackEvent("form_submit_stored", { role });
    } catch {
      setStatus({ kind: "error", message: "The storage connection did not respond. Nothing has been saved—please try again." });
    }
  }

  function chooseRole(nextRole: Role) {
    setRole(nextRole);
    setErrors({});
    setStatus({ kind: "idle", message: "" });
    started.current = false;
  }

  const fieldProps = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="join-panel fd-role-join-panel">
      <div className="role-tabs" role="group" aria-label="Choose how you want to join">
        {(Object.keys(roleCopy) as Role[]).map((item) => (
          <button className={role === item ? "active" : ""} key={item} type="button" aria-pressed={role === item} onClick={() => chooseRole(item)}>
            {roleCopy[item].tab}
          </button>
        ))}
      </div>

      <div className={`fd-join-role-visual role-${role}`}>
        <Image src={presentation.image} alt={presentation.alt} fill sizes="(max-width: 900px) 100vw, 720px" priority={role === initialRole} />
        <div className="fd-join-role-shade" aria-hidden="true" />
        <div className="fd-join-role-copy">
          <small>{presentation.visualLabel}</small>
          <strong>{presentation.lede}</strong>
        </div>
      </div>

      <div className="form-heading">
        <small>{presentation.eyebrow}</small>
        <h2>{presentation.title}</h2>
        <p>Only the details needed for this enquiry are stored. Marketing consent is separate and optional.</p>
      </div>

      <form onSubmit={handleSubmit} onFocus={beginForm} noValidate>
        <div className="spam-field" aria-hidden="true"><label htmlFor="companyFax">Company fax</label><input id="companyFax" name="companyFax" tabIndex={-1} autoComplete="off" /></div>
        <div className="form-grid">
          {role === "collector" ? (
            <>
              <Field name="contactName" label="Name" error={errors.contactName}><input id="contactName" name="contactName" autoComplete="name" {...fieldProps("contactName")} /></Field>
              <Field name="email" label="Email" error={errors.email}><input id="email" name="email" type="email" autoComplete="email" {...fieldProps("email")} /></Field>
              <Field name="region" label="Postcode or region (optional)" error={errors.region}><input id="region" name="region" autoComplete="postal-code" {...fieldProps("region")} /></Field>
              <Field name="primaryTcg" label="Primary TCG" error={errors.primaryTcg}>
                <select id="primaryTcg" name="primaryTcg" defaultValue="" {...fieldProps("primaryTcg")}><option value="" disabled>Select one</option><option>Pokémon</option><option>Magic: The Gathering — future expansion</option><option>Yu-Gi-Oh! — future expansion</option><option>One Piece — future expansion</option><option>Disney Lorcana — future expansion</option><option>Other / multiple — future expansion</option></select>
              </Field>
              <Field name="wantedFeature" label="Most wanted FateDrop feature" error={errors.wantedFeature} full>
                <select id="wantedFeature" name="wantedFeature" defaultValue="" {...fieldProps("wantedFeature")}><option value="" disabled>Select one</option><option>Stock lifecycle alerts</option><option>True Price comparison</option><option>Universal Wishlist</option><option>FateFind</option><option>Local Radar</option><option>Events and vendor search</option><option>Something else</option></select>
              </Field>
            </>
          ) : null}

          {role === "business" ? (
            <>
              <Field name="contactName" label="Contact name" error={errors.contactName}><input id="contactName" name="contactName" autoComplete="name" {...fieldProps("contactName")} /></Field>
              <Field name="businessName" label="Business name" error={errors.businessName}><input id="businessName" name="businessName" autoComplete="organization" {...fieldProps("businessName")} /></Field>
              <Field name="email" label="Business email" error={errors.email}><input id="email" name="email" type="email" autoComplete="email" {...fieldProps("email")} /></Field>
              <Field name="website" label="Website" error={errors.website}><input id="website" name="website" type="url" placeholder="https://" autoComplete="url" {...fieldProps("website")} /></Field>
              <Field name="ecommercePlatform" label="Ecommerce platform" error={errors.ecommercePlatform}><select id="ecommercePlatform" name="ecommercePlatform" defaultValue="" {...fieldProps("ecommercePlatform")}><option value="" disabled>Select one</option>{["Shopify", "WooCommerce", "CSV", "Custom website", "Marketplace", "Other", "Unsure"].map((option) => <option key={option}>{option}</option>)}</select></Field>
              <Field name="productCount" label="Approximate product count" error={errors.productCount}><input id="productCount" name="productCount" inputMode="numeric" placeholder="e.g. 2,500" {...fieldProps("productCount")} /></Field>
              <Field name="businessType" label="Retail setup" error={errors.businessType}><select id="businessType" name="businessType" defaultValue="" {...fieldProps("businessType")}><option value="" disabled>Select one</option><option>Physical shop</option><option>Online-only</option><option>Both</option></select></Field>
              <Field name="catalogueMethod" label="Catalogue method" error={errors.catalogueMethod}><select id="catalogueMethod" name="catalogueMethod" defaultValue="" {...fieldProps("catalogueMethod")}><option value="" disabled>Select one</option>{["Product feed", "API", "CSV", "Sitemap", "Manual onboarding", "Unsure"].map((option) => <option key={option}>{option}</option>)}</select></Field>
              <Field name="attendsEvents" label="Events or vendor attendance" error={errors.attendsEvents} full><select id="attendsEvents" name="attendsEvents" defaultValue="" {...fieldProps("attendsEvents")}><option value="" disabled>Select one</option><option>Yes</option><option>No</option><option>Sometimes</option></select></Field>
              <Field name="message" label="Optional message" error={errors.message} full><textarea id="message" name="message" maxLength={2000} {...fieldProps("message")} /></Field>
            </>
          ) : null}

          {role === "event" ? (
            <>
              <Field name="contactName" label="Organiser name" error={errors.contactName}><input id="contactName" name="contactName" autoComplete="name" {...fieldProps("contactName")} /></Field>
              <Field name="eventName" label="Event name" error={errors.eventName}><input id="eventName" name="eventName" {...fieldProps("eventName")} /></Field>
              <Field name="email" label="Email" error={errors.email}><input id="email" name="email" type="email" autoComplete="email" {...fieldProps("email")} /></Field>
              <Field name="website" label="Website or social link" error={errors.website}><input id="website" name="website" type="url" placeholder="https://" {...fieldProps("website")} /></Field>
              <Field name="eventLocation" label="Event location" error={errors.eventLocation}><input id="eventLocation" name="eventLocation" autoComplete="address-level2" {...fieldProps("eventLocation")} /></Field>
              <Field name="eventDate" label="Event date" error={errors.eventDate}><input id="eventDate" name="eventDate" type="date" {...fieldProps("eventDate")} /></Field>
              <Field name="vendorCount" label="Approximate vendor count" error={errors.vendorCount}><input id="vendorCount" name="vendorCount" inputMode="numeric" {...fieldProps("vendorCount")} /></Field>
              <Field name="ticketLink" label="Ticket link" error={errors.ticketLink}><input id="ticketLink" name="ticketLink" type="url" placeholder="https://" {...fieldProps("ticketLink")} /></Field>
              <Field name="eventVendorMode" label="Interested in Event Vendor Mode?" error={errors.eventVendorMode} full><select id="eventVendorMode" name="eventVendorMode" defaultValue="" {...fieldProps("eventVendorMode")}><option value="" disabled>Select one</option><option value="yes">Yes</option><option value="no">No</option></select></Field>
              <Field name="message" label="Optional message" error={errors.message} full><textarea id="message" name="message" maxLength={2000} {...fieldProps("message")} /></Field>
            </>
          ) : null}

          <label className="checkbox-field">
            <input type="checkbox" name="contactConsent" aria-invalid={Boolean(errors.contactConsent)} aria-describedby={errors.contactConsent ? "contactConsent-error" : undefined} />
            <span>I agree that FateDrop may store these details and contact me about this beta registration or enquiry.</span>
            {errors.contactConsent ? <small className="field-error" id="contactConsent-error">{errors.contactConsent}</small> : null}
          </label>
          <label className="checkbox-field optional-consent">
            <input type="checkbox" name="marketingConsent" />
            <span>Optional: send me occasional FateDrop product and launch updates. This is not required to join.</span>
          </label>
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={status.kind === "loading" || status.kind === "success"}>{status.kind === "loading" ? "Storing securely…" : presentation.button} <span>↗</span></button>
            {status.message ? <p className={`form-status ${status.kind}`} role="status" aria-live="polite">{status.message}</p> : null}
            <small>Stored in FateDrop’s private beta-lead database. Read the <Link href="/privacy">beta privacy notice</Link>.</small>
          </div>
        </div>
      </form>

      <style>{`
        .fd-role-join-panel{overflow:hidden}.fd-join-role-visual{position:relative;height:clamp(260px,32vw,430px);margin:18px 0 28px;overflow:hidden;border:1px solid rgba(220,203,211,.12);border-radius:18px;background:#090b10}.fd-join-role-visual img{object-fit:cover;object-position:center}.fd-join-role-visual.role-collector img{object-position:center 50%}.fd-join-role-visual.role-business img{object-position:center 50%}.fd-join-role-visual.role-event img{object-position:center 50%}.fd-join-role-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,11,0) 44%,rgba(5,7,11,.9) 100%)}.fd-join-role-copy{position:absolute;z-index:2;left:20px;right:20px;bottom:18px;display:grid;gap:6px}.fd-join-role-copy small{color:#d2b66f;font-size:9px;font-weight:900;letter-spacing:.15em}.fd-join-role-copy strong{max-width:680px;color:#f0e7e2;font-family:Georgia,'Times New Roman',serif;font-size:clamp(18px,2vw,27px);font-weight:500;line-height:1.12}@media(max-width:720px){.fd-join-role-visual{height:260px;margin-top:14px;border-radius:14px}.fd-join-role-copy{left:16px;right:16px;bottom:15px}}
      `}</style>
    </div>
  );
}

function Field({ name, label, error, full = false, children }: { name: string; label: string; error?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "field full" : "field"}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error ? <small className="field-error" id={`${name}-error`}>{error}</small> : null}
    </div>
  );
}
