import type { Metadata } from "next";
import { Suspense } from "react";
import { BetaForm } from "@/components/beta-form";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Join the FateDrop Beta",
  description: "Join FateDrop as a collector, independent TCG business or event organiser.",
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialRole = type === "business" || type === "event" ? type : "collector";
  return (
    <SiteShell>
      <section className="join-layout section-shell">
        <div className="join-intro">
          <p className="eyebrow"><span />Join the network</p>
          <h1>Choose your way in.</h1>
          <p>Collectors join free. Independent businesses and event organisers can start a genuine founding-beta conversation built around what they actually need.</p>
          <div className="join-promise"><span><i>01</i>Stored only after validation.</span><span><i>02</i>No duplicate role registration.</span><span><i>03</i>Marketing consent stays optional.</span></div>
        </div>
        <Suspense fallback={<div className="join-panel">Preparing the form…</div>}><BetaForm initialRole={initialRole} /></Suspense>
      </section>
    </SiteShell>
  );
}
