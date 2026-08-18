"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarPreview } from "@/components/avatar-preview";
import {
  AVATAR_AURAS,
  AVATAR_BACKGROUNDS,
  AVATAR_BASES,
  AVATAR_COMPANIONS,
  AVATAR_GEAR,
  AVATAR_HEADWEAR,
  AVATAR_OPTION_LABELS,
  AVATAR_OUTFITS,
  AVATAR_TCG_STYLES,
  FAVOURITE_TCGS,
  type AvatarLoadout,
  type FavouriteTcg,
} from "@/lib/avatar-loadout";

const tcgLabels: Record<FavouriteTcg, string> = {
  pokemon: "Pokémon TCG",
  "one-piece": "One Piece TCG",
  lorcana: "Lorcana",
  magic: "Magic",
  yugioh: "Yu-Gi-Oh!",
};

type Category = keyof Pick<AvatarLoadout, "base" | "outfit" | "headwear" | "gear" | "companion" | "aura" | "background" | "tcgStyle">;

const categoryOptions = {
  base: AVATAR_BASES,
  outfit: AVATAR_OUTFITS,
  headwear: AVATAR_HEADWEAR,
  gear: AVATAR_GEAR,
  companion: AVATAR_COMPANIONS,
  aura: AVATAR_AURAS,
  background: AVATAR_BACKGROUNDS,
  tcgStyle: AVATAR_TCG_STYLES,
} as const;

const categoryLabels: Record<Category, string> = {
  base: "Base",
  outfit: "Outfit",
  headwear: "Headwear",
  gear: "Gear",
  companion: "Companion",
  aura: "Aura",
  background: "Background",
  tcgStyle: "TCG Style",
};

export function AvatarBuilder({ initialLoadout, initialFavouriteTcgs, persistent }: { initialLoadout: AvatarLoadout; initialFavouriteTcgs: FavouriteTcg[]; persistent: boolean }) {
  const router = useRouter();
  const [loadout, setLoadout] = useState(initialLoadout);
  const [favourites, setFavourites] = useState<FavouriteTcg[]>(initialFavouriteTcgs);
  const [category, setCategory] = useState<Category>("base");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(persistent ? "Your avatar is synced to your FateDrop ID." : "Preview mode is ready. Avatar saving needs the small account migration.");

  const currentOptions = useMemo(() => categoryOptions[category] as readonly string[], [category]);

  function choose(value: string) {
    setLoadout((current) => ({ ...current, [category]: value } as AvatarLoadout));
    setMessage("Unsaved changes");
  }

  function toggleFavourite(tcg: FavouriteTcg) {
    setFavourites((current) => {
      if (current.includes(tcg)) return current.filter((item) => item !== tcg);
      if (current.length >= 3) return [...current.slice(1), tcg];
      return [...current, tcg];
    });
    setMessage("Unsaved changes");
  }

  function randomise() {
    const pick = <T,>(values: readonly T[]) => values[Math.floor(Math.random() * values.length)];
    setLoadout({
      base: pick(AVATAR_BASES),
      outfit: pick(AVATAR_OUTFITS),
      headwear: pick(AVATAR_HEADWEAR),
      gear: pick(AVATAR_GEAR),
      companion: pick(AVATAR_COMPANIONS),
      aura: pick(AVATAR_AURAS),
      background: pick(AVATAR_BACKGROUNDS),
      tcgStyle: pick(AVATAR_TCG_STYLES),
    });
    setMessage("Randomised · unsaved");
  }

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loadout, favouriteTcgs: favourites }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Avatar could not be saved.");
        return;
      }
      setMessage("Avatar saved to your FateDrop ID.");
      router.refresh();
    } catch {
      setMessage("FateDrop could not reach the avatar service.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="fd-avatar-builder">
    <div className="fd-avatar-editor">
      <div className="fd-avatar-category-tabs">
        {(Object.keys(categoryLabels) as Category[]).map((item) => <button key={item} type="button" data-active={category === item} onClick={() => setCategory(item)}><span>{item === "companion" ? "◉" : item === "aura" ? "✦" : item === "tcgStyle" ? "◇" : "▧"}</span>{categoryLabels[item]}</button>)}
      </div>
      <div className="fd-avatar-options">
        <div className="fd-avatar-options-head"><div><small>{categoryLabels[category].toUpperCase()}</small><h2>Choose your {categoryLabels[category].toLowerCase()}.</h2></div><span>ORIGINAL FATEDROP COSMETICS</span></div>
        <div className="fd-avatar-option-grid">{currentOptions.map((value) => {
          const labels = AVATAR_OPTION_LABELS[category] as Record<string, string>;
          const active = loadout[category] === value;
          return <button type="button" key={value} data-active={active} onClick={() => choose(value)}><span className={`option-icon option-${value}`}>{category === "companion" ? "◉" : category === "gear" ? "▣" : category === "aura" ? "✦" : category === "background" ? "▦" : category === "tcgStyle" ? "◇" : "◆"}</span><strong>{labels[value] || value}</strong><small>{active ? "EQUIPPED" : "SELECT"}</small></button>;
        })}</div>
        <div className="fd-avatar-favourites"><div><small>FAVOURITE TCGs</small><h3>Shape what your cosmetic catalogue shows first.</h3><p>Pick up to three. These preferences do not use franchise artwork; they guide original FateDrop accessory themes.</p></div><div>{FAVOURITE_TCGS.map((tcg) => <button type="button" key={tcg} data-active={favourites.includes(tcg)} onClick={() => toggleFavourite(tcg)}>{tcgLabels[tcg]}{favourites.includes(tcg) ? <span>✓</span> : null}</button>)}</div></div>
        <div className="fd-avatar-actions"><button type="button" className="secondary" onClick={randomise}>↻ RANDOMISE</button><button type="button" className="primary" onClick={save} disabled={busy}>{busy ? "SAVING…" : "SAVE AVATAR →"}</button><p role="status">{message}</p></div>
      </div>
    </div>
    <aside className="fd-avatar-preview-panel"><div className="fd-avatar-preview-head"><span>LIVE PREVIEW</span><small>FATEMATCH COMPANION READY</small></div><AvatarPreview loadout={loadout} mood="watching" label="Your FateDrop companion"/><div className="fd-avatar-moods"><span><b>WATCHING</b>Active FateMatch</span><span><b>WHISPER</b>Early movement</span><span><b>MANIFESTED</b>Stock detected</span></div></aside>
    <style jsx>{`
      .fd-avatar-builder{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(320px,.7fr);gap:18px}.fd-avatar-editor,.fd-avatar-preview-panel{border:1px solid rgba(255,255,255,.08);border-radius:22px;background:linear-gradient(145deg,rgba(15,14,23,.96),rgba(8,9,14,.98));box-shadow:0 24px 65px rgba(0,0,0,.2)}.fd-avatar-editor{display:grid;grid-template-columns:170px 1fr;min-height:620px;overflow:hidden}.fd-avatar-category-tabs{padding:16px 10px;display:flex;flex-direction:column;gap:4px;border-right:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.16)}.fd-avatar-category-tabs button{height:46px;padding:0 11px;display:grid;grid-template-columns:24px 1fr;align-items:center;text-align:left;border:1px solid transparent;border-radius:10px;background:transparent;color:#88828f;font-size:9px;font-weight:850}.fd-avatar-category-tabs button[data-active="true"]{border-color:rgba(157,109,255,.3);background:linear-gradient(90deg,rgba(157,109,255,.15),rgba(88,232,255,.045));color:#fff}.fd-avatar-category-tabs button span{color:#77eaff}.fd-avatar-options{padding:24px;min-width:0}.fd-avatar-options-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.fd-avatar-options-head small,.fd-avatar-favourites small,.fd-avatar-preview-head span{color:#74eaff;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-avatar-options-head h2{margin:5px 0 0;font-size:23px;letter-spacing:-.04em}.fd-avatar-options-head>span{color:#5f5965;font-size:6px;font-weight:900;letter-spacing:.13em}.fd-avatar-option-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:22px 0}.fd-avatar-option-grid button{min-height:112px;padding:12px;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:radial-gradient(circle at 50% 20%,rgba(157,109,255,.08),transparent 45%),rgba(255,255,255,.02);color:#fff;text-align:left}.fd-avatar-option-grid button[data-active="true"]{border-color:rgba(104,232,251,.38);box-shadow:inset 0 0 0 1px rgba(157,109,255,.16),0 0 28px rgba(100,93,255,.08)}.option-icon{width:38px;height:38px;margin-bottom:auto;display:grid;place-items:center;border:1px solid rgba(157,109,255,.2);border-radius:10px;color:#aef3ff;background:rgba(157,109,255,.06);font-size:16px}.fd-avatar-option-grid strong{font-size:10px}.fd-avatar-option-grid small{margin-top:4px;color:#696370;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-avatar-option-grid button[data-active="true"] small{color:#72e9fb}.fd-avatar-favourites{display:grid;grid-template-columns:1fr 1.2fr;gap:18px;padding:17px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:rgba(0,0,0,.14)}.fd-avatar-favourites h3{margin:5px 0;font-size:15px}.fd-avatar-favourites p{margin:0;color:#7e7885;font-size:9px;line-height:1.5}.fd-avatar-favourites>div:last-child{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fd-avatar-favourites button{min-height:35px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.02);color:#89838f;font-size:8px}.fd-avatar-favourites button[data-active="true"]{border-color:rgba(157,109,255,.3);color:#fff;background:rgba(157,109,255,.08)}.fd-avatar-favourites button span{color:#70e9a9}.fd-avatar-actions{display:grid;grid-template-columns:auto auto 1fr;gap:8px;align-items:center;margin-top:16px}.fd-avatar-actions button{min-height:42px;padding:0 14px;border-radius:10px;font-size:8px;font-weight:900;letter-spacing:.08em}.fd-avatar-actions .secondary{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:#aaa4b0}.fd-avatar-actions .primary{border:1px solid rgba(104,232,251,.28);background:linear-gradient(135deg,rgba(104,232,251,.1),rgba(157,109,255,.16));color:#fff}.fd-avatar-actions p{margin:0;color:#8f8996;font-size:8px}.fd-avatar-preview-panel{padding:18px;align-self:start;position:sticky;top:18px}.fd-avatar-preview-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:12px}.fd-avatar-preview-head small{color:#665f6d;font-size:6px;font-weight:900;letter-spacing:.11em}.fd-avatar-moods{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.fd-avatar-moods span{padding:8px;border:1px solid rgba(255,255,255,.055);border-radius:9px;color:#716b77;font-size:6px;line-height:1.4}.fd-avatar-moods b{display:block;color:#aaa4b0;font-size:6px;letter-spacing:.08em}@media(max-width:1100px){.fd-avatar-builder{grid-template-columns:1fr}.fd-avatar-preview-panel{position:static}.fd-avatar-editor{min-height:0}}@media(max-width:700px){.fd-avatar-editor{grid-template-columns:1fr}.fd-avatar-category-tabs{display:grid;grid-template-columns:repeat(2,1fr);border-right:0;border-bottom:1px solid rgba(255,255,255,.07)}.fd-avatar-option-grid{grid-template-columns:1fr 1fr}.fd-avatar-favourites{grid-template-columns:1fr}.fd-avatar-actions{grid-template-columns:1fr 1fr}.fd-avatar-actions p{grid-column:1/-1}.fd-avatar-options{padding:17px}}@media(max-width:460px){.fd-avatar-option-grid{grid-template-columns:1fr}.fd-avatar-actions{grid-template-columns:1fr}.fd-avatar-actions p{grid-column:auto}}
    `}</style>
  </div>;
}
