import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AccountAuthForm } from "@/components/account-auth-form";
import { FateSignalField } from "@/components/fate-signal-field";
import { SiteShell } from "@/components/page-shell";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your FateDrop ID", description: "Create your collector identity and join the FateDrop network.", robots: { index: false, follow: false } };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/account");
  const turnstileSiteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();
  return <SiteShell><section className="identity-gate section-shell"><FateSignalField variant="signal" className="identity-gate-field" /><div className="identity-gate-copy"><p className="eyebrow"><span />Create your network identity</p><h1>Not just an account.<br /><em>Your FateDrop ID.</em></h1><p>Start with a profile and membership age. Later, the same identity can carry your app access, signals, badges and collector progression.</p><div className="identity-gate-proof"><span>01 / Unique FateDrop ID</span><span>02 / Member-since history</span><span>03 / Editable collector profile</span></div></div><div className="identity-gate-panel"><small>NETWORK REGISTRATION</small><h2>Create your ID</h2><Suspense fallback={<p>Preparing registration…</p>}><AccountAuthForm mode="register" turnstileSiteKey={turnstileSiteKey} /></Suspense><p className="identity-privacy-note">We only create the account after validation. Passwords are one-way hashed and never stored as readable text.</p></div></section></SiteShell>;
}
