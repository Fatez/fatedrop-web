import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";
import { KoruReferenceLanding } from "@/components/koru-home-reference";
import {
  EventsHomeLink,
  FateDropValueSection,
  IndieBridgeSection,
  KoruFriendsMerchSection,
  MembershipConversionSection,
} from "@/components/koru-final-sections";

export const metadata: Metadata = {
  title: "FateDrop | UK TCG Signal Intelligence & Indie Discovery",
  description:
    "FateDrop helps collectors follow evidence-backed stock signals, understand True Price, create FateFind hunts, receive FateMatch results and discover independent TCG retailers and events.",
};

export default function Home() {
  return (
    <SiteShell>
      <KoruReferenceLanding />
      <FateDropValueSection />
      <KoruFriendsMerchSection />
      <IndieBridgeSection />
      <EventsHomeLink />
      <MembershipConversionSection />
    </SiteShell>
  );
}
