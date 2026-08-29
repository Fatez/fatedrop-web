import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { RetailerHandoffObserver } from "@/components/retailer-handoff-observer";
import { getCurrentSnapshot } from "@/lib/auth";
import { betaAccessIsApproved } from "@/lib/beta-access";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const snapshot = await getCurrentSnapshot();
  if (!snapshot) redirect("/account/login?next=/dashboard");
  if (!betaAccessIsApproved(snapshot.betaAccess)) redirect("/beta-pending");

  return <>
    <Suspense fallback={null}><RetailerHandoffObserver /></Suspense>
    {children}
  </>;
}
