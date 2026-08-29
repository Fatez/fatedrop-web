"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";

export function PasswordResetRequestForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const turnstileReady = process.env.NODE_ENV !== "production" || Boolean(turnstileSiteKey);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const turnstileToken = data.get("cf-turnstile-response");
    if (turnstileSiteKey && !turnstileToken) {
      setError("Complete the security check before continuing.");
      setBusy(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), turnstileToken }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) {
        window.turnstile?.reset();
        setError(result.error || "Password reset could not be requested right now.");
        return;
      }
      setSent(true);
    } catch {
      window.turnstile?.reset();
      setError("FateDrop could not reach the account service.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return <div className="identity-reset-success" role="status">
      <strong>Check your email.</strong>
      <p>If a FateDrop ID exists for that address, we&apos;ve sent a reset link. It expires in 30 minutes and works once.</p>
      <Link className="button button-secondary" href="/account/login">Back to sign in</Link>
      <style>{`.identity-reset-success{display:grid;gap:14px}.identity-reset-success strong{color:#e8ddd5;font-size:18px}.identity-reset-success p{margin:0;color:#938b90;font-size:12px;line-height:1.7}`}</style>
    </div>;
  }

  return <form className="identity-auth-form" onSubmit={submit} noValidate>
    <label>
      <span>Email</span>
      <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
    </label>
    <TurnstileWidget siteKey={turnstileSiteKey} action="password_reset_request" />
    {!turnstileReady ? <p className="identity-form-status error" role="alert">Security verification is unavailable.</p> : null}
    {error ? <p className="identity-form-status error" role="alert">{error}</p> : null}
    <button className="button button-primary" type="submit" disabled={busy || !turnstileReady}>
      {busy ? "Sending reset link…" : "Send reset link"} <span>↗</span>
    </button>
    <p className="identity-auth-switch">Remembered it? <Link href="/account/login">Sign in</Link>.</p>
  </form>;
}
