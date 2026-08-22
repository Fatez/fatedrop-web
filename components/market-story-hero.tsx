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
        .market-story-hero{position:relative;width:min(1560px,calc(100% - 32px));aspect-ratio:2.34/1;min-height:520px;max-height:670px;margin:88px auto 0;overflow:hidden;border:1px solid rgba(221,203,188,.13);border-radius:26px;background:#090b0d;box-shadow:0 30px 95px rgba(0,0,0,.27)}
        .market-story-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.78) contrast(.98) brightness(.83)}
        .market-story-left .market-story-image{object-position:left center}.market-story-right .market-story-image{object-position:right center}
        .market-story-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,9,.88) 0%,rgba(5,7,9,.70) 24%,rgba(5,7,9,.26) 49%,rgba(5,7,9,.07) 72%,rgba(5,7,9,.16) 100%),linear-gradient(180deg,rgba(5,7,9,.02) 40%,rgba(5,7,9,.56) 100%)}
        .market-story-copy{position:absolute;z-index:2;left:clamp(34px,5vw,84px);top:50%;width:min(49%,720px);transform:translateY(-52%)}
        .market-story-copy .eyebrow{margin-bottom:18px}.market-story-copy h1{max-width:720px;margin:0;color:#f1e8e0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3.25rem,5.45vw,6rem);font-weight:500;line-height:.92;letter-spacing:-.055em;text-wrap:balance;text-shadow:0 4px 30px rgba(0,0,0,.55)}
        .market-story-copy>p:not(.eyebrow){max-width:625px;margin:22px 0 0;color:rgba(235,225,218,.78);font-size:14px;line-height:1.72;text-shadow:0 3px 20px rgba(0,0,0,.5)}.market-story-copy .button-row{margin-top:28px}
        .market-story-proof{position:absolute;z-index:2;left:clamp(34px,5vw,84px);right:clamp(30px,4vw,64px);bottom:24px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(238,229,221,.12);background:linear-gradient(90deg,rgba(7,8,10,.34),rgba(7,8,10,.08));backdrop-filter:blur(4px)}
        .market-story-proof span{min-height:55px;padding:14px 14px 10px 0;display:flex;align-items:flex-end;gap:8px;color:#cfc2ba;font-size:8px;font-weight:780;letter-spacing:.08em;text-transform:uppercase}.market-story-proof span+span{padding-left:14px;border-left:1px solid rgba(238,229,221,.09)}.market-story-proof small{color:#9d806f;font-size:6px;letter-spacing:.12em}
        @media(max-width:900px){.market-story-hero{aspect-ratio:auto;min-height:660px}.market-story-copy{width:64%}.market-story-proof{grid-template-columns:repeat(2,1fr)}.market-story-proof span:nth-child(3){border-left:0}}
        @media(max-width:720px){.market-story-hero{width:calc(100% - 18px);min-height:720px;margin-top:78px;border-radius:18px}.market-story-image,.market-story-left .market-story-image,.market-story-right .market-story-image{object-position:66% center}.market-story-shade{background:linear-gradient(180deg,rgba(5,7,9,.06) 0%,rgba(5,7,9,.18) 38%,rgba(5,7,9,.88) 66%,rgba(5,7,9,.98) 100%)}.market-story-copy{left:22px;right:22px;top:auto;bottom:155px;width:auto;transform:none}.market-story-copy h1{font-size:clamp(2.9rem,12vw,4.35rem)}.market-story-copy>p:not(.eyebrow){font-size:11px}.market-story-proof{left:22px;right:22px;bottom:18px}.market-story-proof span{min-height:48px;font-size:7px}}
      `}</style>
    </section>
  );
}
