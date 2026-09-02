import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { OperatorGlobalEchoRetractionControl } from "@/components/operator-global-echo-retraction-control";
import { getCurrentSnapshot } from "@/lib/auth";
import { listCanonicalAlerts, type CanonicalAlert } from "@/lib/canonical-alerts";
import { getOperatorCapabilities } from "@/lib/operator-capabilities";
import { isManualGlobalEchoAlert } from "@/lib/operator-global-echo-retraction";

type OperatorAlert = CanonicalAlert & {
  operatorIntelligence?: {
    availabilityScope?: string | null;
    sourceType?: string | null;
    expectedLabel?: string | null;
    operatorIssue?: number | null;
  } | null;
};

export default async function OperatorEchoesPage() {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard/operator-echoes");
  const capabilities = await getOperatorCapabilities(snapshot.account.id);
  if (!capabilities.canRetractGlobalEcho) redirect("/dashboard/alerts");

  let alerts: OperatorAlert[] = [];
  try {
    const echoAlerts = await listCanonicalAlerts({ state: "echo", limit: 100 });
    alerts = echoAlerts.filter((alert) => isManualGlobalEchoAlert(alert as OperatorAlert)) as OperatorAlert[];
  } catch {
    alerts = [];
  }

  return <DashboardPageShell title="Operator Echoes" eyebrow="OWNER CONTROL">
    <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gap:14}}>
      <section style={{padding:22,border:"1px solid rgba(221,203,188,.09)",borderRadius:12,background:"linear-gradient(145deg,#0e1216,#090d11 74%)"}}>
        <span style={{color:"#aa886d",fontSize:10,fontWeight:900,letterSpacing:".14em"}}>AUTHORISED OPERATOR · GLOBAL ECHO</span>
        <h1 style={{margin:"8px 0",fontFamily:"Georgia,serif",fontWeight:500,color:"#eee4da"}}>Retract a manual Echo sent in error.</h1>
        <p style={{margin:0,color:"#918885"}}>Retraction removes the Echo from active App/Web alert views and cancels any queued operator push. It does not delete the original evidence, alter stock truth or create Vanished.</p>
        <Link href="/dashboard/alerts" style={{display:"inline-block",marginTop:12,color:"#c5a4d1"}}>← Back to Alerts</Link>
      </section>

      <section style={{padding:20,border:"1px solid rgba(221,203,188,.09)",borderRadius:12,background:"#0b0f13"}}>
        <header style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"end",marginBottom:12}}><div><small style={{color:"#aa886d",fontWeight:900}}>ACTIVE MANUAL GLOBAL ECHOES</small><h2 style={{margin:"5px 0 0",color:"#ded4cc",fontFamily:"Georgia,serif",fontWeight:500}}>{alerts.length} retractable Echo{alerts.length === 1 ? "" : "es"}</h2></div><small style={{color:"#716a6b"}}>Newest first</small></header>
        {alerts.length ? <div style={{display:"grid",gap:8}}>{alerts.map((alert) => <article key={alert.id} style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:14,alignItems:"start",padding:14,border:"1px solid rgba(221,203,188,.07)",borderRadius:9,background:"#090d11"}}>
          <div style={{display:"grid",gap:5,minWidth:0}}><small style={{color:"#9574c7",fontWeight:900}}>ECHO · ISSUE #{alert.operatorIntelligence?.operatorIssue ?? "—"}</small><strong style={{color:"#ddd2ca"}}>{alert.title}</strong><span style={{color:"#817978"}}>{alert.operatorIntelligence?.expectedLabel || alert.message}</span><small style={{color:"#625c5e"}}>{new Date(alert.detectedAt).toLocaleString("en-GB")}</small></div>
          <OperatorGlobalEchoRetractionControl eventId={alert.id}/>
        </article>)}</div> : <div style={{padding:18,border:"1px dashed rgba(221,203,188,.09)",borderRadius:9,color:"#817978"}}>No active manual Global Echoes are currently retractable.</div>}
      </section>
    </div>
  </DashboardPageShell>;
}
