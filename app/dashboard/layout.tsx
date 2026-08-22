import type { ReactNode } from "react";
import { RetailerHandoffObserver } from "@/components/retailer-handoff-observer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>
    <RetailerHandoffObserver />
    {children}
  </>;
}
