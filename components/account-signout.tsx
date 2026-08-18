"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccountSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return <button className="text-link account-signout" type="button" onClick={signOut} disabled={busy}>{busy ? "Disconnecting…" : "Sign out"} <span>→</span></button>;
}
