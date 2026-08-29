import type { Metadata } from "next";
import Link from "next/link";
import { AppBetaForm } from "@/components/app-beta-form";
import { SiteShell } from "@/components/page-shell";
import styles from "./app-beta-page.module.css";

export const metadata: Metadata = {
  title: "FateDrop App Beta",
  description: "Request access to the controlled FateDrop mobile app beta.",
};

const steps = [
  "Join the beta list",
  "Create or use your FateDrop ID",
  "Receive app access when invited",
];

export default function AppBetaPage() {
  return (
    <SiteShell>
      <section className={`section-shell ${styles.section}`}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className="eyebrow"><span />FateDrop App Beta</p>
            <h1 className={styles.title}>Carry the signal with you.</h1>
            <p className={styles.intro}>
              The FateDrop mobile app is in controlled beta. Register your interest here and use the same identity — one FateDrop ID — across the Website and App. There is no public download link yet.
            </p>

            <div className={styles.steps} aria-label="App Beta access steps">
              {steps.map((step, index) => (
                <div className={styles.step} key={step}>
                  <i className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</i>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <Link className={`button button-secondary ${styles.accountButton}`} href="/account/register">Create FateDrop ID</Link>
              <Link className={styles.signIn} href="/account/login">Sign in <span>→</span></Link>
            </div>

            <p className={styles.note}>
              Beta interest and your sign-in identity are separate records. You do not need a second account if you already have a FateDrop ID.
            </p>
          </div>

          <AppBetaForm />
        </div>
      </section>
    </SiteShell>
  );
}
