import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AccountAuthForm } from "@/components/account-auth-form";
import { FateSignalField } from "@/components/fate-signal-field";
import { SiteShell } from "@/components/page-shell";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in | FateDrop Closed Beta", description: "Sign in to your FateDrop closed-beta account.", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/account");
  const turnstileSiteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();
  return <SiteShell><section className="identity-gate section-shell"><FateSignalField variant="radar" className="identity-gate-field" /><div className="identity-gate-copy"><p className="eyebrow"><span />FATEDROP CLOSED BETA</p><h1>Sign back in.</h1><p>Use the same email address and password you used when requesting closed-beta access. Pending accounts stay locked until Owner approval; approved accounts unlock FateDrop Web and App together.</p><div className="identity-gate-proof"><span>01 / Same email</span><span>02 / Same password</span><span>03 / Web + App access</span></div></div><div className="identity-gate-panel"><small>SECURE SIGN IN</small><h2>Sign in</h2><Suspense fallback={<p>Preparing secure sign-in…</p>}><AccountAuthForm mode="login" turnstileSiteKey={turnstileSiteKey} /></Suspense><p className="identity-auth-switch"><Link href="/account/forgot-password">Forgot your password?</Link></p></div></section></SiteShell>;
}
