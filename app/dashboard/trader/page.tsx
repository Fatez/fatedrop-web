import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { FateTraderAudit } from "@/components/fate-trader-audit";

export const dynamic = "force-dynamic";

export default function FateTraderPage() {
  return <DashboardPageShell title="Fate Trader" eyebrow="FATE NETWORK · COLLECTOR TRADING">
    <FateTraderAudit />
  </DashboardPageShell>;
}
