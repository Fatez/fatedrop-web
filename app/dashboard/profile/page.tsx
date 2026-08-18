/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { formatMemberSince, membershipLabel, networkAge } from "@/lib/membership";

export const metadata: Metadata = { title: "My FateDrop ID | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardProfilePage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return <DashboardPageShell title="My FateDrop ID"><div /></DashboardPageShell>;
  return (
    <DashboardPageShell title="My FateDrop ID" eyebrow="COLLECTOR IDENTITY">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-profile-card">
          <div className="fd-profile-card-top"><small>{snapshot.account.fateId}</small><span>{membershipLabel(snapshot.membership)}</span></div>
          <div className="fd-profile-identity"><div className="fd-profile-orbit">{snapshot.account.avatarUrl ? <span style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <img src="/assets/fatedrop-logo-mark.png" alt="" />}</div><div><h2>{snapshot.account.displayName}</h2><p>@{snapshot.account.username}</p><small>{snapshot.account.primaryTcg || "Pokémon TCG"}</small></div></div>
          <div className="fd-profile-dates"><div><span>MEMBER SINCE</span><strong>{formatMemberSince(snapshot.account.createdAt)}</strong></div><div><span>NETWORK AGE</span><strong>{networkAge(snapshot.account.createdAt)}</strong></div></div>
          <Link className="fd-dashboard-wide-button" href="/account">Edit FateDrop ID →</Link>
        </section>
        <section className="fd-dash-card"><div className="fd-dash-card-head"><span>ACCOUNT HUB</span><small>Identity persists across FateDrop</small></div><div className="fd-network-message"><h1>One account for the whole network.</h1><p>Your profile, membership, Discord entitlement and future app access all attach to this FateDrop ID.</p></div><div className="fd-billing-facts"><span><small>DISCORD</small><b>{snapshot.discord ? "Linked" : "Not linked"}</b></span><span><small>MEMBERSHIP</small><b>{membershipLabel(snapshot.membership)}</b></span></div></section>
      </div>
    </DashboardPageShell>
  );
}
