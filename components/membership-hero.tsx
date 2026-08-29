/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const MEMBERSHIP_ART = "/assets/membership/fatedrop-balance-membership.webp";

export function MembershipHero() {
  const proof = ["One FateDrop ID", "Free discovery", "One Plus tier", "App + Web + Discord entitlement"] as const;

  return (
    <>
      <section className="fmh-shell section-shell" aria-label="One FateDrop ID across the network">
        <article className="fmh-hero">
          <img
            className="fmh-art"
            src={MEMBERSHIP_ART}
            alt="FateDrop violet and gold crystal companions balancing collector cards"
          />
          <div className="fmh-shade" aria-hidden="true" />

          <div className="fmh-copy">
            <p className="eyebrow"><span />One FateDrop ID across the network</p>
            <h1>Start free. Unlock the full signal when you need it.</h1>
            <p className="fmh-description">
              Collectors get one simple upgrade: FateDrop Plus. The same FateDrop ID carries profile, membership and eligible access across the website, app and connected Discord — no separate app tier and no duplicate subscription identity.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="#collectors">Collector membership <span>↓</span></Link>
              <Link className="button button-secondary" href="#retailers">Retailer access</Link>
            </div>
          </div>

          <div className="fmh-proof" aria-label="Page highlights">
            {proof.map((item, index) => (
              <span key={item}><small>{String(index + 1).padStart(2, "0")}</small><b>{item}</b></span>
            ))}
          </div>
        </article>
      </section>

      <style>{`
        .fmh-shell{width:min(1560px,calc(100% - 32px));margin:88px auto 0}
        .fmh-hero{position:relative;isolation:isolate;min-height:clamp(640px,49vw,800px);overflow:hidden;border:1px solid rgba(205,194,215,.13);border-radius:22px;background:#090c12;box-shadow:0 28px 90px rgba(0,0,0,.25)}
        .fmh-art{position:absolute;z-index:0;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center 26%}
        .fmh-shade{position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(5,8,14,.86) 0%,rgba(5,8,14,.68) 26%,rgba(5,8,14,.32) 48%,rgba(5,8,14,.08) 72%,rgba(5,8,14,.12) 100%),linear-gradient(180deg,rgba(5,8,14,.03) 36%,rgba(5,8,14,.76) 100%)}
        .fmh-copy{position:absolute;z-index:2;left:clamp(34px,4.4vw,76px);top:50%;width:min(48%,700px);transform:translateY(-48%);padding-bottom:72px;text-shadow:0 2px 28px rgba(0,0,0,.66)}
        .fmh-copy .eyebrow{margin:0 0 18px;color:#b39ac1;font-size:9px;font-weight:850;letter-spacing:.19em}
        .fmh-copy h1{margin:0;color:#f7efe8;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.15rem,4.6vw,5.8rem);font-weight:500;line-height:.94;letter-spacing:-.052em;text-wrap:balance}
        .fmh-description{max-width:610px;margin:25px 0 0;color:rgba(240,231,227,.84);font-size:14px;line-height:1.72}
        .fmh-copy .button-row{margin-top:28px}
        .fmh-proof{position:absolute;z-index:3;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(238,229,221,.09);background:rgba(7,10,14,.88);backdrop-filter:blur(10px)}
        .fmh-proof span{min-height:68px;padding:15px 18px;display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:center;color:#cfc2ba}.fmh-proof span+span{border-left:1px solid rgba(238,229,221,.07)}
        .fmh-proof small{color:#9d806f;font-size:6px;letter-spacing:.12em}.fmh-proof b{font-size:7px;font-weight:780;letter-spacing:.08em;text-transform:uppercase}
        @media(max-width:1080px){.fmh-copy{width:58%}}
        @media(max-width:760px){.fmh-shell{width:calc(100% - 18px);margin-top:78px}.fmh-hero{min-height:780px;border-radius:14px}.fmh-art{object-position:center 18%}.fmh-shade{background:linear-gradient(180deg,rgba(5,8,14,.03) 0%,rgba(5,8,14,.08) 40%,rgba(5,8,14,.48) 59%,rgba(5,8,14,.96) 87%,rgba(5,8,14,.98) 100%)}.fmh-copy{left:22px;right:22px;top:auto;bottom:118px;width:auto;transform:none;padding-bottom:0;text-shadow:0 3px 24px rgba(0,0,0,.8)}.fmh-copy h1{font-size:clamp(2.65rem,12vw,4.15rem)}.fmh-description{font-size:12px}.fmh-copy .button-row{display:grid;grid-template-columns:1fr;gap:10px}.fmh-copy .button{justify-content:center;text-align:center}.fmh-proof{grid-template-columns:repeat(2,1fr)}.fmh-proof span{min-height:58px;padding:12px}.fmh-proof span:nth-child(3){border-left:0}}
        @media(max-width:480px){.fmh-hero{min-height:760px}.fmh-copy{bottom:112px}.fmh-copy h1{font-size:2.7rem}.fmh-description{line-height:1.65}.fmh-proof b{font-size:6px}}
      `}</style>
    </>
  );
}
