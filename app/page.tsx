import type { Metadata } from "next";
import { FinalCta, SiteShell } from "@/components/page-shell";
import { KoruReferenceLanding } from "@/components/koru-home-reference";
import {
  EventsHomeLink,
  FateDropPhoneSection,
  FateDropPillars,
  IndieBridgeSection,
  KoruFriendsMerchSection,
} from "@/components/koru-final-sections";

export const metadata: Metadata = {
  title: "FateDrop | UK TCG Signal Intelligence & Indie Discovery",
  description:
    "FateDrop helps collectors follow evidence-backed stock signals, understand True Price, find FateMatches and discover independent TCG retailers and events.",
};

export default function Home() {
  return (
    <SiteShell>
      <KoruReferenceLanding />
      <KoruFriendsMerchSection />
      <FateDropPillars />
      <FateDropPhoneSection />
      <IndieBridgeSection />
      <EventsHomeLink />
      <FinalCta />
    </SiteShell>
  );
}
