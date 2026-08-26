import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNetworkPulse } from "@/components/dashboard-network-pulse";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { getCurrentSnapshot } from "@/lib/auth";
import { buildDashboardData } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Fate Network | FateDrop Dashboard",
  description: "The connected FateDrop network for finding, watching, trading and discovering TCG stock.",
  robots: { index: false, follow: false },
};

const tools = [
  {
    eyebrow: "FIND & BUY",
    title: "FateFind",
    description: "Compare the strongest buying options across the network using the proven RRP, configuration, delivery and True Price intelligence.",
    href: "/dashboard/fatefind",
    action: "Open FateFind",
  },
  {
    eyebrow: "WATCH",
    title: "FateMatch",
    description: "Set the product and buying conditions you care about. FateDrop watches the network until a qualifying opportunity appears.",
    href: "/dashboard/watchlist",
    action: "Open FateMatch",
  },
  {
    eyebrow: "TRADE",
    title: "Fate Trader",
    description: "Use verified card identities to record what you have, what you want and find compatible collector-to-collector trade opportunities.",
    href: "/dashboard/trader",
    action: "Open Fate Trader",
    feature: "trader",
  },
  {
    eyebrow: "NEAR YOU",
    title: "Local Radar",
    description: "Explore nearby stores and events, then distinguish simple proximity from preparation evidence and verified physical stock.",
    href: "/dashboard/local-radar",
    action: "Open Local Radar",
  },
  {
    eyebrow: "DISCOVER RETAILERS",
    title: "Stores",
    description: "Browse the online and physical retailers that make up Fate Network, including independent and specialist stores.",
    href: "/dashboard/stores",
    action: "Browse Stores",
  },
] as const;

export default async function DashboardNetworkPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/network");

  const data = await buildDashboardData(snapshot);
  const network = data.network;
  const signalActivity7d = Object.values(data.publicSignalMetrics).every((value) => value === null || value === undefined)
    ? null
    : Object.values(data.publicSignalMetrics).reduce((total, value) => total + (value ?? 0), 0);
  const traderEnabled = process.env.NEXT_PUBLIC_FATE_TRADER_ENABLED === "true";
  const visibleTools = tools.filter((tool) => tool.feature !== "trader" || traderEnabled);

  return <DashboardPageShell title="Fate Network" eyebrow="ONE NETWORK · FIVE WAYS TO USE IT">
    <div className="fd-network-hub">
      <section className="fd-network-hero">
        <span>FATE NETWORK</span>
        <h1>One connected network for finding, watching, trading and discovering TCG stock.</h1>
        <p>Search remains FateDrop&apos;s universal catalogue utility. Fate Network brings together the intelligence layers around it: <strong>FateFind</strong> for value, <strong>FateMatch</strong> for monitoring, <strong>Fate Trader</strong> for collector trading, <strong>Local Radar</strong> for physical intelligence and <strong>Stores</strong> for retailer discovery.</p>
      </section>

      <section className="fd-network-tools" aria-label="Fate Network tools">
        {visibleTools.map((tool) => <article className="fd-network-tool" key={tool.title}>
          <small>{tool.eyebrow}</small>
          <h2>{tool.title}</h2>
          <p>{tool.description}</p>
          <Link href={tool.href}>{tool.action} <span>→</span></Link>
        </article>)}
      </section>

      <section className="fd-network-live">
        <div className="fd-network-live-copy">
          <small>LIVE NETWORK</small>
          <h2>What is happening across Fate Network right now?</h2>
          <p>Network Pulse is the macro view of current monitoring activity. It is not another alert list and does not manufacture activity when the underlying network data is unavailable.</p>
        </div>
        <div className="fd-network-live-pulse">
          <DashboardNetworkPulse retailers={network?.metrics.catalogueRetailers} products={network?.metrics.productsTracked} signals={signalActivity7d} />
        </div>
      </section>
    </div>

    <style>{`
      .fd-network-hub{display:grid;gap:12px;max-width:1600px;margin:0 auto}.fd-network-hero,.fd-network-tool,.fd-network-live{border:1px solid rgba(221,203,188,.085);border-radius:12px;background:linear-gradient(145deg,#0f1317,#090d11 74%);box-shadow:inset 0 1px rgba(255,255,255,.018)}.fd-network-hero{padding:34px;overflow:hidden;background:radial-gradient(circle at 88% 12%,rgba(126,87,143,.16),transparent 30%),linear-gradient(145deg,#101419,#090d11 70%)}.fd-network-hero>span,.fd-network-tool>small,.fd-network-live-copy>small{color:#b6977d;font-size:10px;font-weight:900;letter-spacing:.14em}.fd-network-hero h1{max-width:1020px;margin:12px 0 14px;color:#eee4dc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.6rem,5vw,5.2rem);font-weight:500;line-height:.96;letter-spacing:-.05em}.fd-network-hero p{max-width:980px;margin:0;color:#9d9599;font-size:14px;line-height:1.75}.fd-network-hero strong{color:#d0b5a1}.fd-network-tools{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.fd-network-tool{min-height:238px;padding:22px;display:flex;flex-direction:column}.fd-network-tool h2{margin:8px 0 8px;color:#e8ded6;font-family:Georgia,serif;font-size:26px;font-weight:500}.fd-network-tool p{margin:0;color:#948d92;font-size:12px;line-height:1.65}.fd-network-tool a{margin-top:auto;padding-top:20px;color:#c19ae1;font-size:12px;font-weight:800;text-decoration:none}.fd-network-tool a span{margin-left:5px}.fd-network-tool:hover{border-color:rgba(183,119,233,.18);background:linear-gradient(145deg,#11151a,#0a0e12 74%)}.fd-network-live{padding:24px;display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);gap:24px;align-items:center}.fd-network-live-copy h2{margin:7px 0 9px;color:#e6dcd4;font-family:Georgia,serif;font-size:28px;font-weight:500}.fd-network-live-copy p{margin:0;color:#948d92;font-size:12px;line-height:1.7}.fd-network-live-pulse{min-width:0}@media(max-width:1250px){.fd-network-tools{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:900px){.fd-network-tools{grid-template-columns:repeat(2,minmax(0,1fr))}.fd-network-live{grid-template-columns:1fr}}@media(max-width:620px){.fd-network-hero{padding:24px 20px}.fd-network-tools{grid-template-columns:1fr}.fd-network-tool{min-height:190px}}
    `}</style>
  </DashboardPageShell>;
}
