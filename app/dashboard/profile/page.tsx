/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { AvatarPreview } from "@/components/avatar-preview";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { defaultAvatarRecord, getUserAvatar } from "@/lib/avatar-storage";
import { formatMemberSince, membershipLabel, networkAge } from "@/lib/membership";

export const metadata: Metadata = { title: "My FateDrop ID | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardProfilePage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return <DashboardPageShell title="My FateDrop ID"><div /></DashboardPageShell>;
  let avatar = defaultAvatarRecord(snapshot.account.id);
  try { avatar = await getUserAvatar(snapshot.account.id) ?? avatar; } catch { /* preview remains available */ }
  return (
    <DashboardPageShell title="My FateDrop ID" eyebrow="COLLECTOR IDENTITY">
      <div className="fd-dashboard-grid">
        <section className="fd-dash-card fd-profile-card">
          <div className="fd-profile-card-top"><small>{snapshot.account.fateId}</small><span>{membershipLabel(snapshot.membership)}</span></div>
          <div className="fd-profile-identity"><div className="fd-profile-orbit">{snapshot.account.avatarUrl ? <span style={{ backgroundImage: `url("${snapshot.account.avatarUrl}")` }} /> : <img src="/assets/fatedrop-logo-mark.png" alt="" />}</div><div><h2>{snapshot.account.displayName}</h2><p>@{snapshot.account.username}</p><small>{snapshot.account.primaryTcg || "Pokémon TCG"}</small></div></div>
          <div className="fd-profile-dates"><div><span>MEMBER SINCE</span><strong>{formatMemberSince(snapshot.account.createdAt)}</strong></div><div><span>NETWORK AGE</span><strong>{networkAge(snapshot.account.createdAt)}</strong></div></div>
          <Link className="fd-dashboard-wide-button" href="/account">Edit FateDrop ID →</Link>
        </section>
        <section className="fd-dash-card"><div className="fd-dash-card-head"><span>ACCOUNT HUB</span><small>Identity persists across FateDrop</small></div><div className="fd-network-message"><h1>One account for the whole network.</h1><p>Your profile and membership attach to this FateDrop ID. Discord and app access should consume the same entitlement only as those integrations are individually verified.</p></div><div className="fd-billing-facts"><span><small>DISCORD</small><b>{snapshot.discord ? "Linked" : "Not linked"}</b></span><span><small>MEMBERSHIP</small><b>{membershipLabel(snapshot.membership)}</b></span></div></section>
        <section className="fd-dash-card fd-profile-avatar-card"><div className="fd-dash-card-head"><span>YOUR FATEDROP COMPANION</span><small>Dashboard · FateFind · future app renderer</small></div><div className="fd-profile-avatar-layout"><AvatarPreview loadout={avatar.loadout} mood="watching" compact label={`${snapshot.account.displayName}'s companion`}/><div><h2>Your network Companion.</h2><p>Customise the account-level FateDrop Companion loadout, gear, aura and signal familiar. The current illustrated rig is the persistent identity foundation for the richer 3D renderer and mobile continuity as those layers integrate.</p><Link className="fd-dashboard-wide-button" href="/dashboard/avatar">Customise Companion →</Link></div></div></section>
      </div>
      <style>{`.fd-profile-avatar-card{padding:24px}.fd-profile-avatar-layout{display:grid;grid-template-columns:260px 1fr;gap:22px;align-items:center;margin-top:18px}.fd-profile-avatar-layout h2{margin:0 0 7px;font-size:24px;letter-spacing:-.04em}.fd-profile-avatar-layout p{max-width:650px;color:#8f8996;font-size:12px;line-height:1.6}.fd-profile-avatar-layout .fd-dashboard-wide-button{display:inline-flex;width:auto;padding:0 15px;margin-top:8px}@media(max-width:760px){.fd-profile-avatar-layout{grid-template-columns:1fr}}`}</style>
    </DashboardPageShell>
  );
}
