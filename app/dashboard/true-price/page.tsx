import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FateFind | FateDrop Dashboard",
  robots: { index: false, follow: false },
};

export default async function LegacyTruePricePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  redirect(q ? `/dashboard/fatefind?q=${encodeURIComponent(q)}` : "/dashboard/fatefind");
}
