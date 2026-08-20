"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarOptionThumbnail } from "@/components/avatar-option-thumbnail";
import { CompanionModelCanvas } from "@/components/companion-3d-stage";
import {
  AVATAR_ACCESSORIES,
  AVATAR_AURAS,
  AVATAR_BACKGROUNDS,
  AVATAR_BASES,
  AVATAR_COMPANIONS,
  AVATAR_EYES,
  AVATAR_FACES,
  AVATAR_GEAR,
  AVATAR_HAIR,
  AVATAR_HEADWEAR,
  AVATAR_OPTION_LABELS,
  AVATAR_OUTFITS,
  AVATAR_SKINS,
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

type Category = keyof AvatarLoadout;

const categoryOptions = {
  base: AVATAR_BASES,
  skin: AVATAR_SKINS,
  hair: AVATAR_HAIR,
  face: AVATAR_FACES,
  eyes: AVATAR_EYES,
  outfit: AVATAR_OUTFITS,
  headwear: AVATAR_HEADWEAR,
  accessory: AVATAR_ACCESSORIES,
  gear: AVATAR_GEAR,
  companion: AVATAR_COMPANIONS,
  aura: AVATAR_AURAS,
  background: AVATAR_BACKGROUNDS,
  tcgStyle: AVATAR_TCG_STYLES,
} as const;

const categoryLabels: Record<Category, string> = {
  base: "Base",
  skin: "Skin",
  hair: "Hair",
  face: "Face",
  eyes: "Eyes",
  outfit: "Outfit",
  headwear: "Headwear",
  accessory: "Accessories",
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
  const [category, setCategory] = useState<Category>("hair");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(persistent ? "Your Companion loadout is synced to your FateDrop ID." : "Preview mode is ready. Companion saving needs account storage.");

  const currentOptions = useMemo(() => categoryOptions[category] as readonly string[], [category]);
  const characterVariant = loadout.base === "warden" ? "female" : "male";

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
      skin: pick(AVATAR_SKINS),
      hair: pick(AVATAR_HAIR),
      face: pick(AVATAR_FACES),
      eyes: pick(AVATAR_EYES),
      outfit: pick(AVATAR_OUTFITS),
      headwear: pick(AVATAR_HEADWEAR),
      accessory: pick(AVATAR_ACCESSORIES),
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
        setMessage(payload.error || "Companion loadout could not be saved.");
        return;
      }
      setMessage("Companion loadout saved to your FateDrop ID.");
      router.refresh();
    } catch {
      setMessage("FateDrop could not reach the Companion service.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="fd-avatar-builder-v2">
    <aside className="fd-avatar-preview-panel">
      <div className="fd-avatar-preview-head"><div><span>YOUR FATE COMPANION</span><h2>3D Companion Rig</h2></div><small>COMPANION RIG V3</small></div>
      <div className="fd-avatar-live-stage">
        <div className="fd-avatar-stage-grid"/>
        <div className="fd-avatar-stage-glow"/>
        <div className="fd-avatar-stage-platform"/>
        <div className="fd-avatar-character-model"><CompanionModelCanvas variant={characterVariant} reaction="watching"/></div>
        {loadout.companion !== "none" ? <div className="fd-avatar-droid-model"><CompanionModelCanvas variant="droid" reaction="watching" showStatus={false}/></div> : null}
        <div className="fd-avatar-hud left"><span>RIG STATUS</span><b>◆ READY</b><span>POSE</span><b>◆ WATCHING</b></div>
        <div className="fd-avatar-hud right"><span>COMPANION</span><b>◆ {loadout.companion === "none" ? "NONE" : "SIGNAL DROID"}</b><span>LIGHTING</span><b>◆ STUDIO</b></div>
      </div>
      <div className="fd-avatar-moods"><span><b>IDLE</b>Dashboard</span><span><b>WATCHING</b>FateMatch</span><span><b>WHISPER</b>Early movement</span><span><b>MAJOR</b>Network surge</span><span><b>MANIFESTED</b>Stock detected</span><span><b>FATEMATCH</b>Match found</span></div>
    </aside>

    <div className="fd-avatar-editor">
      <div className="fd-avatar-category-tabs">
        {(Object.keys(categoryLabels) as Category[]).map((item) => <button key={item} type="button" data-active={category === item} onClick={() => setCategory(item)}><span>{item === "companion" ? "◉" : item === "aura" ? "✦" : item === "eyes" ? "◌" : item === "hair" ? "≋" : item === "accessory" ? "+" : "◇"}</span>{categoryLabels[item]}</button>)}
      </div>
      <div className="fd-avatar-options">
        <div className="fd-avatar-options-head"><div><small>{categoryLabels[category].toUpperCase()}</small><h2>Choose your {categoryLabels[category].toLowerCase()}.</h2></div><span>ORIGINAL FATEDROP ARTWORK</span></div>
        <div className="fd-avatar-option-grid">{currentOptions.map((value) => {
          const labels = AVATAR_OPTION_LABELS[category] as Record<string, string>;
          const active = loadout[category] === value;
          const optionLoadout = { ...loadout, [category]: value } as AvatarLoadout;
          return <button type="button" key={value} data-active={active} onClick={() => choose(value)}>
            <AvatarOptionThumbnail loadout={optionLoadout}/>
            <span className="fd-option-copy"><strong>{labels[value] || value}</strong><small>{active ? "EQUIPPED" : "SELECT"}</small></span>
          </button>;
        })}</div>
        <div className="fd-avatar-favourites"><div><small>FAVOURITE TCGs</small><h3>Let your collection shape your style.</h3><p>Choose up to three. FateDrop keeps the artwork original; these preferences only influence cosmetic discovery and accent treatment.</p></div><div>{FAVOURITE_TCGS.map((tcg) => <button type="button" key={tcg} data-active={favourites.includes(tcg)} onClick={() => toggleFavourite(tcg)}>{tcgLabels[tcg]}{favourites.includes(tcg) ? <span>✓</span> : null}</button>)}</div></div>
        <div className="fd-avatar-actions"><button type="button" className="secondary" onClick={randomise}>↻ RANDOMISE</button><button type="button" className="primary" onClick={save} disabled={busy}>{busy ? "SAVING…" : "SAVE AVATAR →"}</button><p role="status">{message}</p></div>
      </div>
    </div>

    <style jsx>{`
      .fd-avatar-builder-v2{display:grid;grid-template-columns:minmax(460px,1.08fr) minmax(0,.92fr);gap:18px;align-items:start}.fd-avatar-editor,.fd-avatar-preview-panel{border:1px solid rgba(255,255,255,.085);border-radius:24px;background:linear-gradient(145deg,rgba(15,14,23,.97),rgba(7,8,13,.99));box-shadow:0 28px 75px rgba(0,0,0,.24)}.fd-avatar-preview-panel{position:sticky;top:18px;padding:18px}.fd-avatar-preview-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:12px}.fd-avatar-preview-head span,.fd-avatar-options-head small,.fd-avatar-favourites small{color:#74eaff;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-avatar-preview-head h2{margin:5px 0 0;font-size:20px;letter-spacing:-.04em}.fd-avatar-preview-head>small{color:#6d6574;font-size:6px;font-weight:900;letter-spacing:.13em}.fd-avatar-live-stage{position:relative;min-height:535px;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:19px;background:radial-gradient(circle at 48% 78%,rgba(76,69,255,.18),transparent 33%),linear-gradient(180deg,#080b13,#07080d)}.fd-avatar-stage-grid{position:absolute;inset:0;opacity:.10;background-image:linear-gradient(rgba(115,232,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(157,109,255,.08) 1px,transparent 1px);background-size:42px 42px}.fd-avatar-stage-glow{position:absolute;left:12%;right:12%;bottom:3%;height:95px;border-radius:50%;background:rgba(100,73,255,.14);filter:blur(35px)}.fd-avatar-stage-platform{position:absolute;z-index:1;left:13%;right:13%;bottom:6%;height:58px;border:1px solid rgba(91,225,255,.27);border-radius:50%;box-shadow:0 0 0 15px rgba(135,87,255,.035),0 0 42px rgba(110,78,255,.18),inset 0 0 35px rgba(62,181,255,.06);transform:perspective(220px) rotateX(68deg)}.fd-avatar-character-model{position:absolute;z-index:3;left:2%;right:25%;top:4%;bottom:7%}.fd-avatar-droid-model{position:absolute;z-index:4;right:4%;top:14%;width:32%;height:36%;filter:drop-shadow(0 0 18px rgba(132,83,255,.2))}.fd-avatar-hud{position:absolute;z-index:5;bottom:23%;display:grid;gap:4px;pointer-events:none}.fd-avatar-hud.left{left:20px}.fd-avatar-hud.right{right:20px;text-align:right}.fd-avatar-hud span{margin-top:10px;color:#625d6a;font-size:5px;font-weight:900;letter-spacing:.12em}.fd-avatar-hud b{color:#c2bbc8;font-size:6px;letter-spacing:.06em}.fd-avatar-hud b::first-letter{color:#6ee8ff}.fd-avatar-moods{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.fd-avatar-moods span{padding:9px;border:1px solid rgba(255,255,255,.055);border-radius:10px;color:#716b77;font-size:6px;line-height:1.4}.fd-avatar-moods b{display:block;color:#b2acb8;font-size:6px;letter-spacing:.08em}
      .fd-avatar-editor{overflow:hidden}.fd-avatar-category-tabs{padding:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.15)}.fd-avatar-category-tabs button{min-height:43px;padding:0 9px;display:flex;align-items:center;gap:7px;border:1px solid transparent;border-radius:10px;background:transparent;color:#88828f;font-size:8px;font-weight:850;text-align:left}.fd-avatar-category-tabs button[data-active="true"]{border-color:rgba(157,109,255,.3);background:linear-gradient(90deg,rgba(157,109,255,.15),rgba(88,232,255,.045));color:#fff}.fd-avatar-category-tabs button span{width:18px;color:#77eaff;text-align:center}.fd-avatar-options{padding:22px;min-width:0}.fd-avatar-options-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.fd-avatar-options-head h2{margin:5px 0 0;font-size:22px;letter-spacing:-.04em}.fd-avatar-options-head>span{color:#5f5965;font-size:6px;font-weight:900;letter-spacing:.13em}.fd-avatar-option-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:19px 0}.fd-avatar-option-grid>button{padding:7px;display:grid;grid-template-columns:90px minmax(0,1fr);gap:10px;align-items:center;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.018);color:#fff;text-align:left;overflow:hidden}.fd-avatar-option-grid>button[data-active="true"]{border-color:rgba(104,232,251,.38);background:linear-gradient(135deg,rgba(104,232,251,.045),rgba(157,109,255,.055));box-shadow:inset 0 0 0 1px rgba(157,109,255,.1),0 0 30px rgba(100,93,255,.06)}.fd-option-copy{min-width:0}.fd-option-copy strong{display:block;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fd-option-copy small{display:block;margin-top:5px;color:#696370;font-size:6px;font-weight:900;letter-spacing:.1em}.fd-avatar-option-grid>button[data-active="true"] .fd-option-copy small{color:#72e9fb}
      .fd-avatar-favourites{display:grid;grid-template-columns:1fr 1.2fr;gap:18px;padding:17px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:rgba(0,0,0,.14)}.fd-avatar-favourites h3{margin:5px 0;font-size:15px}.fd-avatar-favourites p{margin:0;color:#7e7885;font-size:9px;line-height:1.5}.fd-avatar-favourites>div:last-child{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fd-avatar-favourites button{min-height:35px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.02);color:#89838f;font-size:8px}.fd-avatar-favourites button[data-active="true"]{border-color:rgba(157,109,255,.3);color:#fff;background:rgba(157,109,255,.08)}.fd-avatar-favourites button span{color:#70e9a9}.fd-avatar-actions{display:grid;grid-template-columns:auto auto 1fr;gap:8px;align-items:center;margin-top:16px}.fd-avatar-actions button{min-height:42px;padding:0 14px;border-radius:10px;font-size:8px;font-weight:900;letter-spacing:.08em}.fd-avatar-actions .secondary{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:#aaa4b0}.fd-avatar-actions .primary{border:1px solid rgba(104,232,251,.28);background:linear-gradient(135deg,rgba(104,232,251,.1),rgba(157,109,255,.16));color:#fff}.fd-avatar-actions p{margin:0;color:#8f8996;font-size:8px}
      @media(max-width:1180px){.fd-avatar-builder-v2{grid-template-columns:1fr}.fd-avatar-preview-panel{position:static}.fd-avatar-option-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.fd-avatar-option-grid>button{grid-template-columns:1fr}.fd-option-copy{padding:2px 3px 5px}}@media(max-width:760px){.fd-avatar-live-stage{min-height:460px}.fd-avatar-category-tabs{grid-template-columns:repeat(3,1fr)}.fd-avatar-option-grid{grid-template-columns:1fr 1fr}.fd-avatar-favourites{grid-template-columns:1fr}.fd-avatar-actions{grid-template-columns:1fr 1fr}.fd-avatar-actions p{grid-column:1/-1}}@media(max-width:500px){.fd-avatar-live-stage{min-height:400px}.fd-avatar-character-model{right:12%}.fd-avatar-droid-model{width:36%;height:32%;top:12%}.fd-avatar-hud{bottom:18%}.fd-avatar-category-tabs{grid-template-columns:repeat(2,1fr)}.fd-avatar-option-grid{grid-template-columns:1fr}.fd-avatar-actions{grid-template-columns:1fr}.fd-avatar-actions p{grid-column:auto}}
    `}</style>
  </div>;
}
