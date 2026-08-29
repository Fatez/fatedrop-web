"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";

export function PasswordResetForm({ token, turnstileSiteKey }: { token: string; turnstileSiteKey: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);
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

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.get("password"),
          confirmPassword: data.get("confirmPassword"),
          turnstileToken,
        }),
      });
      const result = await response.json() as { error?: string; fields?: Record<string, string> };
      if (!response.ok) {
        window.turnstile?.reset();
        setError(result.error || "Password reset could not be completed right now.");
        setFields(result.fields || {});
        return;
      }
      setComplete(true);
    } catch {
      window.turnstile?.reset();
      setError("FateDrop could not reach the account service.");
    } finally {
      setBusy(false);
    }
  }

  if (complete) {
    return <div className="identity-reset-success" role="status">
      <strong>Password updated.</strong>
      <p>All existing FateDrop sessions have been signed out. Use your new password to sign back in on Web or the App.</p>
      <Link className="button button-primary" href="/account/login">Sign in with new password <span>↗</span></Link>
      <style>{`.identity-reset-success{display:grid;gap:14px}.identity-reset-success strong{color:#e8ddd5;font-size:18px}.identity-reset-success p{margin:0;color:#938b90;font-size:12px;line-height:1.7}`}</style>
    </div>;
  }

  return <form className="identity-auth-form" onSubmit={submit} noValidate>
    <label>
      <span>New password</span>
      <input name="password" type="password" autoComplete="new-password" placeholder="10+ characters" aria-invalid={Boolean(fields.password)} />
      {fields.password ? <small className="field-error">{fields.password}</small> : null}
    </label>
    <label>
      <span>Confirm new password</span>
      <input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your password" aria-invalid={Boolean(fields.confirmPassword)} />
      {fields.confirmPassword ? <small className="field-error">{fields.confirmPassword}</small> : null}
    </label>
    <TurnstileWidget siteKey={turnstileSiteKey} action="password_reset_complete" />
    {!turnstileReady ? <p className="identity-form-status error" role="alert">Security verification is unavailable.</p> : null}
    {error ? <p className="identity-form-status error" role="alert">{error}</p> : null}
    <button className="button button-primary" type="submit" disabled={busy || !turnstileReady}>
      {busy ? "Updating password…" : "Update password"} <span>↗</span>
    </button>
  </form>;
}
