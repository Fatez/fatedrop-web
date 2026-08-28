import type { Metadata } from "next";
import Link from "next/link";
import { AppBetaForm } from "@/components/app-beta-form";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "FateDrop App Beta",
  description: "Request access to the controlled FateDrop mobile app beta.",
};

export default function AppBetaPage() {
  return (
    <SiteShell>
      <section className="section-shell" style={{ maxWidth: 1120, marginTop: 96, paddingBottom: 80 }}>
        <div style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", alignItems: "start" }}>
          <div>
            <p className="eyebrow"><span />FateDrop App Beta</p>
            <h1 style={{ maxWidth: 720 }}>Carry the signal with you.</h1>
            <p style={{ maxWidth: 680 }}>
              The FateDrop mobile app is in controlled beta. Register your interest here and use one FateDrop ID across the Website and App. There is no public download link yet.
            </p>
            <div className="join-promise" style={{ marginTop: 28 }}>
              <span><i>01</i>Join the beta list</span>
              <span><i>02</i>Create or use your FateDrop ID</span>
              <span><i>03</i>Receive app access when invited</span>
            </div>
            <div className="button-row" style={{ marginTop: 24 }}>
              <Link className="button button-secondary" href="/account/register">Create FateDrop ID</Link>
              <Link className="text-link" href="/account/login">Sign in <span>→</span></Link>
            </div>
            <p style={{ marginTop: 18, opacity: .78 }}>
              Beta interest and your sign-in identity are separate records. You do not need a second account if you already have a FateDrop ID.
            </p>
          </div>
          <AppBetaForm />
        </div>
      </section>
    </SiteShell>
  );
}
