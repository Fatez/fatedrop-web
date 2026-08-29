import type { ReactNode } from "react";

export default function DashboardSearchLayout({ children }: { children: ReactNode }) {
  return <>
    {children}
    <style>{`
      .fd-ref-search{display:none!important}
      .fd-ref-top-actions{margin-left:auto}
    `}</style>
  </>;
}
