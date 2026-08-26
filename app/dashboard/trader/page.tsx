import { notFound } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { FateTraderSurface } from "@/components/fate-trader-surface";
import { fateTraderWebEnabled } from "@/lib/fate-trader-web";

export const dynamic = "force-dynamic";

export default function FateTraderPage() {
  if (!fateTraderWebEnabled()) notFound();

  return <DashboardPageShell title="Fate Trader" eyebrow="FATE NETWORK · COLLECTOR TRADING">
    <FateTraderSurface />
  </DashboardPageShell>;
}
