"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarPicker } from "@/components/avatar-picker";

type Profile = {
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  primaryTcg: string | null;
  collectorStyle: string | null;
  region: string | null;
  profileTheme: "signal" | "cyan" | "violet" | "magenta";
};

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [displayName, setDisplayName] = useState(profile.displayName);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setFields({});
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { error?: string; fields?: Record<string, string> };
      if (!response.ok) {
        setMessage(result.error || "Profile could not be updated.");
        setFields(result.fields || {});
        return;
      }
      setMessage("Profile synced to your FateDrop ID.");
      router.refresh();
    } catch {
      setMessage("FateDrop could not reach the profile service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="profile-editor" onSubmit={submit}>
      <AvatarPicker value={avatarUrl} displayName={displayName} onChange={setAvatarUrl} />
      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      {fields.avatarUrl ? <small className="field-error avatar-field-error">{fields.avatarUrl}</small> : null}
      <div className="profile-editor-grid">
        <label><span>Display name</span><input name="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />{fields.displayName ? <small className="field-error">{fields.displayName}</small> : null}</label>
        <label><span>Network handle</span><div className="input-prefix"><i>@</i><input name="username" defaultValue={profile.username} /></div>{fields.username ? <small className="field-error">{fields.username}</small> : null}</label>
        <label><span>Primary TCG</span><input name="primaryTcg" defaultValue={profile.primaryTcg ?? ""} placeholder="Pokémon TCG" /></label>
        <label><span>Collector style</span><select name="collectorStyle" defaultValue={profile.collectorStyle ?? ""}><option value="">Choose later</option><option>Sealed collector</option><option>Singles collector</option><option>Player</option><option>Set completer</option><option>Graded collector</option><option>Vendor / trader</option><option>Bit of everything</option></select></label>
        <label><span>Region</span><input name="region" defaultValue={profile.region ?? ""} placeholder="Kent, London, North West…" /></label>
        <label><span>Signal colour</span><select name="profileTheme" defaultValue={profile.profileTheme}><option value="signal">Signal / violet-cyan</option><option value="cyan">Icy cyan</option><option value="violet">Electric violet</option><option value="magenta">Spectral magenta</option></select></label>
        <label className="full"><span>Network bio</span><textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={220} placeholder="What do you collect? What are you hunting?" /></label>
      </div>
      <div className="profile-editor-actions">
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Syncing…" : "Save profile"} <span>↗</span></button>
        {message ? <p className={message.startsWith("Profile synced") ? "success" : "error"} role="status">{message}</p> : null}
      </div>
    </form>
  );
}
