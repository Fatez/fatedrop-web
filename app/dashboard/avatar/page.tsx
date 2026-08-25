import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CompanionSelector } from "@/components/companion-selector";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { defaultAvatarRecord, getUserAvatar } from "@/lib/avatar-storage";
import { ACTIVE_COMPANION_ROSTER, LEGACY_COMPANION_ARCHIVE, companionRendererMode } from "@/lib/companion-contract";
import { KORU_LIFECYCLE } from "@/lib/koru-brand";

export const metadata: Metadata = { title: "Koru & Friends | FateDrop Dashboard", robots: { index: false, follow: false } };

export default async function DashboardAvatarPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/avatar");
  let record = defaultAvatarRecord(snapshot.account.id);
  let persistent = false;
  try {
    const stored = await getUserAvatar(snapshot.account.id);
    if (stored) { record = stored; persistent = true; }
  } catch {
    // Companion selection remains previewable while account storage is unavailable.
  }

  const readyModels = ACTIVE_COMPANION_ROSTER.filter((companion) => companionRendererMode(companion) === "webgl-3d").length;

  return <DashboardPageShell title="Koru & Friends" eyebrow="FATEDROP · COMPANIONS">
    <div className="companions-page">
      <section className="companion-hero">
        <div>
          <span>KORU &amp; FRIENDS · FIVE ACTIVE COMPANIONS</span>
          <h1>Choose who walks<br/><em>the network with you.</em></h1>
          <p>Koru remains the mascot and signal voice of FateDrop. Your account can choose Koru, Fenn, Aeris, Nyxen or Solix as its personal companion. All five use the same FateDrop signal language; the character changes, the evidence does not.</p>
        </div>
        <div className="hero-facts"><span>5 ACTIVE SLOTS</span><span>{readyModels}/5 3D MODELS REGISTERED</span><span>ONE SIGNAL SYSTEM</span></div>
      </section>

      <CompanionSelector initialCompanionId={record.loadout.companion} persistent={persistent}/>

      <section className="system-grid">
        <div className="signal-system">
          <p className="eyebrow">ONE LANGUAGE · EVERY COMPANION</p>
          <h2>The character reacts. The signal meaning stays fixed.</h2>
          <p>Companions are a personality layer on top of FateDrop intelligence. They never change the evidence, confidence or lifecycle state behind an alert.</p>
          <div className="lifecycle">{KORU_LIFECYCLE.map((item) => <article key={item.state}><strong>{item.state}</strong><span>{item.copy}</span></article>)}</div>
        </div>
        <div className="model-system">
          <small>3D MODEL BOUNDARY</small>
          <h2>Five stable slots. One renderer contract.</h2>
          <p>Registered GLBs render through the current Koru &amp; Friends WebGL boundary. A character can use one approved GLB or a verified reaction-specific pack without creating new companion IDs or bringing the retired Droid/Scout system back.</p>
          <div className="model-list">{ACTIVE_COMPANION_ROSTER.map((companion) => <div key={companion.id}><span>{String(companion.slot).padStart(2,"0")}</span><b>{companion.name}</b><small>{companionRendererMode(companion) === "webgl-3d" ? "MODEL REGISTERED" : companion.isMascot ? "2D FALLBACK ACTIVE" : "AWAITING GLB"}</small></div>)}</div>
        </div>
      </section>

      <section className="legacy-note">
        <div><span>LEGACY ARCHIVE</span><h2>Old concepts stay out of the live selector.</h2><p>Kael and Nyra are retained only as legacy FateDrop character references. They do not occupy one of the five active Koru &amp; Friends companion slots and are not selectable in the current companion system.</p></div>
        <div className="legacy-list">{LEGACY_COMPANION_ARCHIVE.map((companion) => <span key={companion.id}><b>{companion.name}</b><small>{companion.code} · ARCHIVED</small></span>)}</div>
      </section>
    </div>
    <style>{`
      .companions-page{display:grid;gap:18px;padding-bottom:42px}.companion-hero{position:relative;overflow:hidden;min-height:330px;padding:38px;border:1px solid rgba(206,187,207,.13);border-radius:26px;background:radial-gradient(circle at 80% 28%,rgba(120,88,139,.18),transparent 26%),radial-gradient(circle at 68% 82%,rgba(158,102,80,.07),transparent 24%),linear-gradient(145deg,#11131a,#090b10 68%)}.companion-hero>div:first-child{max-width:820px}.companion-hero>div>span,.eyebrow,.legacy-note>div>span{color:#a989b5;font-size:7px;font-weight:900;letter-spacing:.17em}.companion-hero h1{margin:14px 0;color:#eee5df;font-family:Georgia,serif;font-size:clamp(2.8rem,5vw,5.3rem);font-weight:500;line-height:.91;letter-spacing:-.055em}.companion-hero h1 em{font-style:normal;color:#bba4be}.companion-hero p{max-width:720px;color:#989198;font-size:12px;line-height:1.7}.hero-facts{position:absolute;left:38px;bottom:26px;display:flex;gap:7px;flex-wrap:wrap}.hero-facts span{padding:7px 9px;border:1px solid rgba(255,255,255,.07);border-radius:999px;color:#77717a!important;background:rgba(255,255,255,.018);font-size:6px!important;letter-spacing:.1em!important}.system-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.signal-system,.model-system,.legacy-note{padding:30px;border:1px solid rgba(255,255,255,.07);border-radius:24px;background:#0b0d12}.signal-system h2,.model-system h2,.legacy-note h2{margin:7px 0 10px;color:#e5ddd8;font-family:Georgia,serif;font-size:clamp(1.8rem,3vw,3rem);font-weight:500;line-height:1;letter-spacing:-.045em}.signal-system>p:not(.eyebrow),.model-system>p,.legacy-note p{color:#878188;font-size:10px;line-height:1.65}.lifecycle{display:grid;gap:7px;margin-top:21px}.lifecycle article{display:grid;grid-template-columns:105px 1fr;gap:12px;padding:11px 12px;border:1px solid rgba(255,255,255,.055);border-radius:11px;background:rgba(255,255,255,.014)}.lifecycle strong{color:#d9d0cc;font-size:9px}.lifecycle span{color:#77727a;font-size:8px;line-height:1.5}.model-system>small{color:#a989b5;font-size:7px;font-weight:900;letter-spacing:.15em}.model-list{display:grid;gap:6px;margin-top:20px}.model-list div{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.055)}.model-list div>span{color:#625a65;font-family:Georgia,serif;font-size:15px}.model-list b{color:#ccc3c1;font-size:9px}.model-list small{color:#716875;font-size:6px;font-weight:900;letter-spacing:.11em}.legacy-note{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:center}.legacy-note>div:first-child{max-width:760px}.legacy-list{display:flex;gap:8px}.legacy-list>span{min-width:125px;padding:14px;border:1px solid rgba(255,255,255,.06);border-radius:13px;background:rgba(255,255,255,.012)}.legacy-list b{display:block;color:#a39ca0;font-family:Georgia,serif;font-size:17px;font-weight:500}.legacy-list small{display:block;margin-top:5px;color:#5f5961;font-size:6px;font-weight:900;letter-spacing:.1em}@media(max-width:900px){.system-grid{grid-template-columns:1fr}.legacy-note{grid-template-columns:1fr}}@media(max-width:560px){.companion-hero{min-height:410px;padding:25px}.hero-facts{left:25px;bottom:22px}.legacy-list{display:grid;grid-template-columns:1fr 1fr}.lifecycle article{grid-template-columns:1fr}}
    `}</style>
  </DashboardPageShell>;
}
