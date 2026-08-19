"use client";

import { createElement, useEffect, useState } from "react";
import { AvatarPreview, type AvatarMood } from "@/components/avatar-preview";
import {
  DEFAULT_COMPANION_ASSET_MANIFEST,
  companionRendererMode,
  type CompanionAssetManifest,
  type CompanionReaction,
  type CompanionRenderRequest,
} from "@/lib/companion-contract";

const MODEL_VIEWER_SCRIPT_ID = "fatedrop-model-viewer-runtime";
const MODEL_VIEWER_SCRIPT_URL = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";

let modelViewerRuntimePromise: Promise<void> | null = null;

function fallbackMood(reaction: CompanionRenderRequest["reaction"]): AvatarMood {
  if (reaction === "echo") return "whisper";
  if (reaction === "manifested") return "manifested";
  if (reaction === "vanished") return "alert";
  if (reaction === "fatematch") return "match";
  if (reaction === "major") return "major";
  if (reaction === "watching") return "watching";
  return "idle";
}

function reactionPresentation(reaction: CompanionReaction) {
  switch (reaction) {
    case "echo":
      return { orbit: "-9deg 74deg auto", rotation: "18deg", exposure: "1.08" };
    case "manifested":
      return { orbit: "8deg 72deg auto", rotation: "24deg", exposure: "1.16" };
    case "vanished":
      return { orbit: "-4deg 78deg auto", rotation: "5deg", exposure: "0.88" };
    case "fatematch":
      return { orbit: "11deg 73deg auto", rotation: "20deg", exposure: "1.14" };
    case "major":
      return { orbit: "-13deg 70deg auto", rotation: "30deg", exposure: "1.2" };
    case "watching":
      return { orbit: "5deg 75deg auto", rotation: "11deg", exposure: "1.02" };
    default:
      return { orbit: "0deg 76deg auto", rotation: "7deg", exposure: "1" };
  }
}

function ensureModelViewerRuntime() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.customElements?.get("model-viewer")) return Promise.resolve();
  if (modelViewerRuntimePromise) return modelViewerRuntimePromise;

  modelViewerRuntimePromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(MODEL_VIEWER_SCRIPT_ID) as HTMLScriptElement | null;
    const finish = () => {
      if (!window.customElements) {
        reject(new Error("Custom elements are unavailable in this browser."));
        return;
      }
      window.customElements.whenDefined("model-viewer").then(() => resolve()).catch(reject);
    };

    if (existing) {
      if (window.customElements?.get("model-viewer")) resolve();
      else {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => reject(new Error("FateDrop 3D runtime failed to load.")), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = MODEL_VIEWER_SCRIPT_ID;
    script.type = "module";
    script.src = MODEL_VIEWER_SCRIPT_URL;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("FateDrop 3D runtime failed to load.")), { once: true });
    document.head.appendChild(script);
  });

  return modelViewerRuntimePromise;
}

export function CompanionRenderer({ request, manifest = DEFAULT_COMPANION_ASSET_MANIFEST }: { request: CompanionRenderRequest; manifest?: CompanionAssetManifest }) {
  const mode = request.mode ?? companionRendererMode(manifest);
  const wants3d = mode === "webgl-3d" && Boolean(manifest.characterModelUrl);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [runtimeFailed, setRuntimeFailed] = useState(false);

  useEffect(() => {
    if (!wants3d) return;
    let active = true;
    setModelLoaded(false);
    setRuntimeFailed(false);
    void ensureModelViewerRuntime().catch(() => {
      if (active) setRuntimeFailed(true);
    });
    return () => {
      active = false;
    };
  }, [wants3d, manifest.characterModelUrl]);

  if (!wants3d) {
    return <AvatarPreview loadout={request.loadout} mood={fallbackMood(request.reaction)} compact={request.compact} label={request.label ?? "FateDrop Companion"}/>;
  }

  const presentation = reactionPresentation(request.reaction);
  const label = request.label ?? "FateDrop Companion";
  const modelViewerProps: Record<string, unknown> = {
    src: manifest.characterModelUrl ?? undefined,
    alt: label,
    className: "fd-companion-model-viewer",
    loading: request.compact ? "lazy" : "eager",
    reveal: "auto",
    "camera-orbit": presentation.orbit,
    "field-of-view": request.compact ? "31deg" : "27deg",
    "min-field-of-view": "22deg",
    "max-field-of-view": "40deg",
    exposure: presentation.exposure,
    "tone-mapping": "commerce",
    "environment-image": "neutral",
    "shadow-intensity": "0.95",
    "shadow-softness": "0.85",
    "interaction-prompt": "none",
    "auto-rotate": true,
    "auto-rotate-delay": "0",
    "rotation-per-second": presentation.rotation,
    "camera-controls": request.compact ? undefined : true,
    "disable-zoom": request.compact ? true : undefined,
    "touch-action": "pan-y",
    onLoad: () => setModelLoaded(true),
    onError: () => setRuntimeFailed(true),
  };

  return <div className="fd-companion-3d-stage" data-compact={request.compact ? "true" : "false"} data-ready={modelLoaded && !runtimeFailed ? "true" : "false"} data-reaction={request.reaction} aria-label={label}>
    <div className="fd-companion-3d-grid" aria-hidden="true"/>
    <div className="fd-companion-3d-fallback">
      <AvatarPreview loadout={request.loadout} mood={fallbackMood(request.reaction)} compact={request.compact} label={label}/>
    </div>
    {!runtimeFailed ? createElement("model-viewer", modelViewerProps) : null}
    <div className="fd-companion-3d-aura" aria-hidden="true"/>
    {!request.compact ? <div className="fd-companion-3d-badge"><span>{runtimeFailed ? "2D FALLBACK" : modelLoaded ? "3D SENTINEL · LIVE" : "3D SENTINEL · LOADING"}</span><i/></div> : null}
    <style jsx global>{`
      .fd-companion-3d-stage{position:relative;isolation:isolate;width:100%;aspect-ratio:4/5;min-height:320px;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:20px;background:radial-gradient(circle at 50% 31%,rgba(133,99,255,.18),transparent 31%),radial-gradient(circle at 68% 66%,rgba(76,225,255,.09),transparent 30%),linear-gradient(160deg,#0e0c17 0%,#07080d 62%,#05070a 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 28px 70px rgba(0,0,0,.28)}
      .fd-companion-3d-stage[data-compact="true"]{aspect-ratio:1/1;min-height:180px;border-radius:15px}
      .fd-companion-3d-stage:before{content:"";position:absolute;z-index:0;left:50%;bottom:-22%;width:72%;aspect-ratio:1;border:1px solid rgba(112,233,251,.11);border-radius:50%;transform:translateX(-50%) rotateX(67deg);box-shadow:0 0 0 28px rgba(154,104,255,.025),0 0 55px rgba(95,224,255,.07)}
      .fd-companion-3d-grid{position:absolute;z-index:0;inset:47% -15% -25%;opacity:.13;background-image:linear-gradient(rgba(124,220,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(124,220,255,.18) 1px,transparent 1px);background-size:28px 28px;transform:perspective(360px) rotateX(61deg);transform-origin:center top;mask-image:linear-gradient(to bottom,rgba(0,0,0,.85),transparent 78%)}
      .fd-companion-3d-fallback{position:absolute;z-index:1;inset:0;display:grid;place-items:center;transition:opacity .38s ease,transform .45s ease;transform:scale(1);opacity:1}
      .fd-companion-3d-stage[data-ready="true"] .fd-companion-3d-fallback{opacity:0;transform:scale(1.025);pointer-events:none}
      .fd-companion-model-viewer{position:absolute;z-index:2;inset:0;width:100%;height:100%;display:block;opacity:0;background:transparent;--poster-color:transparent;transition:opacity .45s ease;filter:drop-shadow(0 24px 22px rgba(0,0,0,.36))}
      .fd-companion-3d-stage[data-ready="true"] .fd-companion-model-viewer{opacity:1}
      .fd-companion-3d-aura{position:absolute;z-index:3;left:50%;top:14%;width:48%;aspect-ratio:1;border-radius:50%;transform:translateX(-50%);background:radial-gradient(circle,rgba(139,107,255,.12),rgba(87,229,255,.045) 42%,transparent 70%);filter:blur(18px);pointer-events:none;mix-blend-mode:screen}
      .fd-companion-3d-stage[data-reaction="echo"] .fd-companion-3d-aura,.fd-companion-3d-stage[data-reaction="fatematch"] .fd-companion-3d-aura{background:radial-gradient(circle,rgba(91,235,255,.18),rgba(133,104,255,.07) 45%,transparent 72%)}
      .fd-companion-3d-stage[data-reaction="manifested"] .fd-companion-3d-aura{background:radial-gradient(circle,rgba(93,244,183,.17),rgba(106,220,255,.06) 48%,transparent 72%)}
      .fd-companion-3d-stage[data-reaction="major"] .fd-companion-3d-aura{background:radial-gradient(circle,rgba(202,109,255,.23),rgba(91,235,255,.09) 47%,transparent 73%)}
      .fd-companion-3d-badge{position:absolute;z-index:5;left:14px;bottom:14px;display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(112,233,251,.13);border-radius:999px;background:rgba(5,8,12,.64);backdrop-filter:blur(14px);color:#8e8795;font-size:6px;font-weight:900;letter-spacing:.12em;pointer-events:none}
      .fd-companion-3d-badge i{width:5px;height:5px;border-radius:50%;background:#71eaff;box-shadow:0 0 10px rgba(113,234,255,.72)}
      .fd-companion-3d-stage[data-ready="true"] .fd-companion-3d-badge{color:#b9f6ff;border-color:rgba(112,233,251,.24)}
      @media(max-width:560px){.fd-companion-3d-stage{min-height:280px;border-radius:17px}.fd-companion-3d-stage[data-compact="true"]{min-height:150px}}
      @media(prefers-reduced-motion:reduce){.fd-companion-model-viewer,.fd-companion-3d-fallback{transition:none}}
    `}</style>
  </div>;
}
