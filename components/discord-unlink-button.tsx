"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DiscordUnlinkButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function unlink() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/discord/link", { method: "DELETE" });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok) {
        setMessage(result.error || "Discord could not be unlinked.");
        return;
      }
      router.refresh();
    } catch {
      setMessage("FateDrop could not update the Discord link.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="membership-action-wrap"><button className="button button-quiet" type="button" onClick={unlink} disabled={busy}>{busy ? "Unlinking…" : "Unlink Discord"}</button>{message ? <small className="action-error">{message}</small> : null}</div>;
}
