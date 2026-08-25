import { Suspense, type ReactNode } from "react";
import { RetailerHandoffObserver } from "@/components/retailer-handoff-observer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>
    <Suspense fallback={null}><RetailerHandoffObserver /></Suspense>
    {children}
  </>;
}
