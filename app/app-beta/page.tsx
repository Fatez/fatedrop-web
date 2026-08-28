import type { Metadata } from "next";
import { AppBetaForm } from "@/components/app-beta-form";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "FateDrop App Beta",
  description: "Register for temporary private FateDrop App beta access and receive the install invite separately.",
};

export default function AppBetaPage() {
  return (
    <SiteShell>
      <section className="app-beta-layout section-shell">
        <div className="app-beta-intro">
          <p className="eyebrow"><span />App Beta</p>
          <h1>Help test FateDrop before the public drop.</h1>
          <p className="app-beta-lede">Join the temporary private App Beta list. We’ll send your install invite separately when your place is ready, then you can sign in with your FateDrop ID inside the app.</p>
          <div className="app-beta-steps" aria-label="App beta process">
            <span><i>01</i>Join the App Beta list</span>
            <span><i>02</i>Receive your install invite</span>
            <span><i>03</i>Test FateDrop on your device</span>
          </div>
          <div className="app-beta-note">
            <strong>Separate from your FateDrop account.</strong>
            <p>This page only records App Beta interest. It does not create an account, start a subscription, or change your existing FateDrop ID.</p>
          </div>
          <p className="app-beta-motto">Search for Fate. Catch the Drop.</p>
        </div>
        <AppBetaForm />
      </section>
      <style>{`
        .app-beta-layout{position:relative;display:grid;grid-template-columns:minmax(0,.92fr) minmax(420px,1.08fr);gap:clamp(28px,5vw,72px);margin-top:96px!important;padding:clamp(28px,4vw,54px)!important;overflow:hidden;border:1px solid rgba(210,182,111,.16);border-radius:28px;background:radial-gradient(circle at 18% 14%,rgba(124,110,255,.13),transparent 30%),radial-gradient(circle at 82% 76%,rgba(210,182,111,.09),transparent 28%),linear-gradient(145deg,#10131b,#090b10)}
        .app-beta-layout:after{content:'';position:absolute;left:-110px;bottom:-190px;width:380px;height:380px;border:1px solid rgba(210,182,111,.08);border-radius:44% 56% 38% 62%;transform:rotate(32deg);pointer-events:none}.app-beta-intro,.app-beta-panel{position:relative;z-index:2}.app-beta-intro h1{max-width:650px;margin:18px 0;color:#f1eae1;font-family:Georgia,'Times New Roman',serif;font-size:clamp(42px,5.4vw,78px);font-weight:500;letter-spacing:-.055em;line-height:.94}.app-beta-lede{max-width:620px;color:#bfc3cf;font-size:17px;line-height:1.75}.app-beta-steps{display:grid;gap:10px;margin:30px 0}.app-beta-steps span{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.07);color:#e7e2dc;font-size:14px;font-weight:700}.app-beta-steps i{display:grid;place-items:center;width:32px;height:32px;border:1px solid rgba(210,182,111,.28);border-radius:50%;color:#d2b66f;font-size:10px;font-style:normal;letter-spacing:.08em}.app-beta-note{margin-top:24px;padding:18px 20px;border:1px solid rgba(124,110,255,.18);border-radius:16px;background:rgba(124,110,255,.055)}.app-beta-note strong{color:#f0e9df}.app-beta-note p{margin:7px 0 0;color:#aeb3c2;font-size:13px;line-height:1.65}.app-beta-motto{margin-top:24px;color:#d2b66f;font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.app-beta-panel{align-self:start;padding:clamp(24px,3vw,38px);border:1px solid rgba(255,255,255,.09);border-radius:22px;background:rgba(7,9,14,.82);box-shadow:0 28px 80px rgba(0,0,0,.24)}.app-beta-form-heading small{color:#d2b66f;font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.app-beta-form-heading h2{margin:8px 0;color:#f3ede5;font-size:30px;letter-spacing:-.035em}.app-beta-form-heading p{margin:0 0 22px;color:#aeb3c2;font-size:13px;line-height:1.65}.app-beta-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.app-beta-field{display:grid;gap:7px;color:#d8dbe4;font-size:12px;font-weight:750}.app-beta-field-full{grid-column:1/-1}.app-beta-field input,.app-beta-field select{width:100%;min-height:48px;padding:0 14px;border:1px solid rgba(255,255,255,.12);border-radius:12px;outline:none;background:#0c0f16;color:#f2eee8;font:inherit}.app-beta-field input:focus,.app-beta-field select:focus{border-color:rgba(210,182,111,.55);box-shadow:0 0 0 3px rgba(210,182,111,.07)}.app-beta-actions{margin-top:22px}.app-beta-panel .field-error{display:block;color:#ff9fae;font-size:11px;line-height:1.4}.app-beta-panel .spam-field{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important}.app-beta-panel .checkbox-field{margin-top:4px}.app-beta-panel .checkbox-field span{color:#b9bdc9;font-size:12px;line-height:1.55}.app-beta-panel .optional-consent span{color:#858b9b}.app-beta-panel .form-status{margin-top:14px;font-size:12px;line-height:1.55}.app-beta-panel .form-status.success{color:#cfd9b7}.app-beta-panel .form-status.error{color:#ff9fae}
        @media(max-width:920px){.app-beta-layout{grid-template-columns:1fr}.app-beta-intro h1{font-size:clamp(40px,10vw,68px)}}@media(max-width:620px){.app-beta-layout{width:calc(100% - 18px)!important;margin-top:78px!important;padding:24px 18px!important;border-radius:20px}.app-beta-form-grid{grid-template-columns:1fr}.app-beta-field-full{grid-column:auto}.app-beta-panel{padding:22px 16px}}
      `}</style>
    </SiteShell>
  );
}
