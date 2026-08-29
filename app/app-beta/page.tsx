import type { Metadata } from "next";
import Link from "next/link";
import { AppBetaForm } from "@/components/app-beta-form";
import { SiteShell } from "@/components/page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { betaAccessIsApproved } from "@/lib/beta-access";
import { configuredTestFlightUrl } from "@/lib/testflight";
import styles from "./app-beta-page.module.css";

export const metadata: Metadata = {
  title: "FateDrop App Beta",
  description: "Request access to the controlled FateDrop mobile app beta.",
};

export const dynamic = "force-dynamic";

const steps = [
  "Create your FateDrop ID — this creates a Pending closed-beta request",
  "Wait for FateDrop approval",
  "Once approved, return here for the TestFlight handoff",
];

export default async function AppBetaPage() {
  const snapshot = await getCurrentSnapshot();
  const approved = Boolean(snapshot && betaAccessIsApproved(snapshot.betaAccess));
  const signedIn = Boolean(snapshot?.account);
  const testFlightUrl = approved ? configuredTestFlightUrl() : null;

  return (
    <SiteShell>
      <section className={`section-shell ${styles.section}`}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className="eyebrow"><span />FateDrop App Beta</p>
            <h1 className={styles.title}>Carry the signal with you.</h1>
            <p className={styles.intro}>
              FateDrop is a closed, approval-only beta. Installing the App first, receiving a TestFlight link, or having a paid membership never grants access by itself. Your FateDrop ID is the canonical access gate across Website and App.
            </p>

            <div className={styles.steps} aria-label="App Beta access steps">
              {steps.map((step, index) => (
                <div className={styles.step} key={step}>
                  <i className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</i>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {!signedIn ? (
              <>
                <div className={styles.actions}>
                  <Link className={`button button-secondary ${styles.accountButton}`} href="/account/register">Create FateDrop ID · Request Beta</Link>
                  <Link className={styles.signIn} href="/account/login?next=/app-beta">Already have an ID? Sign in <span>→</span></Link>
                </div>
                <p className={styles.note}>
                  Creating your FateDrop ID creates the actual closed-beta request in Pending status. The interest form is optional contact information; it does not grant App access.
                </p>
              </>
            ) : approved ? (
              <div className={styles.accessCard}>
                <p className={styles.statusApproved}>BETA ACCESS · APPROVED</p>
                <h2>Your FateDrop ID is cleared for the closed beta.</h2>
                {testFlightUrl ? (
                  <>
                    <p>Install the current iOS beta through TestFlight, then sign in with this same approved FateDrop ID. The App still checks approval server-side after installation.</p>
                    <a className={`button ${styles.testFlightButton}`} href={testFlightUrl} rel="noreferrer">Open in TestFlight ↗</a>
                  </>
                ) : (
                  <p className={styles.inviteUnavailable}>Your account is approved. The TestFlight invitation is not available from the website yet; no installer URL will be guessed or exposed.</p>
                )}
              </div>
            ) : (
              <div className={styles.accessCard}>
                <p className={styles.statusPending}>BETA ACCESS · {snapshot?.betaAccess.status === "revoked" ? "REVOKED" : "PENDING"}</p>
                <h2>{snapshot?.betaAccess.status === "revoked" ? "Beta access is not active." : "Your closed-beta request is awaiting approval."}</h2>
                <p>The TestFlight handoff is hidden until this FateDrop ID is explicitly approved. Possessing an installer link from elsewhere would still not unlock the App.</p>
                <Link className={styles.signIn} href="/beta-pending">View beta status <span>→</span></Link>
              </div>
            )}
          </div>

          {!signedIn ? <AppBetaForm /> : null}
        </div>
      </section>
    </SiteShell>
  );
}
