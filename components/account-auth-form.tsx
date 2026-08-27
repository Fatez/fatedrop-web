"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "register" | "login";

function safeNextPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001F\u007F]/.test(value)) return fallback;
  return value;
}

export function AccountAuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const requestedNext = search.get("next");
  const defaultNext = mode === "register" ? "/account?welcome=1" : "/account";
  const safeNext = safeNextPath(requestedNext, defaultNext);
  const nextQuery = requestedNext ? `?next=${encodeURIComponent(safeNext)}` : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const data = new FormData(event.currentTarget);
    const body = mode === "register"
      ? {
          displayName: data.get("displayName"),
          email: data.get("email"),
          password: data.get("password"),
          confirmPassword: data.get("confirmPassword"),
          acceptTerms: data.get("acceptTerms") === "on",
        }
      : { email: data.get("email"), password: data.get("password") };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { error?: string; fields?: Record<string, string> };
      if (!response.ok) {
        setError(result.error || "That did not work. Please try again.");
        setFields(result.fields || {});
        return;
      }
      router.push(safeNext);
      router.refresh();
    } catch {
      setError("FateDrop could not reach the account service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="identity-auth-form" onSubmit={submit} noValidate>
      {mode === "register" ? (
        <label>
          <span>Display name</span>
          <input name="displayName" autoComplete="name" placeholder="How you appear in FateDrop" aria-invalid={Boolean(fields.displayName)} />
          {fields.displayName ? <small className="field-error">{fields.displayName}</small> : null}
        </label>
      ) : null}
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
      {error ? <p className="identity-form-status error" role="alert">{error}</p> : null}
      <button className="button button-primary" type="submit" disabled={busy}>
        {busy ? "Connecting…" : mode === "register" ? "Create my FateDrop ID" : "Enter the network"} <span>↗</span>
      </button>
      <p className="identity-auth-switch">
        {mode === "register" ? <>Already have a FateDrop ID? <Link href={`/account/login${nextQuery}`}>Sign in</Link>.</> : <>New to FateDrop? <Link href={`/account/register${nextQuery}`}>Create your ID</Link>.</>}
      </p>
      <style>{`
        .identity-consent-field{display:grid!important;grid-template-columns:20px 1fr!important;gap:2px 10px!important;align-items:start!important}.identity-consent-field>input{width:17px!important;height:17px!important;margin-top:2px!important}.identity-consent-field>span{font-size:11px!important;line-height:1.55!important}.identity-consent-field .field-error{grid-column:2}.identity-consent-field a{text-decoration:underline;text-underline-offset:2px}
      `}</style>
    </form>
  );
}
