import type { ReactNode } from "react";

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
  return (
    <section className={`market-story-hero market-story-${focal}`} aria-labelledby="market-story-title">
      <div className="market-story-visual" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="market-story-image" src={image} alt="" width="1920" height="1080" loading="eager" />
        <div className="market-story-visual-shade" />
        <div className="market-story-signal-field"><i /><i /><i /><i /></div>
      </div>

      <div className="market-story-copy">
        <p className="eyebrow"><span />{eyebrow}</p>
        <h1 id="market-story-title">{title}</h1>
        <p className="market-story-description">{description}</p>
        {children}
      </div>

      <div className="market-story-signal-mark" aria-hidden="true"><i /><i /><i /></div>
      <span className="market-story-caption" aria-hidden="true">FATEDROP · TRUST THE SIGNAL</span>

      <div className="market-story-proof" aria-label="Page highlights">
        {proof.map((item, index) => <span key={item}><small>{String(index + 1).padStart(2, "0")}</small><b>{item}</b></span>)}
      </div>

      <span className="sr-only">{alt}</span>

      <style>{`
        .market-story-hero{position:relative;isolation:isolate;width:min(1560px,calc(100% - 32px));min-height:clamp(610px,45vw,760px);margin:88px auto 0;overflow:hidden;border:1px solid rgba(221,203,188,.13);border-radius:26px;background:#080b0f;box-shadow:0 30px 95px rgba(0,0,0,.27)}
        .market-story-visual{position:absolute;z-index:0;inset:0;overflow:hidden;background:radial-gradient(circle at 76% 28%,rgba(113,72,139,.16),transparent 34%),#080b0f}.market-story-image{position:absolute;inset:-3%;width:106%;height:106%;display:block;object-fit:cover;object-position:center center;filter:saturate(.78) contrast(1.08) brightness(.55);transform:scale(1.025)}.market-story-left .market-story-image{object-position:left center}.market-story-right .market-story-image{object-position:right center}.market-story-visual-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,10,15,.98) 0%,rgba(8,11,16,.94) 31%,rgba(8,11,16,.72) 48%,rgba(8,11,16,.28) 69%,rgba(8,11,16,.12) 100%),linear-gradient(180deg,rgba(6,8,11,.02) 46%,rgba(6,8,11,.72) 100%)}
        .market-story-signal-field{position:absolute;right:6%;top:9%;width:42%;height:70%;opacity:.28;pointer-events:none;background:radial-gradient(circle at 50% 50%,rgba(142,90,179,.16),transparent 44%)}.market-story-signal-field i{position:absolute;left:50%;top:50%;width:58%;aspect-ratio:1;border:1px solid rgba(192,150,212,.18);border-radius:50%;transform:translate(-50%,-50%)}.market-story-signal-field i:nth-child(2){width:78%;opacity:.62}.market-story-signal-field i:nth-child(3){width:98%;opacity:.34}.market-story-signal-field i:nth-child(4){width:118%;opacity:.18}
        .market-story-copy{position:relative;z-index:2;width:min(51%,760px);min-height:clamp(530px,39vw,670px);padding:clamp(48px,5vw,82px) clamp(38px,4.5vw,72px) 112px;display:flex;flex-direction:column;justify-content:center;text-shadow:0 3px 34px rgba(0,0,0,.68)}.market-story-copy .eyebrow{margin:0 0 15px;color:#b89ab4}.market-story-copy h1{max-width:720px;margin:0;color:#f5ece5;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,4.7vw,5.65rem);font-weight:500;line-height:.93;letter-spacing:-.055em;text-wrap:balance}.market-story-description{max-width:650px;margin:21px 0 0;color:rgba(240,231,224,.78);font-size:13px;line-height:1.72}.market-story-copy .button-row{margin-top:25px}
        .market-story-signal-mark{position:absolute;z-index:3;right:31px;top:31px;width:78px;height:78px;opacity:.44}.market-story-signal-mark i{position:absolute;inset:50%;width:42px;height:42px;border:1px solid rgba(216,185,158,.3);border-radius:24% 76% 44% 56%;transform:translate(-50%,-50%) rotate(45deg)}.market-story-signal-mark i:nth-child(2){width:62px;height:62px;opacity:.55;transform:translate(-50%,-50%) rotate(28deg)}.market-story-signal-mark i:nth-child(3){width:14px;height:14px;border-color:rgba(227,195,166,.55);background:rgba(176,129,94,.06)}.market-story-caption{position:absolute;z-index:3;right:27px;bottom:86px;color:rgba(206,174,146,.68);font-size:6px;font-weight:900;letter-spacing:.2em}
        .market-story-proof{position:absolute;z-index:4;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(238,229,221,.09);background:rgba(7,10,14,.9);backdrop-filter:blur(10px)}.market-story-proof span{min-height:68px;padding:15px 18px;display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:center;color:#cfc2ba}.market-story-proof span+span{border-left:1px solid rgba(238,229,221,.07)}.market-story-proof small{color:#9d806f;font-size:6px;letter-spacing:.12em}.market-story-proof b{font-size:7px;font-weight:780;letter-spacing:.08em;text-transform:uppercase}
        @media(max-width:1050px){.market-story-copy{width:62%;padding-inline:34px}.market-story-copy h1{font-size:clamp(2.8rem,5.8vw,4.9rem)}.market-story-visual-shade{background:linear-gradient(90deg,rgba(7,10,15,.97) 0%,rgba(8,11,16,.86) 43%,rgba(8,11,16,.34) 72%,rgba(8,11,16,.18) 100%),linear-gradient(180deg,transparent 42%,rgba(6,8,11,.72) 100%)}}
        @media(max-width:760px){.market-story-hero{width:calc(100% - 18px);min-height:720px;margin-top:78px;border-radius:19px}.market-story-image,.market-story-left .market-story-image,.market-story-right .market-story-image{object-position:62% center}.market-story-visual-shade{background:linear-gradient(180deg,rgba(6,9,14,.12) 0%,rgba(6,9,14,.28) 35%,rgba(6,9,14,.78) 60%,rgba(6,9,14,.98) 100%)}.market-story-copy{position:absolute;left:0;right:0;bottom:112px;width:auto;min-height:0;padding:30px 22px 22px;justify-content:flex-end}.market-story-copy h1{font-size:clamp(2.65rem,11vw,4.15rem)}.market-story-description{font-size:11px}.market-story-proof{grid-template-columns:repeat(2,1fr)}.market-story-proof span{min-height:54px;padding:10px 12px}.market-story-proof span:nth-child(3){border-left:0}.market-story-caption{display:none}.market-story-signal-mark{right:16px;top:16px;transform:scale(.8)}.market-story-signal-field{right:-4%;top:3%;width:76%;height:50%}}
        @media(max-width:480px){.market-story-hero{min-height:690px}.market-story-copy{bottom:108px}.market-story-copy .button-row{display:flex;flex-wrap:wrap}.market-story-proof b{font-size:6px}}
      `}</style>
    </section>
  );
}
