import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";
import { KoruReferenceLanding } from "@/components/koru-home-reference";
import { FateDropValueSectionV2 } from "@/components/fatedrop-value-section-v2";
import {
  EventsHomeLink,
  IndieBridgeSection,
  KoruFriendsMerchSection,
  MembershipConversionSection,
} from "@/components/koru-final-sections";

export const metadata: Metadata = {
  title: "FateDrop | UK TCG Signal Intelligence & Indie Discovery",
  description:
    "FateDrop helps collectors follow evidence-backed stock signals, use FateFind to compare live value, create FateMatch watches and discover independent TCG retailers and events.",
};

export default function Home() {
  return (
    <SiteShell>
      <KoruReferenceLanding />
      <FateDropValueSectionV2 />
      <KoruFriendsMerchSection />
      <IndieBridgeSection />
      <EventsHomeLink />
      <MembershipConversionSection />
    </SiteShell>
  );
}
