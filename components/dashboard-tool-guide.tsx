import Link from "next/link";
import { getCurrentSnapshot } from "@/lib/auth";
import { countPendingBetaRequestsForOwner, isOwnerUser } from "@/lib/owner-access";

const PRIVATE_BETA_OPERATOR_EMAIL = "fatedropuk@gmail.com";

const tools = [
  {
    name: "Search",
    href: "/dashboard/search",
    kicker: "FIND IT",
    description: "Find a product and see the live retailer offers FateDrop currently knows about.",
  },
  {
    name: "FateFind",
    href: "/dashboard/fatefind",
    kicker: "BEST DEAL NOW",
    description: "Find the strongest-value live deal using the correct RRP percentage. True Price is shown inside FateFind when delivery is known.",
  },
  {
    name: "FateMatch",
    href: "/dashboard/watchlist",
    kicker: "WATCH MY CONDITIONS",
    description: "Choose a specific product, budget and buying conditions. Your companion watches until a qualifying offer goes live.",
  },
  {
    name: "Alerts",
    href: "/dashboard/alerts",
    kicker: "WHAT HAPPENED",
    description: "See the signals and personal notifications FateDrop detected or delivered, including Whisper, Echo, Manifested and Vanished.",
  },
] as const;

async function privateBetaOperatorState() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) return null;

  // This email check controls dashboard presentation only. Administrative
  // authority still comes exclusively from the canonical Owner role by user ID,
  // and /admin/beta independently re-checks that role before allowing access.
  const isPrivateOperator = snapshot.account.email.trim().toLowerCase() === PRIVATE_BETA_OPERATOR_EMAIL
    && await isOwnerUser(snapshot.account.id);
  if (!isPrivateOperator) return null;

  try {
    return { pending: await countPendingBetaRequestsForOwner(snapshot.account.id) };
  } catch {
    // Unknown stays unknown: never turn an unavailable approval ledger into a
    // misleading zero-pending state.
    return { pending: null };
  }
}

export async function DashboardToolGuide() {
  const operator = await privateBetaOperatorState();

  return <section className="fd-tool-guide" aria-labelledby="fd-tool-guide-title">
    {operator ? <aside className="fd-owner-beta-tool" aria-label="Private closed beta approval tool">
      <div>
        <small>OWNER / CLOSED BETA</small>
        <strong>Beta approvals</strong>
        <span>{operator.pending === null
          ? "Approval queue count unavailable. Open the Owner console to review it."
          : operator.pending === 0
            ? "No collectors are waiting for approval."
            : `${operator.pending} collector${operator.pending === 1 ? "" : "s"} waiting for approval.`}</span>
      </div>
      <Link href="/admin/beta">
        <b>{operator.pending === null ? "—" : operator.pending}</b>
        <span>OPEN APPROVAL QUEUE →</span>
      </Link>
    </aside> : null}
    <header><div><span>HOW FATEDROP WORKS</span><h2 id="fd-tool-guide-title">Four clear jobs. One shared intelligence system.</h2></div><p>True Price is a pricing calculation inside FateFind, not a separate tool.</p></header>
    <div className="fd-tool-grid">
      {tools.map((tool) => <Link href={tool.href} key={tool.name}>
        <small>{tool.kicker}</small>
        <strong>{tool.name}</strong>
        <span>{tool.description}</span>
        <b>OPEN {tool.name.toUpperCase()} →</b>
      </Link>)}
    </div>
    <style>{`
      .fd-tool-guide{padding:22px;border:1px solid rgba(221,203,188,.09);border-radius:13px;background:linear-gradient(145deg,#101419,#0b0f13 72%)}.fd-owner-beta-tool{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:-4px -4px 20px;padding:15px 17px;border:1px solid rgba(210,182,111,.14);border-radius:11px;background:radial-gradient(circle at 90% 20%,rgba(124,110,255,.1),transparent 32%),rgba(210,182,111,.025)}.fd-owner-beta-tool>div{display:grid;gap:4px}.fd-owner-beta-tool>div small{color:#b99972;font-size:9px;font-weight:900;letter-spacing:.13em}.fd-owner-beta-tool>div strong{color:#eee4dc;font-size:17px}.fd-owner-beta-tool>div span{color:#9f969b;font-size:12px;line-height:1.45}.fd-owner-beta-tool>a{display:grid;grid-template-columns:auto auto;gap:12px;align-items:center;min-height:0;padding:10px 13px;border:1px solid rgba(124,110,255,.16);border-radius:9px;background:rgba(124,110,255,.035);color:inherit;text-decoration:none}.fd-owner-beta-tool>a:hover{border-color:rgba(124,110,255,.3);background:rgba(124,110,255,.06)}.fd-owner-beta-tool>a b{padding:0;color:#d2b66f;font-size:24px;line-height:1}.fd-owner-beta-tool>a span{margin:0;color:#c8b0da;font-size:10px;font-weight:900;letter-spacing:.04em}.fd-tool-guide>header{display:flex;justify-content:space-between;gap:24px;align-items:flex-end}.fd-tool-guide>header span{color:#b6977d;font-size:11px;font-weight:900;letter-spacing:.14em}.fd-tool-guide h2{margin:6px 0 0;color:#eee5dd;font-size:22px;line-height:1.2}.fd-tool-guide>header p{max-width:430px;margin:0;color:#aaa1a7;font-size:13px;line-height:1.55;text-align:right}.fd-tool-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.fd-tool-grid>a{min-height:170px;padding:16px;display:flex;flex-direction:column;border:1px solid rgba(221,203,188,.07);border-radius:11px;background:rgba(255,255,255,.014);color:inherit;text-decoration:none}.fd-tool-grid>a:hover{border-color:rgba(177,129,202,.25);background:rgba(150,96,184,.035)}.fd-tool-grid>a small{color:#9a8574;font-size:10px;font-weight:900;letter-spacing:.1em}.fd-tool-grid>a strong{margin-top:7px;color:#eee4dc;font-size:18px}.fd-tool-grid>a span{margin-top:8px;color:#aaa1a7;font-size:13px;line-height:1.55}.fd-tool-grid>a b{margin-top:auto;padding-top:13px;color:#c7a5dd;font-size:11px;font-weight:900}@media(max-width:1000px){.fd-tool-grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.fd-tool-guide{padding:16px}.fd-owner-beta-tool{align-items:stretch;flex-direction:column}.fd-owner-beta-tool>a{justify-content:space-between}.fd-tool-guide>header{align-items:flex-start;flex-direction:column}.fd-tool-guide>header p{text-align:left}.fd-tool-grid{grid-template-columns:1fr}.fd-tool-grid>a{min-height:150px}}
    `}</style>
  </section>;
}
