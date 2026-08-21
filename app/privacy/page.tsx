import type { Metadata } from "next";
import { SiteShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Founding Beta Privacy Notice | FateDrop",
  description: "How FateDrop uses beta enquiries, FateDrop ID profiles, Koru & Friends companion choice, Wishlist, alert preferences, membership, Local Radar and connected Discord information.",
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="legal-shell section-shell">
        <p className="eyebrow"><span />Founding-beta privacy notice</p>
        <h1>Your FateDrop data.</h1>
        <div className="legal-placeholder"><strong>Operational beta notice.</strong><br />This page describes the current technical design, but a final UK legal review, formal data-controller details and a dedicated public privacy contact route are still required before scaled acquisition.</div>
        <h2>FateDrop ID and profile</h2>
        <p>If you create a FateDrop ID, FateDrop stores the email and profile information you deliberately provide, including your display name, network handle, optional bio, profile-image choice or uploaded profile image, TCG interests, collector style and region. It also stores a generated FateDrop ID and timestamps so the service can show your genuine member-since history.</p>
        <p>Preset profile images are stored as a small FateDrop asset reference. If you upload your own profile image, the browser crops and compresses it to a small WebP image before it is stored with your profile. The original source file is not retained by FateDrop.</p>
        <h2>Koru &amp; Friends companion</h2>
        <p>If you choose a Koru &amp; Friends companion, FateDrop stores the selected character ID needed to keep that choice with your account. The current active roster is Koru, Fenn, Aeris, Nyxen and Solix. The companion is a presentation and reaction layer; it does not create a hidden behavioural profile or alter the evidence behind FateDrop signals.</p>
        <p>The richer 3D renderer is still a product foundation. If future companion features require materially different personal data, this notice must be updated before that data is collected.</p>
        <h2>Wishlist, FateFind and alert preferences</h2>
        <p>If you use Universal Wishlist, FateDrop stores the product identity or search title you chose to save and basic display metadata needed to show that product again. A Wishlist save means you want to remember a product; it is separate from a FateFind.</p>
        <p>If you create a FateFind, FateDrop stores the hunt criteria you deliberately provide, such as product/search identity, price or RRP thresholds, stock requirement, online/local scope, optional retailer filters and notification choices. When a qualifying observed result is recorded, FateDrop may store the resulting FateMatch event needed to explain why the hunt matched.</p>
        <p>Notification preferences can store whether you want Whisper, Echo, Manifested, Vanished, price-change or FateMatch notifications, which delivery channels you prefer, and optional quiet-hour settings. A saved preference does not by itself mean that every delivery channel is operational; app push and Discord delivery remain dependent on those integrations being connected and enabled.</p>
        <h2>Local Radar location</h2>
        <p>Local Radar asks the browser for location only after you choose to use the nearby-search control. The current API receives latitude, longitude and search radius only to perform that authenticated Places-provider lookup and returns the results with a private, no-store response. The current Local Radar route does not write those coordinates into the FateDrop account or activity database. If future location history or saved-area features are added, the storage and retention position must be documented before they go live.</p>
        <h2>Passwords and sessions</h2>
        <p>Passwords are stored as one-way salted hashes rather than readable passwords. FateDrop operators do not receive a readable copy of your password from the account store. A strictly necessary session cookie is used to keep you signed in. Session records are time-limited and can be invalidated when you sign out.</p>
        <h2>Membership and billing</h2>
        <p>When Stripe billing is enabled, FateDrop stores only the identifiers and subscription state needed to connect a Stripe customer/subscription to your FateDrop ID, such as tier, status, trial dates and renewal/cancellation state. Payment-card details are handled by Stripe rather than stored in the FateDrop application database.</p>
        <h2>Discord connection</h2>
        <p>If you choose to connect Discord, FateDrop stores the Discord user ID, display name/avatar reference and connection/sync timestamps needed to associate that Discord identity with your FateDrop ID and automate an eligible Premium role. FateDrop does not need to retain the temporary Discord OAuth access token for this role-linking flow.</p>
        <h2>Beta enquiries</h2>
        <p>The join forms separately store the details you submit for a collector, retailer/vendor or event-organiser enquiry. This can include your name, email, region, business or event information, preferences, message, required contact consent and optional marketing consent.</p>
        <h2>Where data is stored</h2>
        <p>Local development uses ignored local files. Hosted production is designed to use a private managed PostgreSQL database configured through protected environment variables. There is no public account, password-hash, lead-list or database-export endpoint.</p>
        <h2>Why it is used</h2>
        <p>Account data is used to provide identity, profile, Koru &amp; Friends companion choice, Wishlist, FateFind/FateMatch, alert preferences, membership and connected-access features. On-demand location is used only for the current nearby-store query described above. Enquiry data is used to review and reply to the journey you selected. Optional marketing consent remains separate. FateDrop does not sell beta-lead or profile information.</p>
        <h2>Retention and your rights</h2>
        <p>Working retention periods must be confirmed in the final legal review. Before public scale, FateDrop also needs a dedicated contact route for access, correction, deletion, consent withdrawal and other applicable data-rights requests.</p>
      </article>
    </SiteShell>
  );
}
