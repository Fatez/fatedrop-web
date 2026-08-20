"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanionModelCanvas } from "@/components/companion-3d-stage";
import {
  AVATAR_AURAS,
  AVATAR_BACKGROUNDS,
  AVATAR_OPTION_LABELS,
  FAVOURITE_TCGS,
  type AvatarLoadout,
  type FavouriteTcg,
} from "@/lib/avatar-loadout";

type Reaction = "idle" | "watching" | "echo" | "manifested" | "vanished" | "fatematch" | "major";

type IdentityOption = {
  id: "scout" | "warden";
  name: string;
  code: string;
  description: string;
};

const IDENTITIES: IdentityOption[] = [
  { id: "scout", name: "KAEL", code: "K-01", description: "Collector hunter · fast signal response" },
  { id: "warden", name: "NYRA", code: "N-02", description: "Network tactician · precision signal read" },
];

const REACTIONS: { id: Reaction; label: string; note: string }[] = [
  { id: "idle", label: "Idle", note: "Dashboard" },
  { id: "watching", label: "Watching", note: "FateFind" },
  { id: "echo", label: "Echo", note: "Early movement" },
  { id: "manifested", label: "Manifested", note: "Stock live" },
  { id: "vanished", label: "Vanished", note: "Signal lost" },
  { id: "fatematch", label: "FateMatch", note: "Match found" },
  { id: "major", label: "Major", note: "Network surge" },
];

const tcgLabels: Record<FavouriteTcg, string> = {
  pokemon: "Pokémon TCG",
  "one-piece": "One Piece TCG",
  lorcana: "Lorcana",
  magic: "Magic",
  yugioh: "Yu-Gi-Oh!",
};

function pick<T>(values: readonly T[]) {
  return values[Math.floor(Math.random() * values.length)];
}

export function AvatarBuilder({
  initialLoadout,
  initialFavouriteTcgs,
  persistent,
}: {
  initialLoadout: AvatarLoadout;
  initialFavouriteTcgs: FavouriteTcg[];
  persistent: boolean;
}) {
  const router = useRouter();
  const [loadout, setLoadout] = useState(initialLoadout);
  const [favourites, setFavourites] = useState<FavouriteTcg[]>(initialFavouriteTcgs);
  const [reaction, setReaction] = useState<Reaction>("idle");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    persistent
      ? "Companion loadout synced to your FateDrop ID."
      : "Preview mode ready. Saving requires account storage.",
  );

  const identity: "scout" | "warden" = loadout.base === "warden" ? "warden" : "scout";
  const characterVariant = identity === "warden" ? "female" : "male";
  const selectedIdentity = IDENTITIES.find((item) => item.id === identity) ?? IDENTITIES[0];
  const familiarEnabled = loadout.companion !== "none";

  function patchLoadout(patch: Partial<AvatarLoadout>) {
    setLoadout((current) => ({ ...current, ...patch }));
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

  function randomiseSignalProfile() {
    patchLoadout({
      base: pick(["scout", "warden"] as const),
      companion: pick(["none", "radar-drone"] as const),
      aura: pick(AVATAR_AURAS),
      background: pick(AVATAR_BACKGROUNDS),
    });
    setReaction(pick(REACTIONS).id);
    setMessage("Signal profile randomised · unsaved");
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
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
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

  return (
    <section className="fd-companion-lab" aria-label="FateDrop Companion Lab">
      <div className="fd-companion-stage-column">
        <div className="fd-companion-stage-head">
          <div>
            <span>LIVE COMPANION</span>
            <h2>{selectedIdentity.name}</h2>
            <p>{selectedIdentity.description}</p>
          </div>
          <div className="fd-stage-code"><small>IDENTITY</small><b>{selectedIdentity.code}</b></div>
        </div>

        <div
          className="fd-companion-live-stage"
          data-aura={loadout.aura}
          data-background={loadout.background}
          data-reaction={reaction}
        >
          <div className="fd-stage-grid" aria-hidden="true" />
          <div className="fd-stage-orbit" aria-hidden="true" />
          <div className="fd-stage-aura" aria-hidden="true" />
          <div className="fd-stage-platform" aria-hidden="true" />

          <div className="fd-stage-character">
            <CompanionModelCanvas variant={characterVariant} reaction={reaction} />
          </div>

          {familiarEnabled ? (
            <div className="fd-stage-droid">
              <CompanionModelCanvas variant="droid" reaction={reaction} showStatus={false} />
            </div>
          ) : null}

          <div className="fd-stage-readout left">
            <span>STATE</span><b>{reaction.toUpperCase()}</b>
            <span>IDENTITY</span><b>{selectedIdentity.name}</b>
          </div>
          <div className="fd-stage-readout right">
            <span>FAMILIAR</span><b>{familiarEnabled ? "VØX" : "OFFLINE"}</b>
            <span>RIG</span><b>READY</b>
          </div>
        </div>

        <div className="fd-reaction-strip" aria-label="Preview Companion reactions">
          {REACTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              data-active={reaction === item.id}
              aria-pressed={reaction === item.id}
              onClick={() => setReaction(item.id)}
            >
              <strong>{item.label}</strong>
              <small>{item.note}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="fd-companion-controls">
        <section className="fd-control-block">
          <div className="fd-control-heading">
            <div><span>01 · IDENTITY</span><h3>Choose your collector.</h3></div>
            <small>ONE HUMANOID LOADED</small>
          </div>
          <div className="fd-identity-grid">
            {IDENTITIES.map((item) => (
              <button
                key={item.id}
                type="button"
                data-active={identity === item.id}
                onClick={() => patchLoadout({ base: item.id })}
              >
                <span>{item.code}</span>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
                <b>{identity === item.id ? "ACTIVE" : "SELECT"}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="fd-control-block">
          <div className="fd-control-heading">
            <div><span>02 · FAMILIAR</span><h3>Run solo or summon VØX.</h3></div>
            <small>SEPARATE ASSET</small>
          </div>
          <div className="fd-familiar-grid">
            <button type="button" data-active={familiarEnabled} onClick={() => patchLoadout({ companion: "radar-drone" })}>
              <strong>VØX</strong><small>Floating signal familiar</small><b>{familiarEnabled ? "ACTIVE" : "SUMMON"}</b>
            </button>
            <button type="button" data-active={!familiarEnabled} onClick={() => patchLoadout({ companion: "none" })}>
              <strong>SOLO</strong><small>Character only · lowest GPU load</small><b>{!familiarEnabled ? "ACTIVE" : "SELECT"}</b>
            </button>
          </div>
        </section>

        <section className="fd-control-block">
          <div className="fd-control-heading">
            <div><span>03 · SIGNAL AURA</span><h3>Set the stage energy.</h3></div>
            <small>LIVE PREVIEW</small>
          </div>
          <div className="fd-chip-grid">
            {AVATAR_AURAS.map((value) => (
              <button key={value} type="button" data-active={loadout.aura === value} onClick={() => patchLoadout({ aura: value })}>
                {AVATAR_OPTION_LABELS.aura[value]}
              </button>
            ))}
          </div>
        </section>

        <section className="fd-control-block">
          <div className="fd-control-heading">
            <div><span>04 · ENVIRONMENT</span><h3>Choose your signal space.</h3></div>
            <small>LIVE PREVIEW</small>
          </div>
          <div className="fd-chip-grid scenes">
            {AVATAR_BACKGROUNDS.map((value) => (
              <button key={value} type="button" data-active={loadout.background === value} onClick={() => patchLoadout({ background: value })}>
                {AVATAR_OPTION_LABELS.background[value]}
              </button>
            ))}
          </div>
        </section>

        <section className="fd-control-block fd-future-modules">
          <div className="fd-control-heading">
            <div><span>05 · MODULAR APPEARANCE</span><h3>Built for the next layer.</h3></div>
            <small>RESERVED SLOTS</small>
          </div>
          <p>Hair, face, eyes, outfit, headwear, accessories, gear and Fate Shard props remain separate modules. They are not faked onto the current GLB — each slot will connect to real geometry as the modular system comes online.</p>
          <div><span>HAIR</span><span>FACE</span><span>EYES</span><span>OUTFIT</span><span>HEADWEAR</span><span>GEAR</span><span>FATE SHARD</span></div>
        </section>

        <section className="fd-control-block fd-tcg-block">
          <div className="fd-control-heading">
            <div><span>06 · COLLECTION DNA</span><h3>Favourite TCGs.</h3></div>
            <small>CHOOSE UP TO 3</small>
          </div>
          <div className="fd-tcg-grid">
            {FAVOURITE_TCGS.map((tcg) => (
              <button key={tcg} type="button" data-active={favourites.includes(tcg)} onClick={() => toggleFavourite(tcg)}>
                {tcgLabels[tcg]}{favourites.includes(tcg) ? <span>✓</span> : null}
              </button>
            ))}
          </div>
        </section>

        <div className="fd-companion-actions">
          <button type="button" className="secondary" onClick={randomiseSignalProfile}>↻ RANDOMISE SIGNAL</button>
          <button type="button" className="primary" onClick={save} disabled={busy}>{busy ? "SAVING…" : "SAVE COMPANION →"}</button>
          <p role="status">{message}</p>
        </div>
      </div>

      <style jsx>{`
        .fd-companion-lab{display:grid;grid-template-columns:minmax(470px,1.08fr) minmax(0,.92fr);gap:18px;align-items:start}.fd-companion-stage-column,.fd-companion-controls{min-width:0}.fd-companion-stage-column{position:sticky;top:18px;padding:18px;border:1px solid rgba(255,255,255,.085);border-radius:24px;background:linear-gradient(145deg,rgba(15,14,23,.98),rgba(7,8,13,.99));box-shadow:0 28px 75px rgba(0,0,0,.25)}.fd-companion-stage-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:13px}.fd-companion-stage-head>div:first-child>span,.fd-control-heading span{color:#74eaff;font-size:7px;font-weight:900;letter-spacing:.16em}.fd-companion-stage-head h2{margin:4px 0 2px;font-size:26px;letter-spacing:-.045em}.fd-companion-stage-head p{margin:0;color:#756f7b;font-size:8px}.fd-stage-code{display:grid;justify-items:end;gap:3px;padding:7px 9px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.02)}.fd-stage-code small{color:#625c69;font-size:5px;font-weight:900;letter-spacing:.12em}.fd-stage-code b{color:#c7c0cd;font-size:8px;letter-spacing:.08em}.fd-companion-live-stage{position:relative;min-height:600px;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:20px;background:radial-gradient(circle at 50% 78%,rgba(105,65,255,.18),transparent 34%),linear-gradient(180deg,#090b13,#06070c)}.fd-stage-grid{position:absolute;inset:0;opacity:.10;background-image:linear-gradient(rgba(115,232,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(157,109,255,.08) 1px,transparent 1px);background-size:44px 44px}.fd-stage-orbit{position:absolute;left:13%;right:13%;top:13%;bottom:12%;border:1px solid rgba(157,109,255,.08);border-radius:50%;box-shadow:0 0 80px rgba(107,71,255,.08),inset 0 0 80px rgba(92,223,255,.02)}.fd-stage-aura{position:absolute;z-index:1;left:18%;right:18%;bottom:6%;height:95px;border-radius:50%;background:rgba(126,75,255,.16);filter:blur(32px);transition:background .25s ease}.fd-companion-live-stage[data-aura=cyan] .fd-stage-aura{background:rgba(75,220,255,.18)}.fd-companion-live-stage[data-aura=spectral] .fd-stage-aura{background:rgba(190,116,255,.19)}.fd-companion-live-stage[data-aura=gold] .fd-stage-aura{background:rgba(255,197,78,.17)}.fd-companion-live-stage[data-reaction=manifested] .fd-stage-aura,.fd-companion-live-stage[data-reaction=fatematch] .fd-stage-aura{background:rgba(64,255,184,.19)}.fd-companion-live-stage[data-reaction=vanished] .fd-stage-aura{background:rgba(255,73,105,.17)}.fd-stage-platform{position:absolute;z-index:2;left:15%;right:15%;bottom:7%;height:62px;border:1px solid rgba(91,225,255,.26);border-radius:50%;box-shadow:0 0 0 16px rgba(135,87,255,.03),0 0 48px rgba(110,78,255,.16),inset 0 0 35px rgba(62,181,255,.05);transform:perspective(240px) rotateX(68deg)}.fd-stage-character{position:absolute;z-index:3;left:3%;right:23%;top:3%;bottom:7%}.fd-stage-droid{position:absolute;z-index:4;right:3%;top:14%;width:31%;height:34%;filter:drop-shadow(0 0 18px rgba(132,83,255,.18))}.fd-stage-readout{position:absolute;z-index:6;bottom:20%;display:grid;gap:4px;padding:9px 10px;border:1px solid rgba(255,255,255,.045);border-radius:10px;background:rgba(4,5,9,.42);pointer-events:none}.fd-stage-readout.left{left:18px}.fd-stage-readout.right{right:18px;text-align:right}.fd-stage-readout span{margin-top:4px;color:#625d69;font-size:5px;font-weight:900;letter-spacing:.12em}.fd-stage-readout b{color:#bdb6c4;font-size:6px;letter-spacing:.08em}.fd-companion-live-stage[data-background=fate-network]{background:radial-gradient(circle at 50% 76%,rgba(112,71,255,.20),transparent 35%),linear-gradient(180deg,#080b15,#06070c)}.fd-companion-live-stage[data-background=command-room]{background:radial-gradient(circle at 46% 78%,rgba(67,196,255,.12),transparent 30%),linear-gradient(155deg,#0b0d16,#07070d)}.fd-companion-live-stage[data-background=card-vault]{background:radial-gradient(circle at 70% 28%,rgba(167,103,255,.11),transparent 30%),linear-gradient(180deg,#100b16,#07070c)}.fd-companion-live-stage[data-background=tournament-floor]{background:radial-gradient(circle at 50% 82%,rgba(79,232,210,.11),transparent 36%),linear-gradient(165deg,#0b1015,#07070c)}.fd-companion-live-stage[data-background=neon-desk]{background:radial-gradient(circle at 25% 24%,rgba(77,210,255,.11),transparent 28%),radial-gradient(circle at 78% 68%,rgba(165,83,255,.13),transparent 32%),#07070d}.fd-reaction-strip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin-top:8px}.fd-reaction-strip button{min-width:0;padding:8px 5px;border:1px solid rgba(255,255,255,.055);border-radius:9px;background:rgba(255,255,255,.018);color:#77717d;text-align:center}.fd-reaction-strip button[data-active=true]{border-color:rgba(117,234,255,.32);background:linear-gradient(135deg,rgba(117,234,255,.055),rgba(157,109,255,.09));color:#fff}.fd-reaction-strip strong{display:block;font-size:6px;letter-spacing:.04em}.fd-reaction-strip small{display:block;margin-top:3px;color:#5e5964;font-size:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fd-companion-controls{display:grid;gap:10px}.fd-control-block{padding:18px;border:1px solid rgba(255,255,255,.075);border-radius:18px;background:linear-gradient(145deg,rgba(14,13,21,.96),rgba(8,8,13,.98))}.fd-control-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:13px}.fd-control-heading h3{margin:4px 0 0;font-size:17px;letter-spacing:-.035em}.fd-control-heading>small{color:#625c68;font-size:5px;font-weight:900;letter-spacing:.12em}.fd-identity-grid,.fd-familiar-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fd-identity-grid button,.fd-familiar-grid button{position:relative;display:grid;gap:5px;min-height:116px;padding:14px;border:1px solid rgba(255,255,255,.065);border-radius:14px;background:rgba(255,255,255,.018);color:#fff;text-align:left}.fd-identity-grid button[data-active=true],.fd-familiar-grid button[data-active=true]{border-color:rgba(117,234,255,.34);background:linear-gradient(145deg,rgba(117,234,255,.045),rgba(157,109,255,.075));box-shadow:inset 0 0 0 1px rgba(157,109,255,.08)}.fd-identity-grid button>span{color:#6d6672;font-size:6px;font-weight:900;letter-spacing:.11em}.fd-identity-grid strong,.fd-familiar-grid strong{font-size:18px;letter-spacing:-.03em}.fd-identity-grid small,.fd-familiar-grid small{color:#706a76;font-size:7px;line-height:1.45}.fd-identity-grid button>b,.fd-familiar-grid button>b{position:absolute;right:10px;bottom:9px;color:#6ee8ff;font-size:5px;letter-spacing:.1em}.fd-chip-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.fd-chip-grid.scenes{grid-template-columns:1fr}.fd-chip-grid button,.fd-tcg-grid button{padding:10px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.018);color:#817b87;font-size:7px;font-weight:850;text-align:left}.fd-chip-grid button[data-active=true],.fd-tcg-grid button[data-active=true]{border-color:rgba(157,109,255,.3);background:rgba(157,109,255,.085);color:#fff}.fd-future-modules p{margin:0 0 13px;color:#7c7582;font-size:8px;line-height:1.6}.fd-future-modules>div:last-child{display:flex;gap:5px;flex-wrap:wrap}.fd-future-modules>div:last-child span{padding:6px 8px;border:1px dashed rgba(255,255,255,.07);border-radius:999px;color:#67616d;font-size:5px;font-weight:900;letter-spacing:.08em}.fd-tcg-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.fd-tcg-grid button{display:flex;justify-content:space-between;align-items:center}.fd-tcg-grid button span{color:#72eaff}.fd-companion-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:2px}.fd-companion-actions button{min-height:44px;border-radius:11px;font-size:7px;font-weight:900;letter-spacing:.08em}.fd-companion-actions .secondary{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);color:#aaa3af}.fd-companion-actions .primary{border:1px solid rgba(117,234,255,.22);background:linear-gradient(90deg,#6f42ff,#8c5cff);color:#fff;box-shadow:0 12px 30px rgba(111,66,255,.18)}.fd-companion-actions button:disabled{opacity:.55}.fd-companion-actions p{grid-column:1/-1;margin:2px 2px 0;color:#6d6673;font-size:7px}@media(max-width:1080px){.fd-companion-lab{grid-template-columns:1fr}.fd-companion-stage-column{position:relative;top:auto}.fd-companion-live-stage{min-height:560px}}@media(max-width:640px){.fd-companion-stage-column{padding:12px}.fd-companion-live-stage{min-height:440px}.fd-stage-character{right:10%}.fd-stage-droid{right:1%;width:38%;height:30%}.fd-stage-readout{display:none}.fd-reaction-strip{grid-template-columns:repeat(4,1fr)}.fd-control-heading{display:grid}.fd-identity-grid,.fd-familiar-grid,.fd-tcg-grid{grid-template-columns:1fr}.fd-companion-actions{grid-template-columns:1fr}}
      `}</style>
    </section>
  );
}
