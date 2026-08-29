import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";
import { KoruReferenceLanding } from "@/components/koru-home-reference";
import { FateDropValueSectionV2 } from "@/components/fatedrop-value-section-v2";
import { FateNetworkHomeSection } from "@/components/fate-network-home-section";
import {
  EventsHomeLink,
  KoruFriendsMerchSection,
  MembershipConversionSection,
} from "@/components/koru-final-sections";

export const metadata: Metadata = {
  title: "FateDrop | UK TCG Intelligence & Fate Network",
  description:
    "FateDrop helps collectors follow evidence-backed stock signals, use FateFind to compare live value, create FateMatch watches, discover retailers through the Fate Network and access Fate Trader as collector trading enters beta.",
};

export default function Home() {
  return (
    <SiteShell>
      <KoruReferenceLanding />
      <FateDropValueSectionV2 />
      <KoruFriendsMerchSection />
      <FateNetworkHomeSection />
      <EventsHomeLink />
      <MembershipConversionSection />
      <HomeClosingStyles />
    </SiteShell>
  );
}

function HomeClosingStyles() {
  return <style>{`
    .kf-merch,.fd-events-link,.fd-membership{width:min(1560px,calc(100% - 32px));margin-inline:auto}
    .fd-kicker{margin:0 0 14px;color:#b795c2;font-size:8px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .kf-merch h2,.fd-events-link h2,.fd-membership h2{margin:0;color:#f3e9e3;font-family:Georgia,'Times New Roman',serif;font-weight:500;line-height:.95;letter-spacing:-.052em}

    .kf-merch{margin-top:22px}
    .kf-merch-card{position:relative;display:block;min-height:clamp(430px,39vw,650px);overflow:hidden;border:1px solid rgba(216,201,216,.14);border-radius:24px;background:#0b0d13;color:inherit;text-decoration:none;box-shadow:0 28px 90px rgba(0,0,0,.2)}
    .kf-merch-card>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.68) contrast(.92) brightness(.8);transition:transform .7s cubic-bezier(.2,.7,.2,1),filter .7s ease}
    .kf-merch-card:hover>img{transform:scale(1.018);filter:saturate(.74) contrast(.94) brightness(.84)}
    .kf-merch-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,9,14,.91) 0%,rgba(7,9,14,.7) 31%,rgba(7,9,14,.24) 56%,rgba(7,9,14,.08) 100%),linear-gradient(180deg,rgba(4,6,10,.04),rgba(4,6,10,.38))}
    .kf-merch-copy{position:absolute;z-index:2;left:clamp(28px,4.7vw,76px);bottom:clamp(30px,5vw,72px);max-width:620px}
    .kf-merch-copy p{margin:0 0 14px;color:#b796c3;font-size:8px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .kf-merch-copy h2{max-width:590px;font-size:clamp(3rem,5.4vw,6rem)}
    .kf-merch-copy>span{display:block;max-width:520px;margin-top:18px;color:rgba(239,229,226,.76);font-size:13px;line-height:1.68}
    .kf-merch-copy>b{display:inline-flex;gap:10px;align-items:center;margin-top:24px;color:#d0accf;font-size:9px;letter-spacing:.09em;text-transform:uppercase}
    .kf-merch-copy i{font-style:normal}

    .fd-events-link{margin-top:18px;padding:34px 38px;display:flex;align-items:center;justify-content:space-between;gap:30px;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:radial-gradient(circle at 86% 20%,rgba(105,93,131,.12),transparent 24%),#0a0c11}
    .fd-events-link h2{font-size:clamp(2rem,3vw,3.4rem)}
    .fd-events-link div>p:not(.fd-kicker){max-width:760px;margin:12px 0 0;color:#817c83;font-size:10px;line-height:1.65}
    .fd-events-link>a{flex:0 0 auto;color:#b796c3;font-size:9px;font-weight:800;letter-spacing:.08em;text-decoration:none;text-transform:uppercase}

    .fd-membership{margin-top:18px;margin-bottom:90px;padding:clamp(32px,4.8vw,70px);display:grid;grid-template-columns:1.22fr .78fr;gap:40px;align-items:center;border:1px solid rgba(198,172,205,.13);border-radius:26px;background:radial-gradient(circle at 84% 18%,rgba(139,93,159,.16),transparent 28%),linear-gradient(145deg,#11131a,#090b10)}
    .fd-membership-copy h2{max-width:920px;font-size:clamp(3rem,5vw,5.5rem)}
    .fd-membership-copy>p:not(.fd-kicker){max-width:810px;margin:24px 0 30px;color:#9a9299;font-size:13px;line-height:1.75}
    .fd-membership-card{padding:30px;border:1px solid rgba(195,157,207,.17);border-radius:20px;background:rgba(10,10,15,.7);box-shadow:0 22px 70px rgba(0,0,0,.18)}
    .fd-membership-card>small{color:#a185a9;font-size:7px;font-weight:900;letter-spacing:.14em}
    .fd-membership-card>div{margin:18px 0 20px;display:flex;align-items:flex-end;gap:8px}
    .fd-membership-card>div strong{color:#f0e6e1;font-family:Georgia,serif;font-size:58px;font-weight:500;letter-spacing:-.05em}
    .fd-membership-card>div span{padding-bottom:9px;color:#807980;font-size:11px}
    .fd-membership-card ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
    .fd-membership-card li{padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.05);color:#a59ca2;font-size:10px}
    .fd-membership-card>a{display:inline-flex;margin-top:22px;color:#c4a2ca;font-size:9px;font-weight:800;letter-spacing:.07em;text-decoration:none}

    @media(max-width:1080px){.fd-membership{grid-template-columns:1fr}}
    @media(max-width:720px){
      .kf-merch,.fd-events-link,.fd-membership{width:calc(100% - 18px)}
      .kf-merch{margin-top:16px}.kf-merch-card{min-height:540px;border-radius:18px}.kf-merch-card>img{object-position:62% center}.kf-merch-shade{background:linear-gradient(180deg,rgba(7,9,14,.08) 0%,rgba(7,9,14,.14) 40%,rgba(7,9,14,.88) 78%,rgba(7,9,14,.96) 100%)}.kf-merch-copy{left:24px;right:24px;bottom:28px}.kf-merch-copy h2{font-size:clamp(2.65rem,11vw,4rem)}
      .fd-events-link{padding:26px 22px;align-items:flex-start;flex-direction:column}.fd-events-link h2{font-size:clamp(2.2rem,9.5vw,3.25rem)}.fd-events-link div>p:not(.fd-kicker){font-size:11px}.fd-events-link>a{font-size:8px}
      .fd-membership{padding:28px 22px;margin-bottom:64px}.fd-membership-copy h2{font-size:clamp(2.65rem,11vw,4rem)}.fd-membership-copy>p:not(.fd-kicker){font-size:12px}.fd-membership-card>div strong{font-size:48px}
    }
  `}</style>;
}
