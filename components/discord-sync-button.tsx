"use client";

import { useState } from "react";

export function DiscordSyncButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sync() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/discord/sync", { method: "POST" });
      const result = await response.json() as { synced?: boolean; error?: string };
      setMessage(response.ok && result.synced ? "Premium role synced." : result.error || "Role sync failed.");
    } catch {
      setMessage("FateDrop could not reach Discord sync.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="membership-action-wrap"><button className="button button-secondary" type="button" onClick={sync} disabled={busy}>{busy ? "Syncing…" : "Sync Discord role"}</button>{message ? <small className={message === "Premium role synced." ? "action-success" : "action-error"}>{message}</small> : null}</div>;
}
