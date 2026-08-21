"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarOptionThumbnail } from "@/components/avatar-option-thumbnail";
import { AvatarPreview } from "@/components/avatar-preview";
import {
  AVATAR_ACCESSORIES,
  AVATAR_AURAS,
  AVATAR_BACKGROUNDS,
  AVATAR_BASES,
  AVATAR_EYES,
  AVATAR_FACES,
  AVATAR_GEAR,
  AVATAR_HAIR,
  AVATAR_HEADWEAR,
  AVATAR_OPTION_LABELS,
  AVATAR_OUTFITS,
  AVATAR_SKINS,
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

const visibleCategoryOptions = {
  base: AVATAR_BASES,
  skin: AVATAR_SKINS,
  hair: AVATAR_HAIR,
  face: AVATAR_FACES,
  eyes: AVATAR_EYES,
  outfit: AVATAR_OUTFITS,
  headwear: AVATAR_HEADWEAR,
  accessory: AVATAR_ACCESSORIES,
  gear: AVATAR_GEAR,
  aura: AVATAR_AURAS,
  background: AVATAR_BACKGROUNDS,
} as const;

type ProfileCategory = keyof typeof visibleCategoryOptions;

const categoryLabels: Record<ProfileCategory, string> = {
  base: "Base",
  skin: "Skin",
  hair: "Hair",
  face: "Face",
  eyes: "Eyes",
  outfit: "Outfit",
  headwear: "Headwear",
  accessory: "Accessories",
  gear: "Gear",
  aura: "Aura",
  background: "Background",
};

export function AvatarBuilder({ initialLoadout, initialFavouriteTcgs, persistent }: { initialLoadout: AvatarLoadout; initialFavouriteTcgs: FavouriteTcg[]; persistent: boolean }) {
  const router = useRouter();
  const [loadout, setLoadout] = useState(initialLoadout);
  const [favourites, setFavourites] = useState<FavouriteTcg[]>(initialFavouriteTcgs);
  const [category, setCategory] = useState<ProfileCategory>("hair");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(persistent ? "Your profile avatar is synced to your FateDrop ID." : "Preview mode is ready. Profile saving needs account storage.");

  const currentOptions = useMemo(() => visibleCategoryOptions[category] as readonly string[], [category]);

  function choose(value: string) {
    setLoadout((current) => ({ ...current, [category]: value } as AvatarLoadout));
    setMessage("Unsaved profile changes");
  }

  function toggleFavourite(tcg: FavouriteTcg) {
    setFavourites((current) => current.includes(tcg) ? current.filter((item) => item !== tcg) : current.length >= 3 ? [...current.slice(1), tcg] : [...current, tcg]);
    setMessage("Unsaved profile changes");
  }

  function randomise() {
    const pick = <T,>(values: readonly T[]) => values[Math.floor(Math.random() * values.length)];
    setLoadout((current) => ({
      ...current,
      base: pick(AVATAR_BASES),
      skin: pick(AVATAR_SKINS),
      hair: pick(AVATAR_HAIR),
      face: pick(AVATAR_FACES),
      eyes: pick(AVATAR_EYES),
      outfit: pick(AVATAR_OUTFITS),
      headwear: pick(AVATAR_HEADWEAR),
      accessory: pick(AVATAR_ACCESSORIES),
      gear: pick(AVATAR_GEAR),
      aura: pick(AVATAR_AURAS),
      background: pick(AVATAR_BACKGROUNDS),
      companion: "none",
      tcgStyle: "neutral",
    }));
    setMessage("Randomised profile · unsaved");
  }

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const safeLoadout = { ...loadout, companion: "none" as const, tcgStyle: "neutral" as const };
      const response = await fetch("/api/account/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loadout: safeLoadout, favouriteTcgs: favourites }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error || "Profile avatar could not be saved.");
        return;
      }
      setLoadout(safeLoadout);
      setMessage("Profile avatar saved to your FateDrop ID.");
      router.refresh();
    } catch {
      setMessage("FateDrop could not reach the profile service.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="profile-builder">
    <aside className="profile-preview">
      <div className="head"><div><span>YOUR PROFILE</span><h2>Collector avatar</h2></div><small>SEPARATE FROM KORU</small></div>
      <AvatarPreview loadout={{ ...loadout, companion: "none", tcgStyle: "neutral" }} mood="watching" label="Your FateDrop profile"/>
      <p className="note"><strong>Koru is not selectable.</strong> Koru is the fixed FateDrop mascot and signal voice. This editor only changes how your own collector profile appears.</p>
    </aside>

    <div className="editor">
      <div className="tabs">
        {(Object.keys(categoryLabels) as ProfileCategory[]).map((item) => <button key={item} type="button" data-active={category === item} onClick={() => setCategory(item)}>{categoryLabels[item]}</button>)}
      </div>
      <div className="options">
        <div className="options-head"><div><small>{categoryLabels[category].toUpperCase()}</small><h2>Choose your {categoryLabels[category].toLowerCase()}.</h2></div><span>PROFILE COSMETIC</span></div>
        <div className="option-grid">{currentOptions.map((value) => {
          const labels = AVATAR_OPTION_LABELS[category] as Record<string, string>;
          const active = loadout[category] === value;
          const optionLoadout = { ...loadout, [category]: value, companion: "none", tcgStyle: "neutral" } as AvatarLoadout;
          return <button type="button" key={value} data-active={active} onClick={() => choose(value)}>
            <AvatarOptionThumbnail loadout={optionLoadout}/>
            <span><strong>{labels[value] || value}</strong><small>{active ? "EQUIPPED" : "SELECT"}</small></span>
          </button>;
        })}</div>

        <div className="favourites"><div><small>FAVOURITE TCGs</small><h3>Your collection preferences.</h3><p>Choose up to three for discovery and account context. These preferences never reskin or replace Koru.</p></div><div>{FAVOURITE_TCGS.map((tcg) => <button type="button" key={tcg} data-active={favourites.includes(tcg)} onClick={() => toggleFavourite(tcg)}>{tcgLabels[tcg]}{favourites.includes(tcg) ? <span>✓</span> : null}</button>)}</div></div>
        <div className="actions"><button type="button" className="secondary" onClick={randomise}>↻ RANDOMISE</button><button type="button" className="primary" onClick={save} disabled={busy}>{busy ? "SAVING…" : "SAVE PROFILE →"}</button><p role="status">{message}</p></div>
      </div>
    </div>
    <style jsx>{`
      .profile-builder{display:grid;grid-template-columns:minmax(360px,.9fr) minmax(0,1.1fr);gap:18px;align-items:start}.profile-preview,.editor{border:1px solid rgba(255,255,255,.085);border-radius:24px;background:linear-gradient(145deg,rgba(15,14,23,.97),rgba(7,8,13,.99));box-shadow:0 28px 75px rgba(0,0,0,.24)}.profile-preview{position:sticky;top:18px;padding:18px}.head,.options-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:12px}.head span,.options-head small,.favourites small{color:#74eaff;font-size:7px;font-weight:900;letter-spacing:.16em}.head h2,.options-head h2{margin:5px 0 0;font-size:20px;letter-spacing:-.04em}.head>small,.options-head>span{color:#6d6574;font-size:6px;font-weight:900;letter-spacing:.13em}.note{margin:12px 2px 0;color:#827b88;font-size:9px;line-height:1.55}.note strong{color:#b9b3c0}.editor{overflow:hidden}.tabs{padding:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.15)}.tabs button{min-height:39px;padding:0 8px;border:1px solid transparent;border-radius:10px;background:transparent;color:#88828f;font-size:8px;font-weight:850}.tabs button[data-active="true"]{border-color:rgba(157,109,255,.3);background:linear-gradient(90deg,rgba(157,109,255,.15),rgba(88,232,255,.045));color:#fff}.options{padding:22px;min-width:0}.option-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:19px 0}.option-grid>button{padding:7px;display:grid;grid-template-columns:90px minmax(0,1fr);gap:10px;align-items:center;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.018);color:#fff;text-align:left;overflow:hidden}.option-grid>button[data-active="true"]{border-color:rgba(104,232,251,.38);background:linear-gradient(135deg,rgba(104,232,251,.045),rgba(157,109,255,.055))}.option-grid strong{display:block;font-size:9px}.option-grid small{display:block;margin-top:5px;color:#696370;font-size:6px;font-weight:900;letter-spacing:.1em}.favourites{display:grid;grid-template-columns:1fr 1.2fr;gap:18px;padding:17px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:rgba(0,0,0,.14)}.favourites h3{margin:5px 0;font-size:15px}.favourites p{margin:0;color:#7e7885;font-size:9px;line-height:1.5}.favourites>div:last-child{display:grid;grid-template-columns:1fr 1fr;gap:6px}.favourites button{min-height:35px;padding:0 9px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.02);color:#85808a;font-size:7px;font-weight:850}.favourites button[data-active="true"]{border-color:rgba(104,232,251,.28);color:#fff;background:rgba(104,232,251,.06)}.favourites button span{float:right;color:#70e9fb}.actions{display:grid;grid-template-columns:auto auto 1fr;gap:8px;align-items:center;margin-top:16px}.actions button{min-height:40px;padding:0 13px;border-radius:10px;font-size:7px;font-weight:900;letter-spacing:.08em}.secondary{border:1px solid rgba(255,255,255,.1);background:transparent;color:#aaa4ae}.primary{border:0;background:linear-gradient(90deg,#6548ff,#9d6dff);color:#fff}.actions p{margin:0;color:#77717e;font-size:8px}@media(max-width:900px){.profile-builder{grid-template-columns:1fr}.profile-preview{position:relative;top:auto}}@media(max-width:560px){.tabs{grid-template-columns:repeat(3,1fr)}.option-grid{grid-template-columns:1fr}.favourites{grid-template-columns:1fr}.actions{grid-template-columns:1fr}.actions p{text-align:center}}
    `}</style>
  </section>;
}
