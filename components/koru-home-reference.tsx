/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export function KoruReferenceLanding() {
  return (
    <>
      <section className="kr-shell section-shell" aria-label="FateDrop introduction">
        <div className="kr-landing-card">
          <article className="kr-hero">
            <img
              className="kr-hero-image"
              src="/assets/home/koru-home-hero.png?v=20260822-koru-final"
              alt="Koru overlooking the FateDrop landscape at sunset"
            />
            <div className="kr-hero-shade" aria-hidden="true" />

            <div className="kr-copy">
              <p className="kr-kicker">FATEDROP · UK TCG SIGNAL INTELLIGENCE</p>
              <h1>
                You don&apos;t chase drops.<br />
                <em>You get the signal.</em>
              </h1>
              <p className="kr-lede">
                FateDrop watches participating TCG retailers, adds price context and turns network movement into one clear signal lifecycle.
              </p>
              <div className="kr-actions">
                <Link className="button kr-primary" href="/closed-beta">
                  Closed Beta Access <span>↗</span>
                </Link>
                <Link className="button kr-secondary" href="/demo">
                  Try the Interactive Demo
                </Link>
              </div>
              <div className="kr-proof">
                <span>POKÉMON TCG FIRST</span><i />
                <span>INDEPENDENT-FIRST</span><i />
                <span>EVIDENCE-BACKED SIGNALS</span>
              </div>
            </div>

            <Link className="kr-meet" href="/dashboard/avatar" aria-label="Meet Koru, the FateDrop signal companion">
              <small>MEET THE VOICE OF FATEDROP</small>
              <span>Meet <b>Koru.</b> <i>→</i></span>
            </Link>
          </article>
        </div>
      </section>

      <style>{`
        .kr-shell{width:min(1560px,calc(100% - 32px));margin:88px auto 0}
        .kr-landing-card{border:1px solid rgba(205,194,215,.13);overflow:hidden;background:#090c12;border-radius:22px;box-shadow:0 28px 90px rgba(0,0,0,.25)}
        .kr-hero{position:relative;isolation:isolate;min-height:clamp(620px,47vw,780px);overflow:hidden;background:#0a0d14}
        .kr-hero-image{position:absolute;z-index:0;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center center}
        .kr-hero-shade{position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(5,8,14,.54) 0%,rgba(5,8,14,.36) 18%,rgba(5,8,14,.16) 34%,rgba(5,8,14,.03) 46%,transparent 58%)}
        .kr-copy{position:absolute;z-index:2;left:clamp(34px,4.4vw,76px);top:50%;width:min(43%,620px);transform:translateY(-48%);text-shadow:0 2px 28px rgba(0,0,0,.5)}
        .kr-kicker{margin:0 0 18px;color:#b39ac1;font-size:9px;font-weight:850;letter-spacing:.19em}
        .kr-copy h1{margin:0;color:#f7efe8;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.35rem,4.7vw,6rem);font-weight:500;line-height:.94;letter-spacing:-.052em;text-wrap:balance}
        .kr-copy h1 em{display:inline-block;margin-top:8px;color:#b899cf;font-style:normal}
        .kr-lede{max-width:505px;margin:25px 0 0;color:rgba(240,231,227,.82);font-size:14px;line-height:1.72}
        .kr-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
        .kr-primary{background:linear-gradient(135deg,#75558f,#604873)!important;border-color:rgba(221,196,239,.28)!important;color:#fff!important;box-shadow:0 12px 34px rgba(61,39,79,.24)!important}
        .kr-secondary{background:rgba(10,12,19,.36)!important;border-color:rgba(245,233,227,.22)!important;color:#f3eae5!important;backdrop-filter:blur(8px)}
        .kr-proof{margin-top:29px;display:flex;align-items:center;flex-wrap:wrap;gap:9px;color:rgba(229,218,216,.62);font-size:7px;font-weight:800;letter-spacing:.12em}
        .kr-proof i{width:3px;height:3px;border-radius:50%;background:#a783b6}
        .kr-meet{position:absolute;z-index:3;right:clamp(30px,3.6vw,64px);top:58px;display:grid;gap:5px;padding:10px 0;color:#eee3e1;text-decoration:none;text-align:right;text-shadow:0 2px 18px rgba(0,0,0,.72);transition:transform .2s ease}
        .kr-meet:hover{transform:translateX(-4px)}
        .kr-meet small{color:rgba(231,221,225,.63);font-size:7px;font-weight:800;letter-spacing:.15em}
        .kr-meet span{font-family:Georgia,serif;font-size:18px}
        .kr-meet b{color:#c09bce;font-weight:500}
        .kr-meet i{margin-left:5px;color:#c09bce;font-style:normal}
        @media(max-width:1080px){.kr-copy{width:51%}.kr-meet{right:24px;top:28px}}
        @media(max-width:760px){.kr-shell{width:calc(100% - 18px);margin-top:78px}.kr-landing-card{border-radius:14px}.kr-hero{min-height:700px}.kr-hero-image{object-position:66% center}.kr-hero-shade{background:linear-gradient(180deg,rgba(5,8,14,.04) 0%,rgba(5,8,14,.02) 47%,rgba(5,8,14,.34) 68%,rgba(5,8,14,.78) 100%)}.kr-copy{left:22px;right:22px;top:auto;bottom:76px;width:auto;transform:none;text-shadow:0 3px 24px rgba(0,0,0,.7)}.kr-kicker{font-size:8px}.kr-copy h1{font-size:clamp(2.65rem,12vw,4.15rem)}.kr-lede{max-width:520px;font-size:12px}.kr-proof{display:none}.kr-meet{top:18px;right:18px}.kr-meet small{display:none}.kr-meet span{font-size:15px}}
        @media(max-width:480px){.kr-hero{min-height:650px}.kr-copy{bottom:62px}.kr-copy h1{font-size:2.7rem}.kr-actions{display:grid;grid-template-columns:1fr 1fr}.kr-actions .button{padding-inline:12px;text-align:center;justify-content:center}}
      `}</style>
    </>
  );
}
