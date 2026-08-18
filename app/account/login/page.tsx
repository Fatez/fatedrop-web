import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AccountAuthForm } from "@/components/account-auth-form";
import { FateSignalField } from "@/components/fate-signal-field";
import { SiteShell } from "@/components/page-shell";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in | FateDrop ID", description: "Sign in to your FateDrop collector identity.", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/account");
  return <SiteShell><section className="identity-gate section-shell"><FateSignalField variant="radar" className="identity-gate-field" /><div className="identity-gate-copy"><p className="eyebrow"><span />FateDrop ID</p><h1>Re-enter the network.</h1><p>Your profile, membership, Discord entitlement and future collector progression live behind one FateDrop identity.</p><div className="identity-gate-proof"><span>01 / One identity</span><span>02 / App-ready entitlement</span><span>03 / Discord-ready access</span></div></div><div className="identity-gate-panel"><small>SECURE NETWORK ENTRY</small><h2>Sign in</h2><Suspense fallback={<p>Preparing secure sign-in…</p>}><AccountAuthForm mode="login" /></Suspense></div></section></SiteShell>;
}
