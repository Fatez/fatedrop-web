import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/dashboard-page-shell";
import { LocalRadarDashboard } from "@/components/local-radar-dashboard";

export const metadata: Metadata = { title: "Local Radar | Fate Network | FateDrop", robots: { index: false, follow: false } };

export default function DashboardLocalRadarPage() {
  return <DashboardPageShell title="Local Radar" eyebrow="FATE NETWORK · PHYSICAL / LOCAL INTELLIGENCE">
    <LocalRadarDashboard />
  </DashboardPageShell>;
}
