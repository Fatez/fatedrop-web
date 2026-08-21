/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { KORU_LIFECYCLE } from "@/lib/koru-brand";

const retailers = [
  "Pokémon Center UK",
  "Titan Cards",
  "Total Cards",
  "Zatu Games",
  "Eterna Collectibles",
  "Gathering Games",
  "Caro Collective",
  "Jet Cards",
] as const;

export function KoruReferenceLanding() {
  return (
    <>
      <section className="kr-shell section-shell" aria-label="FateDrop introduction">
        <div className="kr-landing-card">
          <article className="kr-hero">
            <img
              className="kr-hero-image"
              src="/assets/home/koru-home-hero.avif?v=20260821-koru-clean"
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
                <Link className="button kr-primary" href="/join?type=collector">
                  Start Your Free Trial <span>↗</span>
                </Link>
                <Link className="button kr-secondary" href="/collectors">
                  See How It Works
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

        <section className="kr-lifecycle" aria-labelledby="kr-lifecycle-title">
          <div className="kr-lifecycle-title">
            <div>
              <small>THE NETWORK LANGUAGE</small>
              <span id="kr-lifecycle-title">The FateDrop Signal Lifecycle</span>
            </div>
            <p>Four states. One meaning everywhere.</p>
          </div>
          <div className="kr-life-grid">
            {KORU_LIFECYCLE.map((item, index) => (
              <article key={item.state} data-stage={item.state.toLowerCase()}>
                <span className="kr-life-number">0{index + 1}</span>
                <div className="kr-life-icon">◇</div>
                <div>
                  <strong>{item.state.toUpperCase()}</strong>
                  <p>{item.copy}</p>
                </div>
                {index < KORU_LIFECYCLE.length - 1 ? <i className="kr-life-arrow" aria-hidden="true">→</i> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="kr-retailers" aria-label="Participating retailer sources">
          <div className="kr-retailer-title">
            <span>MONITORING PARTICIPATING RETAILER SOURCES</span>
            <small>Coverage grows as sources are validated.</small>
          </div>
          <div className="kr-retailer-row">
            {retailers.map((name) => <b key={name}>{name}</b>)}
          </div>
          <Link href="/businesses">View Retailers <span>→</span></Link>
        </section>
      </section>

      <style>{`
        .kr-shell{width:min(1560px,calc(100% - 32px));margin:88px auto 0}
        .kr-landing-card,.kr-lifecycle,.kr-retailers{border:1px solid rgba(205,194,215,.13);overflow:hidden;background:#090c12}
        .kr-landing-card{border-radius:22px;box-shadow:0 28px 90px rgba(0,0,0,.25)}

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

        .kr-lifecycle{margin-top:14px;border-radius:18px;background:linear-gradient(180deg,#0d1119,#090d13);box-shadow:0 20px 60px rgba(0,0,0,.18)}
        .kr-lifecycle-title{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;padding:22px 30px 17px;border-bottom:1px solid rgba(255,255,255,.06)}
        .kr-lifecycle-title>div{display:grid;gap:4px}
        .kr-lifecycle-title small{color:#8f738e;font-size:7px;font-weight:850;letter-spacing:.16em}
        .kr-lifecycle-title span{color:#e8ded7;font-family:Georgia,serif;font-size:20px}
        .kr-lifecycle-title>p{margin:0;color:#77727a;font-size:8px;letter-spacing:.1em}
        .kr-life-grid{display:grid;grid-template-columns:repeat(4,1fr);max-width:1320px;margin:0 auto;padding:13px 12px 16px}
        .kr-life-grid article{position:relative;display:grid;grid-template-columns:24px 40px 1fr;gap:11px;align-items:start;padding:14px 32px 12px 16px;min-width:0}
        .kr-life-number{padding-top:9px;color:#4e4a53;font-size:7px;font-weight:800;letter-spacing:.08em}
        .kr-life-icon{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(161,129,177,.38);border-radius:10px;color:#aa83b8;background:rgba(104,72,119,.08);font-size:19px;transform:rotate(45deg)}
        .kr-life-grid strong{display:block;padding-top:3px;color:#e5dcd7;font-size:9px;letter-spacing:.08em}
        .kr-life-grid p{margin:5px 0 0;color:#938c92;font-size:8px;line-height:1.56}
        .kr-life-arrow{position:absolute;right:10px;top:28px;color:#5e4b66;font-style:normal}
        .kr-life-grid [data-stage='echo'] .kr-life-icon{color:#80a6bf;border-color:rgba(116,158,186,.36)}
        .kr-life-grid [data-stage='manifested'] .kr-life-icon{color:#91aa81;border-color:rgba(133,166,119,.36)}
        .kr-life-grid [data-stage='vanished'] .kr-life-icon{color:#c0ac8d;border-color:rgba(184,163,132,.34)}

        .kr-retailers{margin-top:10px;display:grid;grid-template-columns:minmax(190px,.65fr) minmax(0,2.4fr) auto;gap:24px;align-items:center;padding:18px 30px;border-radius:14px;background:#090c12}
        .kr-retailer-title{display:grid;gap:4px}
        .kr-retailer-title span{color:#999099;font-size:7px;font-weight:800;letter-spacing:.13em}
        .kr-retailer-title small{color:#5f5b62;font-size:7px}
        .kr-retailer-row{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px 26px}
        .kr-retailer-row b{color:#c8bfbb;font-size:9px;font-weight:680;letter-spacing:.015em;white-space:nowrap}
        .kr-retailers>a{color:#aa87b6;font-size:8px;font-weight:800;letter-spacing:.08em;text-decoration:none;white-space:nowrap}

        @media(max-width:1080px){
          .kr-copy{width:51%}
          .kr-meet{right:24px;top:28px}
          .kr-retailers{grid-template-columns:1fr}
          .kr-retailer-title{text-align:center}
          .kr-retailer-row{gap:12px 20px}
          .kr-retailers>a{justify-self:center}
          .kr-life-grid article{grid-template-columns:20px 36px 1fr;padding-right:24px}
        }

        @media(max-width:760px){
          .kr-shell{width:calc(100% - 18px);margin-top:78px}
          .kr-landing-card,.kr-lifecycle,.kr-retailers{border-radius:14px}
          .kr-hero{min-height:700px}
          .kr-hero-image{object-position:66% center}
          .kr-hero-shade{background:linear-gradient(180deg,rgba(5,8,14,.04) 0%,rgba(5,8,14,.02) 47%,rgba(5,8,14,.34) 68%,rgba(5,8,14,.78) 100%)}
          .kr-copy{left:22px;right:22px;top:auto;bottom:76px;width:auto;transform:none;text-shadow:0 3px 24px rgba(0,0,0,.7)}
          .kr-kicker{font-size:8px}
          .kr-copy h1{font-size:clamp(2.65rem,12vw,4.15rem)}
          .kr-lede{max-width:520px;font-size:12px}
          .kr-proof{display:none}
          .kr-meet{top:18px;right:18px}
          .kr-meet small{display:none}
          .kr-meet span{font-size:15px}
          .kr-lifecycle-title{align-items:flex-start;flex-direction:column;gap:5px;padding:19px 18px 14px}
          .kr-lifecycle-title>p{font-size:7px}
          .kr-life-grid{grid-template-columns:1fr 1fr;padding:8px}
          .kr-life-grid article{grid-template-columns:18px 36px 1fr;padding:12px 14px 12px 6px}
          .kr-life-grid article:nth-child(2) .kr-life-arrow{display:none}
          .kr-retailers{padding:17px}
          .kr-retailer-row{gap:10px 15px}
          .kr-retailer-row b{font-size:8px}
        }

        @media(max-width:480px){
          .kr-hero{min-height:650px}
          .kr-copy{bottom:62px}
          .kr-copy h1{font-size:2.7rem}
          .kr-actions{display:grid;grid-template-columns:1fr 1fr}
          .kr-actions .button{padding-inline:12px;text-align:center;justify-content:center}
          .kr-life-grid{grid-template-columns:1fr}
          .kr-life-grid article{padding:11px 8px}
          .kr-life-arrow{display:none}
          .kr-retailer-row{display:grid;grid-template-columns:1fr 1fr;text-align:center}
        }
      `}</style>
    </>
  );
}
