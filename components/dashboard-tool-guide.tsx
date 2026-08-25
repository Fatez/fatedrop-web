import Link from "next/link";

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

export function DashboardToolGuide() {
  return <section className="fd-tool-guide" aria-labelledby="fd-tool-guide-title">
    <header><div><span>HOW FATEDROP WORKS</span><h2 id="fd-tool-guide-title">Four clear jobs. One shared intelligence system.</h2></div><p>True Price is a pricing calculation inside FateFind, not a separate tool.</p></header>
    <div>
      {tools.map((tool) => <Link href={tool.href} key={tool.name}>
        <small>{tool.kicker}</small>
        <strong>{tool.name}</strong>
        <span>{tool.description}</span>
        <b>OPEN {tool.name.toUpperCase()} →</b>
      </Link>)}
    </div>
    <style>{`
      .fd-tool-guide{padding:22px;border:1px solid rgba(221,203,188,.09);border-radius:13px;background:linear-gradient(145deg,#101419,#0b0f13 72%)}.fd-tool-guide>header{display:flex;justify-content:space-between;gap:24px;align-items:flex-end}.fd-tool-guide>header span{color:#b6977d;font-size:11px;font-weight:900;letter-spacing:.14em}.fd-tool-guide h2{margin:6px 0 0;color:#eee5dd;font-size:22px;line-height:1.2}.fd-tool-guide>header p{max-width:430px;margin:0;color:#aaa1a7;font-size:13px;line-height:1.55;text-align:right}.fd-tool-guide>div{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.fd-tool-guide a{min-height:170px;padding:16px;display:flex;flex-direction:column;border:1px solid rgba(221,203,188,.07);border-radius:11px;background:rgba(255,255,255,.014);color:inherit;text-decoration:none}.fd-tool-guide a:hover{border-color:rgba(177,129,202,.25);background:rgba(150,96,184,.035)}.fd-tool-guide a small{color:#9a8574;font-size:10px;font-weight:900;letter-spacing:.1em}.fd-tool-guide a strong{margin-top:7px;color:#eee4dc;font-size:18px}.fd-tool-guide a span{margin-top:8px;color:#aaa1a7;font-size:13px;line-height:1.55}.fd-tool-guide a b{margin-top:auto;padding-top:13px;color:#c7a5dd;font-size:11px;font-weight:900}@media(max-width:1000px){.fd-tool-guide>div{grid-template-columns:1fr 1fr}}@media(max-width:620px){.fd-tool-guide{padding:16px}.fd-tool-guide>header{align-items:flex-start;flex-direction:column}.fd-tool-guide>header p{text-align:left}.fd-tool-guide>div{grid-template-columns:1fr}.fd-tool-guide a{min-height:150px}}
    `}</style>
  </section>;
}
