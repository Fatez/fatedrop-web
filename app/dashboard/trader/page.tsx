import { notFound } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { FateTraderAudit } from "@/components/fate-trader-audit";
import { fateTraderWebEnabled } from "@/lib/fate-trader-web";

export const dynamic = "force-dynamic";

export default function FateTraderPage() {
  if (!fateTraderWebEnabled()) notFound();

  return <DashboardPageShell title="Fate Trader" eyebrow="FATE NETWORK · COLLECTOR TRADING">
    <FateTraderAudit />
  </DashboardPageShell>;
}
