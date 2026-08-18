"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "register" | "login";

export function AccountAuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const data = new FormData(event.currentTarget);
    const body = mode === "register"
      ? { displayName: data.get("displayName"), email: data.get("email"), password: data.get("password") }
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
      const next = search.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
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
      {error ? <p className="identity-form-status error" role="alert">{error}</p> : null}
      <button className="button button-primary" type="submit" disabled={busy}>
        {busy ? "Connecting…" : mode === "register" ? "Create my FateDrop ID" : "Enter the network"} <span>↗</span>
      </button>
      <p className="identity-auth-switch">
        {mode === "register" ? <>Already have a FateDrop ID? <Link href="/account/login">Sign in</Link>.</> : <>New to FateDrop? <Link href="/account/register">Create your ID</Link>.</>}
      </p>
    </form>
  );
}
