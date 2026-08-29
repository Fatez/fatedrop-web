import Link from "next/link";
import type { BetaAccessStatus } from "@/lib/beta-access";
import type { BetaDistributionLinks } from "@/lib/beta-distribution";

type Props = {
  approved: boolean;
  status: BetaAccessStatus;
  links: BetaDistributionLinks;
  isOwner: boolean;
  pendingCount: number;
};

export function ClosedBetaAccessHub({ approved, status, links, isOwner, pendingCount }: Props) {
  const stateLabel = approved ? "APPROVED" : status === "revoked" ? "REVOKED" : "PENDING";

  return <section className={`fd-beta-hub ${approved ? "is-approved" : "is-pending"}`}>
    <div className="fd-beta-hub-head">
      <div>
        <p className="eyebrow"><span />FATEDROP CLOSED BETA</p>
        <h2>{approved ? "Web + App access is ready." : status === "revoked" ? "Closed-beta access is not active." : "Your Web + App request is pending."}</h2>
        <p>{approved
          ? "One approved FateDrop ID unlocks the Website Dashboard and FateDrop App. Install links distribute the software only — this account approval remains the authority."
          : "Your FateDrop ID exists, but product access stays closed until the Owner approves this same account. You do not need a second App Beta signup."}</p>
      </div>
      <span className="fd-beta-state">{stateLabel}</span>
    </div>

    {isOwner ? <Link className="fd-owner-beta-link" href="/admin/beta">
      <span>OWNER / BETA ACCESS</span>
      <strong>{pendingCount > 0 ? `${pendingCount} pending` : "No pending requests"}</strong>
      {pendingCount > 0 ? <i aria-label={`${pendingCount} pending beta request${pendingCount === 1 ? "" : "s"}`} /> : null}
    </Link> : null}

    {approved ? <div className="fd-beta-destinations">
      <article>
        <small>WEB</small>
        <h3>FateDrop Dashboard</h3>
        <p>Use FateDrop immediately in your browser with the same approved FateDrop ID.</p>
        <Link className="button button-primary" href="/dashboard">Open Web Dashboard <span>↗</span></Link>
      </article>
      <article>
        <small>IPHONE / IOS</small>
        <h3>FateDrop for iPhone</h3>
        <p>Install the current closed-beta build through the controlled iOS distribution link.</p>
        {links.ios
          ? <a className="button button-secondary" href={links.ios} target="_blank" rel="noreferrer">Install on iPhone <span>↗</span></a>
          : <span className="fd-beta-unavailable">iPhone beta link preparing</span>}
      </article>
      <article>
        <small>ANDROID</small>
        <h3>FateDrop for Android</h3>
        <p>Install the current controlled Android beta build. Sign-in approval is still required after installation.</p>
        {links.android
          ? <a className="button button-secondary" href={links.android} target="_blank" rel="noreferrer">Install on Android <span>↗</span></a>
          : <span className="fd-beta-unavailable">Android beta link preparing</span>}
      </article>
    </div> : <div className="fd-beta-waiting">
      <span><small>WEB DASHBOARD</small><strong>Locked until approval</strong></span>
      <span><small>MOBILE APP</small><strong>Locked until approval</strong></span>
      <Link className="button button-secondary" href="/beta-pending">View request status</Link>
    </div>}

    <style>{`
      .fd-beta-hub{margin-top:12px;padding:clamp(22px,3vw,34px);border:1px solid rgba(124,110,255,.15);border-radius:18px;background:radial-gradient(circle at 86% 8%,rgba(124,110,255,.12),transparent 28%),linear-gradient(145deg,#101419,#090c10 75%)}.fd-beta-hub-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}.fd-beta-hub-head h2{margin:8px 0 10px;color:#eee4dd;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2rem,3.5vw,3.6rem);font-weight:500;letter-spacing:-.04em}.fd-beta-hub-head>div>p:last-child{max-width:820px;margin:0;color:#9a9297;font-size:12px;line-height:1.7}.fd-beta-state{padding:7px 10px;border:1px solid rgba(124,110,255,.22);border-radius:999px;color:#aaa1ff;font-size:9px;font-weight:900;letter-spacing:.13em}.fd-owner-beta-link{position:relative;display:flex;justify-content:space-between;gap:14px;align-items:center;margin-top:18px;padding:13px 42px 13px 14px;border:1px solid rgba(210,182,111,.16);border-radius:10px;background:rgba(210,182,111,.035);text-decoration:none}.fd-owner-beta-link span{color:#9d7f68;font-size:9px;font-weight:900;letter-spacing:.12em}.fd-owner-beta-link strong{color:#d9cec6;font-size:11px}.fd-owner-beta-link i{position:absolute;right:15px;width:9px;height:9px;border-radius:50%;background:#d2b66f;box-shadow:0 0 16px rgba(210,182,111,.5)}.fd-beta-destinations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:20px}.fd-beta-destinations article{display:flex;flex-direction:column;align-items:flex-start;min-height:220px;padding:20px;border:1px solid rgba(221,203,188,.08);border-radius:12px;background:rgba(255,255,255,.018)}.fd-beta-destinations small,.fd-beta-waiting small{color:#81787d;font-size:8px;font-weight:900;letter-spacing:.13em}.fd-beta-destinations h3{margin:8px 0;color:#e4dad4;font-size:17px}.fd-beta-destinations p{flex:1;margin:0 0 18px;color:#8f878c;font-size:11px;line-height:1.6}.fd-beta-unavailable{padding:10px 12px;border:1px solid rgba(221,203,188,.07);border-radius:9px;color:#777075;font-size:10px}.fd-beta-waiting{display:grid;grid-template-columns:repeat(2,minmax(0,1fr)) auto;gap:9px;align-items:center;margin-top:20px}.fd-beta-waiting>span{padding:15px;border:1px solid rgba(221,203,188,.07);border-radius:10px;background:rgba(255,255,255,.015)}.fd-beta-waiting strong{display:block;margin-top:6px;color:#a69da2;font-size:10px}@media(max-width:850px){.fd-beta-hub-head{display:grid}.fd-beta-destinations,.fd-beta-waiting{grid-template-columns:1fr}.fd-beta-destinations article{min-height:0}}
    `}</style>
  </section>;
}
