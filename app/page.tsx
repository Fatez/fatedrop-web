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
    </SiteShell>
  );
}
