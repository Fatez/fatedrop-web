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
              The FateDrop mobile app is in controlled beta. Register your interest here and we’ll use your existing FateDrop beta record for mobile access. There is no public download link yet.
            </p>
            <div className="join-promise" style={{ marginTop: 28 }}>
              <span><i>01</i>Join the beta list</span>
              <span><i>02</i>Use one FateDrop ID</span>
              <span><i>03</i>Receive app access when invited</span>
            </div>
            <p style={{ marginTop: 24, opacity: .78 }}>
              Already have a FateDrop ID? You do not need a second account. Your Website and App sign-in use the same identity.
            </p>
            <p style={{ marginTop: 12 }}><Link href="/account/login">Already invited? Sign in to your FateDrop ID →</Link></p>
          </div>
          <AppBetaForm />
        </div>
      </section>
    </SiteShell>
  );
}
