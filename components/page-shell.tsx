import type { ReactNode } from "react";
import Link from "next/link";
import { Nav } from "./nav";
import { Footer } from "./footer";
import { FateSignalField, type FateSignalVariant } from "./fate-signal-field";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  motif = "signal",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  motif?: FateSignalVariant;
}) {
  return (
    <>
      <section className={`page-hero koru-page-hero page-hero-${motif} section-shell`}>
        <div className="koru-page-hero-haze" aria-hidden="true" />
        <div className="koru-page-hero-grain" aria-hidden="true" />
        <FateSignalField variant={motif} className="page-hero-signal-field" />
        <div className="page-hero-copy koru-page-hero-copy reveal">
          <p className="eyebrow"><span />{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{description}</p>
          {children}
        </div>
        <div className="koru-page-hero-mark" aria-hidden="true"><i /><i /><i /></div>
      </section>
      <style>{`
        .koru-page-hero{position:relative;isolation:isolate;margin-top:96px;min-height:clamp(460px,37vw,620px);padding:clamp(38px,5vw,78px);display:flex;align-items:flex-end;overflow:hidden;border:1px solid rgba(210,194,211,.13);border-radius:28px;background:radial-gradient(circle at 78% 30%,rgba(120,88,139,.18),transparent 27%),radial-gradient(circle at 61% 84%,rgba(146,101,83,.09),transparent 24%),linear-gradient(145deg,#11131a 0%,#0a0c12 55%,#080a0f 100%);box-shadow:0 28px 90px rgba(0,0,0,.22)}
        .koru-page-hero-haze{position:absolute;z-index:-2;inset:0;background:linear-gradient(120deg,rgba(160,126,153,.04),transparent 36%),radial-gradient(ellipse at 82% 54%,rgba(133,107,145,.12),transparent 36%)}
        .koru-page-hero-grain{position:absolute;z-index:-1;inset:0;opacity:.18;background-image:linear-gradient(rgba(255,255,255,.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(90deg,transparent 8%,#000 60%,transparent 100%)}
        .koru-page-hero .page-hero-signal-field{position:absolute!important;z-index:-1!important;inset:auto -3% -18% auto!important;width:64%!important;height:112%!important;opacity:.17!important;filter:saturate(.42) sepia(.08)}
        .koru-page-hero-copy{position:relative;z-index:2;max-width:900px!important}.koru-page-hero-copy .eyebrow{margin-bottom:20px;color:#ad8db5}.koru-page-hero-copy h1{max-width:900px;margin:0!important;color:#f0e8e2!important;font-family:Georgia,'Times New Roman',serif!important;font-size:clamp(3.1rem,6vw,6.7rem)!important;font-weight:500!important;line-height:.93!important;letter-spacing:-.055em!important;text-wrap:balance}.koru-page-hero-copy .lede{max-width:760px!important;margin:24px 0 0!important;color:#aaa2a5!important;font-size:14px!important;line-height:1.72!important}.koru-page-hero-copy .button-row{margin-top:30px}
        .koru-page-hero-mark{position:absolute;right:clamp(28px,4vw,64px);top:clamp(26px,4vw,56px);width:108px;height:108px;opacity:.5}.koru-page-hero-mark i{position:absolute;inset:50%;width:58px;height:58px;border:1px solid rgba(183,145,193,.22);border-radius:24% 76% 44% 56%;transform:translate(-50%,-50%) rotate(45deg)}.koru-page-hero-mark i:nth-child(2){width:82px;height:82px;opacity:.55;transform:translate(-50%,-50%) rotate(28deg)}.koru-page-hero-mark i:nth-child(3){width:20px;height:20px;border-color:rgba(211,177,216,.38);background:rgba(130,92,147,.08)}
        @media(max-width:720px){.koru-page-hero{width:calc(100% - 18px);margin-top:78px;min-height:520px;padding:30px 24px;border-radius:20px}.koru-page-hero-copy h1{font-size:clamp(2.65rem,13vw,4.6rem)!important}.koru-page-hero-copy .lede{font-size:12px!important}.koru-page-hero .page-hero-signal-field{width:110%!important;right:-38%!important;opacity:.12!important}.koru-page-hero-mark{right:18px;top:18px;transform:scale(.75)}}
      `}</style>
    </>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow"><span />{eyebrow}</p>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export function FinalCta() {
  return (
    <>
      <section className="final-cta final-koru-cta section-shell">
        <div className="final-cta-inner">
          <p className="eyebrow"><span />One network, two sides of the same problem</p>
          <h2>Help collectors find better. Help independents be found.</h2>
          <p>Join the FateDrop beta as a collector, connect an independent catalogue or bring a real-world TCG event into the network.</p>
          <div className="button-row">
            <Link className="button button-primary" href="/join?type=collector">Join as a Collector <span>↗</span></Link>
            <Link className="button button-secondary" href="/join?type=business">Connect Your Catalogue</Link>
            <Link className="text-link" href="/join?type=event">List an Event <span>→</span></Link>
          </div>
        </div>
      </section>
      <style>{`
        .final-koru-cta{margin-top:96px!important}.final-koru-cta .final-cta-inner{position:relative;overflow:hidden;border-color:rgba(210,192,211,.12)!important;border-radius:26px!important;background:radial-gradient(circle at 78% 20%,rgba(125,91,144,.16),transparent 28%),linear-gradient(145deg,#111219,#090b10)!important}.final-koru-cta .final-cta-inner:after{content:'';position:absolute;right:-80px;bottom:-130px;width:320px;height:320px;border:1px solid rgba(176,139,187,.1);border-radius:44% 56% 38% 62%;transform:rotate(28deg)}.final-koru-cta h2{position:relative;z-index:2;max-width:900px!important;color:#eee5df!important;font-family:Georgia,serif!important;font-size:clamp(2.8rem,5vw,5.4rem)!important;font-weight:500!important;line-height:.95!important;letter-spacing:-.05em!important}.final-koru-cta p,.final-koru-cta .button-row{position:relative;z-index:2}@media(max-width:720px){.final-koru-cta{width:calc(100% - 24px)!important;margin-top:72px!important}.final-koru-cta .final-cta-inner{border-radius:20px!important}}
      `}</style>
    </>
  );
}
