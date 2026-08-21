import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarBuilder } from "@/components/avatar-builder";
import { KoruMascot } from "@/components/koru-mascot";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { defaultAvatarRecord, getUserAvatar } from "@/lib/avatar-storage";
import { KORU_BRAND, KORU_LIFECYCLE } from "@/lib/koru-brand";

export const metadata: Metadata = { title: "Koru | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardAvatarPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/avatar");
  let record = defaultAvatarRecord(snapshot.account.id);
  let persistent = false;
  try {
    const stored = await getUserAvatar(snapshot.account.id);
    if (stored) { record = stored; persistent = true; }
  } catch {
    // Profile customisation remains usable in preview mode while storage is unavailable.
  }

  return <DashboardPageShell title="Koru" eyebrow="FATEDROP · SIGNAL COMPANION">
    <div className="koru-page">
      <section className="hero">
        <div><span>KORU · {KORU_BRAND.code}</span><h1>Meet Koru.<br/><em>FateDrop&apos;s signal voice.</em></h1><p>Koru is the fixed mascot of FateDrop — the character collectors see when the network whispers, echoes, manifests or vanishes. Koru is not tied to one TCG and is not replaced by a user-selected skin.</p></div>
        <div className="hero-tags"><span>FATEDROP MASCOT</span><span>SIGNAL VOICE</span><span>KORU &amp; FRIENDS</span><span>WEB + APP DIRECTION</span></div>
      </section>

      <section className="mascot-grid">
        <KoruMascot variant="full" reaction="watching" label={`Koru · ${KORU_BRAND.code}`}/>
        <div className="mascot-copy">
          <p className="eyebrow">ONE CHARACTER · FOUR SIGNAL STATES</p>
          <h2>Koru explains what FateDrop knows.</h2>
          <p>The mascot never changes the evidence. Koru simply gives the network a recognisable face and voice while the alert itself stays precise.</p>
          <div className="lifecycle">{KORU_LIFECYCLE.map((item) => <article key={item.state}><strong>{item.state}</strong><span>{item.copy}</span></article>)}</div>
          <div className="model-note"><b>3D STATUS</b><p>A genuine Koru 3D GLB is not connected yet. The website deliberately uses the approved Koru artwork rather than relabelling the retired Scout/Droid models. When a real Koru model is approved it can be added behind the existing renderer boundary and re-tested.</p></div>
        </div>
      </section>

      <section className="profile-separation"><div><span>YOUR ACCOUNT</span><h2>Your profile is separate from Koru.</h2><p>Collectors can still customise their own FateDrop profile. Favourite TCGs remain useful account preferences, but they no longer select or reskin FateDrop&apos;s mascot.</p></div></section>
      <AvatarBuilder initialLoadout={record.loadout} initialFavouriteTcgs={record.favouriteTcgs} persistent={persistent}/>

      <section className="usage"><article><span>01</span><strong>MARKETING</strong><p>Koru is the recurring face of FateDrop across launch creative, social posts and campaigns.</p></article><article><span>02</span><strong>ALERTS</strong><p>Whisper uses anticipation, Echo uses readiness, Manifested confirms live stock and Vanished communicates loss.</p></article><article><span>03</span><strong>KORU &amp; FRIENDS</strong><p>The wider original character universe can support branded apparel, collectibles and future storytelling without becoming TCG-specific mascots.</p></article><article><span>04</span><strong>PROFILE</strong><p>User avatar cosmetics remain personal account identity and do not alter Koru or the evidence behind FateDrop signals.</p></article></section>
    </div>
    <style>{`
      .koru-page{display:grid;gap:18px;padding-bottom:38px}.hero{position:relative;overflow:hidden;min-height:270px;padding:34px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:radial-gradient(circle at 82% 30%,rgba(104,232,251,.1),transparent 23%),radial-gradient(circle at 72% 50%,rgba(157,109,255,.14),transparent 32%),linear-gradient(145deg,#0d0b17,#08090e 68%)}.hero>div:first-child{max-width:760px}.hero span,.eyebrow,.profile-separation span{color:#75eaff;font-size:8px;font-weight:900;letter-spacing:.18em}.hero h1{margin:12px 0;font-size:clamp(2.6rem,4.4vw,4.9rem);line-height:.9;letter-spacing:-.06em}.hero h1 em{font-style:normal;background:linear-gradient(90deg,#fff,#a7efff,#c09cff);-webkit-background-clip:text;color:transparent}.hero p{max-width:700px;color:#9b95a1;font-size:13px;line-height:1.65}.hero-tags{position:absolute;left:34px;bottom:24px;display:flex;gap:7px;flex-wrap:wrap}.hero-tags span{padding:6px 8px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:#817b87!important;background:rgba(255,255,255,.025);font-size:6px!important;letter-spacing:.1em!important}.mascot-grid{display:grid;grid-template-columns:minmax(340px,.85fr) minmax(0,1.15fr);gap:18px}.mascot-copy,.profile-separation{padding:28px;border:1px solid rgba(255,255,255,.07);border-radius:24px;background:#0b0a10}.mascot-copy h2,.profile-separation h2{margin:7px 0 10px;font-size:clamp(1.8rem,3vw,3rem);letter-spacing:-.05em}.mascot-copy>p:not(.eyebrow),.profile-separation p{color:#89828f;font-size:11px;line-height:1.6}.lifecycle{display:grid;gap:8px;margin:22px 0}.lifecycle article{display:grid;grid-template-columns:110px 1fr;gap:12px;padding:12px;border:1px solid rgba(255,255,255,.06);border-radius:12px;background:rgba(255,255,255,.018)}.lifecycle strong{color:#fff;font-size:10px}.lifecycle span{color:#85808a;font-size:9px;line-height:1.5}.model-note{padding:15px;border:1px solid rgba(117,234,255,.13);border-radius:14px;background:rgba(117,234,255,.035)}.model-note b{color:#75eaff;font-size:7px;letter-spacing:.14em}.model-note p{margin:6px 0 0;color:#88818e;font-size:9px;line-height:1.55}.profile-separation{padding:24px}.usage{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:rgba(255,255,255,.07)}.usage article{padding:18px;background:#0b0a10}.usage span{color:#8e6cff;font-size:8px;font-weight:900}.usage strong{display:block;margin:5px 0;font-size:10px;letter-spacing:.08em}.usage p{margin:0;color:#77717e;font-size:9px;line-height:1.5}@media(max-width:900px){.mascot-grid{grid-template-columns:1fr}.usage{grid-template-columns:1fr 1fr}}@media(max-width:560px){.hero{padding:24px;min-height:360px}.hero-tags{left:24px}.usage{grid-template-columns:1fr}.lifecycle article{grid-template-columns:1fr}}
    `}</style>
  </DashboardPageShell>;
}
