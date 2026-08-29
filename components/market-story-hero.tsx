/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

const FALLBACK_HERO = "/assets/fatedrop-header.png?v=20260822-static-page-hero";
const APPROVED_NON_PNG_HEROES = new Set(["/assets/membership/fatedrop-balance-membership.webp?v=20260829"]);

function reliableHeroSource(image: string) {
  if (/\.png(?:\?|$)/i.test(image)) return image;
  return APPROVED_NON_PNG_HEROES.has(image) ? image : FALLBACK_HERO;
}

export function MarketStoryHero({
  eyebrow,
  title,
  description,
  image,
  alt,
  children,
  proof,
  focal = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  children?: ReactNode;
  proof: readonly string[];
  focal?: "center" | "left" | "right";
}) {
  const heroImage = reliableHeroSource(image);

  return (
    <section className="prh-shell section-shell" aria-label={eyebrow}>
      <article className={`prh-hero prh-${focal}`}>
        <img className="prh-image" src={heroImage} alt={alt} />
        <div className="prh-shade" aria-hidden="true" />

        <div className="prh-copy">
          <p className="eyebrow"><span />{eyebrow}</p>
          <h1>{title}</h1>
          <p className="prh-description">{description}</p>
          {children}
        </div>

        <div className="prh-proof" aria-label="Page highlights">
          {proof.map((item, index) => (
            <span key={item}><small>{String(index + 1).padStart(2, "0")}</small><b>{item}</b></span>
          ))}
        </div>
      </article>

      <style>{`
        .prh-shell{width:min(1560px,calc(100% - 32px));margin:88px auto 0}
        .prh-hero{position:relative;isolation:isolate;min-height:clamp(620px,47vw,780px);overflow:hidden;border:1px solid rgba(205,194,215,.13);border-radius:22px;background:#090c12;box-shadow:0 28px 90px rgba(0,0,0,.25)}
        .prh-image{position:absolute;z-index:0;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center center}
        .prh-left .prh-image{object-position:left center}.prh-right .prh-image{object-position:right center}
        .prh-shade{position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(5,8,14,.9) 0%,rgba(5,8,14,.78) 24%,rgba(5,8,14,.5) 42%,rgba(5,8,14,.16) 64%,rgba(5,8,14,.05) 100%),linear-gradient(180deg,transparent 55%,rgba(5,8,14,.58) 100%)}
        .prh-copy{position:absolute;z-index:2;left:clamp(34px,4.4vw,76px);top:50%;width:min(48%,700px);transform:translateY(-50%);padding-bottom:72px;text-shadow:0 2px 28px rgba(0,0,0,.6)}
        .prh-copy .eyebrow{margin:0 0 18px;color:#b39ac1;font-size:9px;font-weight:850;letter-spacing:.19em}
        .prh-copy h1{margin:0;color:#f7efe8;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.15rem,4.6vw,5.8rem);font-weight:500;line-height:.94;letter-spacing:-.052em;text-wrap:balance}
        .prh-description{max-width:610px;margin:25px 0 0;color:rgba(240,231,227,.82);font-size:14px;line-height:1.72}
        .prh-copy .button-row{margin-top:28px}
        .prh-proof{position:absolute;z-index:3;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(238,229,221,.09);background:rgba(7,10,14,.88);backdrop-filter:blur(10px)}
        .prh-proof span{min-height:68px;padding:15px 18px;display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:center;color:#cfc2ba}.prh-proof span+span{border-left:1px solid rgba(238,229,221,.07)}
        .prh-proof small{color:#9d806f;font-size:6px;letter-spacing:.12em}.prh-proof b{font-size:7px;font-weight:780;letter-spacing:.08em;text-transform:uppercase}
        @media(max-width:1080px){.prh-copy{width:58%}}
        @media(max-width:760px){.prh-shell{width:calc(100% - 18px);margin-top:78px}.prh-hero{min-height:760px;border-radius:14px}.prh-image,.prh-left .prh-image,.prh-right .prh-image{object-position:62% center}.prh-shade{background:linear-gradient(180deg,rgba(5,8,14,.08) 0%,rgba(5,8,14,.12) 38%,rgba(5,8,14,.54) 62%,rgba(5,8,14,.94) 100%)}.prh-copy{left:22px;right:22px;top:auto;bottom:118px;width:auto;transform:none;padding-bottom:0;text-shadow:0 3px 24px rgba(0,0,0,.72)}.prh-copy h1{font-size:clamp(2.65rem,12vw,4.15rem)}.prh-description{font-size:12px}.prh-proof{grid-template-columns:repeat(2,1fr)}.prh-proof span{min-height:58px;padding:12px}.prh-proof span:nth-child(3){border-left:0}}
        @media(max-width:480px){.prh-hero{min-height:720px}.prh-copy{bottom:112px}.prh-copy h1{font-size:2.7rem}.prh-copy .button-row{display:flex;flex-wrap:wrap}.prh-proof b{font-size:6px}}
      `}</style>
    </section>
  );
}
