import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarBuilder } from "@/components/avatar-builder";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { defaultAvatarRecord, getUserAvatar } from "@/lib/avatar-storage";

export const metadata: Metadata = { title: "FateDrop Companion | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardAvatarPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/avatar");
  let record = defaultAvatarRecord(snapshot.account.id);
  let persistent = false;
  try {
    const stored = await getUserAvatar(snapshot.account.id);
    if (stored) { record = stored; persistent = true; }
  } catch {
    // The builder remains fully usable in preview mode while storage is staged.
  }

  return <DashboardPageShell title="FateDrop Companion" eyebrow="ACCOUNT · COMPANION FOUNDATION">
    <div className="fd-avatar-page">
      <section className="fd-avatar-hero">
        <div><span>FATEDROP // YOUR NETWORK COMPANION</span><h1>Build the collector<br/><em>that hunts with you.</em></h1><p>Your FateDrop Companion belongs to your account, not a single page. Customise the current loadout here and keep the same identity ready for alerts, FateFind and the mobile experience as those surfaces connect. The richer 3D renderer, animation system and signal droid are the next layer—not something this builder pretends is already shipped.</p></div>
        <div className="fd-avatar-hero-tags"><span>ACCOUNT LOADOUT</span><span>ORIGINAL COSMETICS</span><span>SIGNAL REACTIONS</span><span>3D READY FOUNDATION</span></div>
      </section>
      <AvatarBuilder initialLoadout={record.loadout} initialFavouriteTcgs={record.favouriteTcgs} persistent={persistent}/>
      <section className="fd-avatar-usage"><article><span>01</span><strong>DASHBOARD</strong><p>Your Companion is the personal presence in your collector command centre.</p></article><article><span>02</span><strong>ALERTS + FATEFIND</strong><p>The same Companion can react to Watching, Whisper, Manifested, Vanished and Echo states without changing the underlying evidence.</p></article><article><span>03</span><strong>3D LAYER</strong><p>The account loadout is structured so the premium 3D character and floating signal droid can replace the current illustrated renderer without rebuilding identity storage.</p></article><article><span>04</span><strong>APP</strong><p>The loadout is account data, ready for the mobile app to consume instead of creating a second Companion.</p></article></section>
    </div>
    <style>{`
      .fd-avatar-page{display:grid;gap:18px;padding-bottom:38px}.fd-avatar-hero{position:relative;overflow:hidden;min-height:270px;padding:34px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:radial-gradient(circle at 82% 30%,rgba(104,232,251,.1),transparent 23%),radial-gradient(circle at 72% 50%,rgba(157,109,255,.14),transparent 32%),linear-gradient(145deg,#0d0b17,#08090e 68%)}.fd-avatar-hero:after{content:"";position:absolute;right:4%;top:-80px;width:330px;height:330px;border:1px solid rgba(104,232,251,.08);border-radius:50%;box-shadow:0 0 0 45px rgba(157,109,255,.025),0 0 0 92px rgba(104,232,251,.018)}.fd-avatar-hero>div:first-child{position:relative;z-index:2;max-width:720px}.fd-avatar-hero>div>span{color:#75eaff;font-size:8px;font-weight:900;letter-spacing:.18em}.fd-avatar-hero h1{margin:12px 0;font-size:clamp(2.6rem,4.4vw,4.9rem);line-height:.9;letter-spacing:-.06em}.fd-avatar-hero h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#a7efff,#c09cff);-webkit-background-clip:text;color:transparent}.fd-avatar-hero p{max-width:700px;color:#9b95a1;font-size:13px;line-height:1.65}.fd-avatar-hero-tags{position:absolute;z-index:3;left:34px;bottom:24px;display:flex;gap:7px;flex-wrap:wrap}.fd-avatar-hero-tags span{padding:6px 8px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:#817b87!important;background:rgba(255,255,255,.025);font-size:6px!important;letter-spacing:.1em!important}.fd-avatar-usage{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:rgba(255,255,255,.07)}.fd-avatar-usage article{padding:18px;background:#0b0a10}.fd-avatar-usage span{color:#8e6cff;font-size:8px;font-weight:900}.fd-avatar-usage strong{display:block;margin:5px 0;font-size:10px;letter-spacing:.08em}.fd-avatar-usage p{margin:0;color:#77717e;font-size:9px;line-height:1.5}@media(max-width:850px){.fd-avatar-usage{grid-template-columns:1fr 1fr}}@media(max-width:560px){.fd-avatar-hero{padding:24px;min-height:360px}.fd-avatar-hero-tags{left:24px}.fd-avatar-usage{grid-template-columns:1fr}}
    `}</style>
  </DashboardPageShell>;
}
