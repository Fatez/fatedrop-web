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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="market-story-image" src={image} alt={alt} width="1920" height="820" loading="eager" />
      <div className="market-story-shade" aria-hidden="true" />
      <div className="market-story-copy">
        <p className="eyebrow"><span />{eyebrow}</p>
        <h1 id="market-story-title">{title}</h1>
        <p>{description}</p>
        {children}
      </div>
      <div className="market-story-proof" aria-label="Page highlights">
        {proof.map((item, index) => <span key={item}><small>{String(index + 1).padStart(2, "0")}</small>{item}</span>)}
      </div>
      <style>{`
        .market-story-hero{position:relative;width:min(1560px,calc(100% - 32px));height:clamp(470px,38vw,590px);margin:88px auto 0;overflow:hidden;border:1px solid rgba(221,203,188,.13);border-radius:26px;background:#090b0d;box-shadow:0 30px 95px rgba(0,0,0,.27)}
        .market-story-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.88) contrast(1.01) brightness(.9)}
        .market-story-left .market-story-image{object-position:left center}.market-story-right .market-story-image{object-position:right center}
        .market-story-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,9,.92) 0%,rgba(5,7,9,.76) 27%,rgba(5,7,9,.32) 49%,rgba(5,7,9,.04) 73%,rgba(5,7,9,.10) 100%),linear-gradient(180deg,rgba(5,7,9,.01) 52%,rgba(5,7,9,.48) 100%)}
        .market-story-copy{position:absolute;z-index:2;left:clamp(34px,5vw,78px);top:48%;width:min(47%,650px);transform:translateY(-50%)}
        .market-story-copy .eyebrow{margin-bottom:13px}.market-story-copy h1{max-width:650px;margin:0;color:#f1e8e0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,4.6vw,5.2rem);font-weight:500;line-height:.94;letter-spacing:-.052em;text-wrap:balance;text-shadow:0 4px 30px rgba(0,0,0,.56)}
        .market-story-copy>p:not(.eyebrow){max-width:590px;margin:17px 0 0;color:rgba(235,225,218,.8);font-size:13px;line-height:1.67;text-shadow:0 3px 20px rgba(0,0,0,.5)}.market-story-copy .button-row{margin-top:21px}
        .market-story-proof{position:absolute;z-index:2;left:clamp(34px,5vw,78px);right:clamp(28px,4vw,58px);bottom:20px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(238,229,221,.12);background:linear-gradient(90deg,rgba(7,8,10,.4),rgba(7,8,10,.06));backdrop-filter:blur(3px)}
        .market-story-proof span{min-height:48px;padding:12px 12px 8px 0;display:flex;align-items:flex-end;gap:8px;color:#cfc2ba;font-size:7px;font-weight:780;letter-spacing:.08em;text-transform:uppercase}.market-story-proof span+span{padding-left:12px;border-left:1px solid rgba(238,229,221,.09)}.market-story-proof small{color:#9d806f;font-size:6px;letter-spacing:.12em}
        @media(max-width:1000px){.market-story-hero{height:560px}.market-story-copy{width:58%}.market-story-copy h1{font-size:clamp(3rem,6vw,4.7rem)}}
        @media(max-width:720px){.market-story-hero{width:calc(100% - 18px);height:680px;margin-top:78px;border-radius:18px}.market-story-image,.market-story-left .market-story-image,.market-story-right .market-story-image{object-position:66% center}.market-story-shade{background:linear-gradient(180deg,rgba(5,7,9,.04) 0%,rgba(5,7,9,.14) 34%,rgba(5,7,9,.86) 61%,rgba(5,7,9,.98) 100%)}.market-story-copy{left:22px;right:22px;top:auto;bottom:145px;width:auto;transform:none}.market-story-copy h1{font-size:clamp(2.75rem,11vw,4.1rem)}.market-story-copy>p:not(.eyebrow){font-size:11px}.market-story-proof{left:22px;right:22px;bottom:17px;grid-template-columns:repeat(2,1fr)}.market-story-proof span{min-height:42px;font-size:6px}.market-story-proof span:nth-child(3){border-left:0}}
      `}</style>
    </section>
  );
}
