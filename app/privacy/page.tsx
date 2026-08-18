import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Founding Beta Privacy Notice | FateDrop",
  description: "How FateDrop stores and uses collector, retailer and event-organiser founding-beta enquiries.",
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="legal-shell section-shell">
        <p className="eyebrow"><span />Founding-beta privacy notice</p>
        <h1>Your enquiry data.</h1>
        <div className="legal-placeholder"><strong>Operational beta notice.</strong><br />The live join forms store genuine enquiries. A final legal review, formal data-controller details and a dedicated public privacy contact route remain required before scaled acquisition.</div>
        <h2>What FateDrop stores</h2>
        <p>The join form stores the details you deliberately provide for the selected collector, retailer/vendor or event-organiser journey. This can include your name, email, region, business or event details, catalogue information, preferences, message, contact consent and optional marketing consent.</p>
        <h2>Why it is used</h2>
        <p>Required contact consent allows FateDrop to review and reply to your registration or enquiry. Optional marketing consent is separate and is not required to join. FateDrop does not sell beta-lead information.</p>
        <h2>Where it is stored</h2>
        <p>Valid submissions are stored in a private, Sites-managed Cloudflare D1 database. There is no public lead-list or export endpoint. The form does not deliberately record IP addresses, user-agent strings or browsing history.</p>
        <h2>How long it is kept</h2>
        <p>The working beta retention target is up to 12 months unless the record is needed for an active founding-partner conversation or is deleted earlier. This schedule must be confirmed during the final legal review.</p>
        <h2>Your choices and rights</h2>
        <p>You can leave optional marketing consent unticked. Once FateDrop replies, you can use that correspondence to ask for access, correction, withdrawal of marketing consent or deletion. A dedicated public privacy mailbox remains a genuine production blocker before larger-scale promotion.</p>
        <h2>Security and access</h2>
        <p>Database access should remain limited to authorised project owners who need it for beta follow-up. Personal information must not be copied into public analytics, testimonials, case studies or sales claims without a separate lawful basis and permission where required.</p>
      </article>
    </SiteShell>
  );
}
