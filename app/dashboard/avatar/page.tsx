import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarBuilder } from "@/components/avatar-builder";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { defaultAvatarRecord, getUserAvatar } from "@/lib/avatar-storage";

export const metadata: Metadata = {
  title: "FateDrop Companion | FateDrop Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardAvatarPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/avatar");

  let record = defaultAvatarRecord(snapshot.account.id);
  let persistent = false;

  try {
    const stored = await getUserAvatar(snapshot.account.id);
    if (stored) {
      record = stored;
      persistent = true;
    }
  } catch {
    // Keep the Companion Lab usable in preview mode if account storage is unavailable.
  }

  return (
    <DashboardPageShell title="FateDrop Companion" eyebrow="ACCOUNT · COMPANION LAB">
      <div className="fd-companion-page">
        <section className="fd-companion-hero">
          <div className="fd-companion-hero-copy">
            <span>FATEDROP // COMPANION SYSTEM</span>
            <h1>Your signal.<br/><em>Your companion.</em></h1>
            <p>
              Choose the collector identity that represents you, preview live FateDrop signal states,
              and build the loadout that follows your FateDrop ID across the platform.
            </p>
          </div>
          <div className="fd-companion-hero-meta" aria-label="Companion system status">
            <span><b>02</b>CHARACTER IDENTITIES</span>
            <span><b>07</b>SIGNAL STATES</span>
            <span><b>01</b>LIVE 3D STAGE</span>
          </div>
        </section>

        <AvatarBuilder
          initialLoadout={record.loadout}
          initialFavouriteTcgs={record.favouriteTcgs}
          persistent={persistent}
        />

        <section className="fd-companion-roadmap" aria-label="Companion system roadmap">
          <article><span>01</span><strong>IDENTITY</strong><p>KAEL and NYRA are the two production collector identities. Only the selected humanoid is loaded.</p></article>
          <article><span>02</span><strong>FAMILIAR</strong><p>VØX remains a separate optional companion so it can be loaded, hidden and skinned independently.</p></article>
          <article><span>03</span><strong>PROPS</strong><p>Fate Shard cards remain separate from the character rig, ready for future reactions and collector gear.</p></article>
          <article><span>04</span><strong>MODULAR STYLE</strong><p>Hair, face, outfit and gear slots stay reserved for the modular customisation layer rather than being baked into every animation.</p></article>
        </section>
      </div>

      <style>{`
        .fd-companion-page{display:grid;gap:18px;padding-bottom:42px}.fd-companion-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:end;min-height:250px;padding:34px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:radial-gradient(circle at 82% 28%,rgba(103,231,255,.11),transparent 24%),radial-gradient(circle at 68% 56%,rgba(147,86,255,.16),transparent 34%),linear-gradient(145deg,#0e0c18,#07080d 70%)}.fd-companion-hero:after{content:"";position:absolute;right:-40px;top:-150px;width:420px;height:420px;border:1px solid rgba(117,234,255,.07);border-radius:50%;box-shadow:0 0 0 52px rgba(157,109,255,.022),0 0 0 104px rgba(117,234,255,.014)}.fd-companion-hero-copy{position:relative;z-index:2;max-width:760px}.fd-companion-hero-copy>span{color:#75eaff;font-size:8px;font-weight:900;letter-spacing:.18em}.fd-companion-hero h1{margin:12px 0;font-size:clamp(2.7rem,5vw,5.5rem);line-height:.88;letter-spacing:-.065em}.fd-companion-hero h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#a7efff 48%,#bc98ff);-webkit-background-clip:text;color:transparent}.fd-companion-hero p{max-width:700px;margin:0;color:#9a94a0;font-size:13px;line-height:1.68}.fd-companion-hero-meta{position:relative;z-index:2;display:grid;gap:7px;min-width:210px}.fd-companion-hero-meta span{display:flex;align-items:center;gap:10px;padding:9px 11px;border:1px solid rgba(255,255,255,.065);border-radius:12px;background:rgba(4,5,9,.36);color:#79727f;font-size:7px;font-weight:850;letter-spacing:.09em}.fd-companion-hero-meta b{color:#75eaff;font-size:9px}.fd-companion-roadmap{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:rgba(255,255,255,.07)}.fd-companion-roadmap article{padding:18px;background:#0b0a10}.fd-companion-roadmap span{color:#8e6cff;font-size:8px;font-weight:900}.fd-companion-roadmap strong{display:block;margin:6px 0;font-size:10px;letter-spacing:.08em}.fd-companion-roadmap p{margin:0;color:#77717e;font-size:9px;line-height:1.55}@media(max-width:900px){.fd-companion-hero{grid-template-columns:1fr}.fd-companion-hero-meta{grid-template-columns:repeat(3,1fr);min-width:0}.fd-companion-roadmap{grid-template-columns:1fr 1fr}}@media(max-width:580px){.fd-companion-hero{padding:24px}.fd-companion-hero-meta{grid-template-columns:1fr}.fd-companion-roadmap{grid-template-columns:1fr}}
      `}</style>
    </DashboardPageShell>
  );
}
