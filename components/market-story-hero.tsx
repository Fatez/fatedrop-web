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
      <div className="market-story-copy">
        <p className="eyebrow"><span />{eyebrow}</p>
        <h1 id="market-story-title">{title}</h1>
        <p className="market-story-description">{description}</p>
        {children}
      </div>

      <div className="market-story-visual">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="market-story-image" src={image} alt={alt} width="1920" height="1080" loading="eager" />
        <div className="market-story-visual-shade" aria-hidden="true" />
        <div className="market-story-signal-mark" aria-hidden="true"><i /><i /><i /></div>
        <span className="market-story-caption">FATEDROP · TRUST THE SIGNAL</span>
      </div>

      <div className="market-story-proof" aria-label="Page highlights">
        {proof.map((item, index) => <span key={item}><small>{String(index + 1).padStart(2, "0")}</small><b>{item}</b></span>)}
      </div>

      <style>{`
        .market-story-hero{position:relative;width:min(1560px,calc(100% - 32px));min-height:560px;margin:88px auto 0;display:grid;grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);grid-template-rows:minmax(0,1fr) auto;overflow:hidden;border:1px solid rgba(221,203,188,.13);border-radius:26px;background:linear-gradient(145deg,#101318,#080b0f 72%);box-shadow:0 30px 95px rgba(0,0,0,.27)}
        .market-story-copy{position:relative;z-index:2;padding:clamp(42px,5vw,78px) clamp(34px,4.5vw,70px) 44px;display:flex;flex-direction:column;justify-content:center;min-width:0;background:radial-gradient(circle at 85% 25%,rgba(129,83,150,.09),transparent 34%),linear-gradient(145deg,rgba(15,18,23,.98),rgba(9,12,16,.96))}
        .market-story-copy:after{content:'';position:absolute;right:-1px;top:11%;bottom:11%;width:1px;background:linear-gradient(180deg,transparent,rgba(221,203,188,.12),transparent)}
        .market-story-copy .eyebrow{margin:0 0 15px;color:#ae8cae}.market-story-copy h1{max-width:720px;margin:0;color:#f1e8e0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,4.5vw,5.35rem);font-weight:500;line-height:.93;letter-spacing:-.055em;text-wrap:balance}.market-story-description{max-width:650px;margin:19px 0 0;color:rgba(235,225,218,.76);font-size:13px;line-height:1.7}.market-story-copy .button-row{margin-top:24px}
        .market-story-visual{position:relative;min-height:470px;overflow:hidden;background:#090c10}.market-story-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.84) contrast(1.025) brightness(.88);transform:scale(1.005)}.market-story-left .market-story-image{object-position:left center}.market-story-right .market-story-image{object-position:right center}.market-story-visual-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,11,15,.27),transparent 28%),linear-gradient(180deg,rgba(6,8,11,.03) 55%,rgba(6,8,11,.56) 100%)}
        .market-story-signal-mark{position:absolute;right:28px;top:28px;width:78px;height:78px;opacity:.48}.market-story-signal-mark i{position:absolute;inset:50%;width:42px;height:42px;border:1px solid rgba(216,185,158,.3);border-radius:24% 76% 44% 56%;transform:translate(-50%,-50%) rotate(45deg)}.market-story-signal-mark i:nth-child(2){width:62px;height:62px;opacity:.55;transform:translate(-50%,-50%) rotate(28deg)}.market-story-signal-mark i:nth-child(3){width:14px;height:14px;border-color:rgba(227,195,166,.55);background:rgba(176,129,94,.06)}.market-story-caption{position:absolute;right:24px;bottom:18px;color:rgba(206,174,146,.7);font-size:6px;font-weight:900;letter-spacing:.2em}
        .market-story-proof{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(238,229,221,.09);background:#0a0d11}.market-story-proof span{min-height:68px;padding:15px 18px;display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:center;color:#cfc2ba}.market-story-proof span+span{border-left:1px solid rgba(238,229,221,.07)}.market-story-proof small{color:#9d806f;font-size:6px;letter-spacing:.12em}.market-story-proof b{font-size:7px;font-weight:780;letter-spacing:.08em;text-transform:uppercase}
        @media(max-width:1050px){.market-story-hero{grid-template-columns:1fr 1fr;min-height:540px}.market-story-copy{padding-inline:34px}.market-story-copy h1{font-size:clamp(2.8rem,5.4vw,4.7rem)}}
        @media(max-width:760px){.market-story-hero{width:calc(100% - 18px);min-height:0;margin-top:78px;display:flex;flex-direction:column;border-radius:19px}.market-story-visual{order:1;min-height:300px}.market-story-copy{order:2;padding:30px 22px 28px}.market-story-copy:after{display:none}.market-story-copy h1{font-size:clamp(2.65rem,11vw,4.1rem)}.market-story-description{font-size:11px}.market-story-proof{order:3;grid-template-columns:repeat(2,1fr)}.market-story-proof span{min-height:58px;padding:12px}.market-story-proof span:nth-child(3){border-left:0}.market-story-image,.market-story-left .market-story-image,.market-story-right .market-story-image{object-position:center}.market-story-caption{right:14px;bottom:12px}.market-story-signal-mark{right:16px;top:16px;transform:scale(.8)}}
      `}</style>
    </section>
  );
}
