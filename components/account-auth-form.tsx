"use client";

import Link from "next/link";
import Script from "next/script";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "register" | "login";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

function safeNextPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001F\u007F]/.test(value)) return fallback;
  return value;
}

export function AccountAuthForm({ mode, turnstileSiteKey }: { mode: Mode; turnstileSiteKey: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const requestedNext = search.get("next");
  const defaultNext = mode === "register" ? "/beta-pending" : "/account";
  const safeNext = safeNextPath(requestedNext, defaultNext);
  const nextQuery = requestedNext ? `?next=${encodeURIComponent(safeNext)}` : "";
  const turnstileReady = process.env.NODE_ENV !== "production" || Boolean(turnstileSiteKey);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const data = new FormData(event.currentTarget);
    const turnstileToken = data.get("cf-turnstile-response");
    if (turnstileSiteKey && !turnstileToken) {
      setError("Complete the security check before continuing.");
      setBusy(false);
      return;
    }
    const body = mode === "register"
      ? {
          email: data.get("email"),
          password: data.get("password"),
          confirmPassword: data.get("confirmPassword"),
          acceptTerms: data.get("acceptTerms") === "on",
          turnstileToken,
        }
      : { email: data.get("email"), password: data.get("password"), turnstileToken };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as {
        error?: string;
        fields?: Record<string, string>;
        accessAllowed?: boolean;
        betaAccess?: { status?: string; approved?: boolean };
      };
      if (!response.ok) {
        window.turnstile?.reset();
        setError(result.error || "That did not work. Please try again.");
        setFields(result.fields || {});
        return;
      }
      if (mode === "register" && result.betaAccess?.status === "pending" && result.accessAllowed === false) {
        router.push("/beta-pending");
      } else {
        router.push(safeNext);
      }
      router.refresh();
    } catch {
      window.turnstile?.reset();
      setError("FateDrop could not reach the account service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="identity-auth-form" onSubmit={submit} noValidate>
      {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" /> : null}
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(fields.email)} />
        {fields.email ? <small className="field-error">{fields.email}</small> : null}
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} placeholder={mode === "register" ? "10+ characters" : "Your password"} aria-invalid={Boolean(fields.password)} />
        {fields.password ? <small className="field-error">{fields.password}</small> : null}
      </label>
      {mode === "register" ? (
        <>
          <label>
            <span>Confirm password</span>
            <input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your password" aria-invalid={Boolean(fields.confirmPassword)} />
            {fields.confirmPassword ? <small className="field-error">{fields.confirmPassword}</small> : null}
          </label>
          <label className="identity-consent-field">
            <input name="acceptTerms" type="checkbox" aria-invalid={Boolean(fields.acceptTerms)} />
            <span>I agree to the <Link href="/terms" target="_blank">Terms</Link> and have read the <Link href="/privacy" target="_blank">Privacy Notice</Link>.</span>
            {fields.acceptTerms ? <small className="field-error">{fields.acceptTerms}</small> : null}
          </label>
        </>
      ) : null}
      {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-action={mode} data-theme="dark" /> : null}
      {!turnstileReady ? <p className="identity-form-status error" role="alert">Security verification is unavailable.</p> : null}
      {error ? <p className="identity-form-status error" role="alert">{error}</p> : null}
      <button className="button button-primary" type="submit" disabled={busy || !turnstileReady}>
        {busy ? mode === "register" ? "Sending request…" : "Signing in…" : mode === "register" ? "Request closed beta access" : "Sign in"} <span>↗</span>
      </button>
      <p className="identity-auth-switch">
        {mode === "register"
          ? <>Already requested access? <Link href={`/account/login${nextQuery}`}>Sign in</Link>.</>
          : <>Need closed beta access? <Link href={`/closed-beta${nextQuery}`}>Request access</Link>.</>}
      </p>
      <style>{`
        .identity-consent-field{display:grid!important;grid-template-columns:20px 1fr!important;gap:2px 10px!important;align-items:start!important}.identity-consent-field>input{width:17px!important;height:17px!important;margin-top:2px!important}.identity-consent-field>span{font-size:11px!important;line-height:1.55!important}.identity-consent-field .field-error{grid-column:2}.identity-consent-field a{text-decoration:underline;text-underline-offset:2px}
      `}</style>
    </form>
  );
}
