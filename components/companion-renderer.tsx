"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { KoruMascot } from "@/components/koru-mascot";
import {
  companionDefinition,
  type CompanionClipName,
  type CompanionReaction,
  type CompanionRenderRequest,
} from "@/lib/companion-contract";

const REQUIRED_CLIPS: readonly CompanionClipName[] = ["Idle", "Whisper", "Echo", "Manifested", "Vanished", "FateMatch"];
const ONE_SHOT_CLIPS = new Set<CompanionClipName>(["Manifested", "Vanished", "FateMatch"]);

type Runtime = {
  mixer: THREE.AnimationMixer;
  actions: Map<CompanionClipName, THREE.AnimationAction>;
  activeAction: THREE.AnimationAction | null;
  desiredClip: CompanionClipName | null;
  oneShotSettled: boolean;
  reducedMotion: boolean;
};

function CompanionPlaceholder({
  name,
  slot,
  compact = false,
  message = "3D model slot ready",
}: {
  name: string;
  slot: number;
  compact?: boolean;
  message?: string;
}) {
  return (
    <div className={`companion-placeholder${compact ? " compact" : ""}`} aria-label={`${name} companion preview`}>
      <div className="companion-orbit" aria-hidden="true"><i/><i/><i/></div>
      <div className="companion-monogram" aria-hidden="true">{name.slice(0, 1)}</div>
      <div className="companion-status">
        <small>SLOT {String(slot).padStart(2, "0")} · ORU &amp; FRIENDS</small>
        <strong>{name}</strong>
        <span>{message}</span>
      </div>
      <style jsx>{`
        .companion-placeholder{position:relative;isolation:isolate;min-height:440px;overflow:hidden;border:1px solid rgba(205,187,207,.12);border-radius:24px;background:radial-gradient(circle at 50% 38%,rgba(132,96,147,.18),transparent 30%),linear-gradient(145deg,#11131a,#080a0f);display:grid;place-items:center}.companion-placeholder.compact{min-height:230px;border-radius:18px}.companion-orbit{position:absolute;width:58%;aspect-ratio:1;border:1px solid rgba(184,146,194,.13);border-radius:46% 54% 42% 58%;transform:rotate(28deg)}.companion-orbit i{position:absolute;inset:10%;border:1px solid rgba(184,146,194,.08);border-radius:58% 42% 51% 49%;transform:rotate(24deg)}.companion-orbit i:nth-child(2){inset:25%;transform:rotate(54deg)}.companion-orbit i:nth-child(3){inset:42%;border-color:rgba(207,172,215,.2);background:rgba(133,96,149,.06)}.companion-monogram{position:relative;z-index:2;color:#ded1d7;font-family:Georgia,serif;font-size:clamp(5rem,9vw,8rem);font-weight:500;opacity:.75;text-shadow:0 0 48px rgba(168,124,184,.18)}.companion-status{position:absolute;z-index:3;left:20px;right:20px;bottom:18px;display:grid;gap:4px;padding:12px 14px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:rgba(7,8,12,.72);backdrop-filter:blur(12px)}.companion-status small{color:#9c7da5;font-size:6px;font-weight:900;letter-spacing:.14em}.companion-status strong{color:#eee5df;font-family:Georgia,serif;font-size:19px;font-weight:500}.companion-status span{color:#8a838b;font-size:8px}.compact .companion-status{left:10px;right:10px;bottom:9px;padding:8px 9px}.compact .companion-status strong{font-size:14px}.compact .companion-status span{font-size:7px}
      `}</style>
    </div>
  );
}

function disposeScene(root: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry?.dispose();
    const list = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of list) {
      if (!material || materials.has(material)) continue;
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture && !textures.has(value)) {
          value.dispose();
          textures.add(value);
        }
      }
      material.dispose();
      materials.add(material);
    }
  });
}

function fitModel(model: THREE.Object3D) {
  model.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) throw new Error("Character model contains no visible geometry.");
  const size = box.getSize(new THREE.Vector3());
  const height = Math.max(size.y, 0.0001);
  model.scale.multiplyScalar(1.72 / height);
  model.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= center.y + 0.05;
  model.position.z -= center.z;
  model.updateMatrixWorld(true);
}

function applyTexture(model: THREE.Object3D, texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.46,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  let count = 0;
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    count += 1;
    const prior = Array.isArray(child.material) ? child.material : [child.material];
    prior.forEach((entry) => entry?.dispose());
    child.material = material;
    child.castShadow = false;
    child.receiveShadow = false;
  });
  if (!count) {
    material.dispose();
    texture.dispose();
    throw new Error("Character model contains no mesh.");
  }
}

function playRuntimeClip(runtime: Runtime, clip: CompanionClipName) {
  if (runtime.desiredClip === clip) return;
  const next = runtime.actions.get(clip) ?? runtime.actions.get("Idle");
  if (!next) return;

  next.enabled = true;
  next.reset();
  next.setEffectiveWeight(1);
  next.setEffectiveTimeScale(1);
  next.clampWhenFinished = ONE_SHOT_CLIPS.has(clip);
  next.setLoop(ONE_SHOT_CLIPS.has(clip) ? THREE.LoopOnce : THREE.LoopRepeat, ONE_SHOT_CLIPS.has(clip) ? 1 : Infinity);
  next.play();
  if (runtime.activeAction && runtime.activeAction !== next) runtime.activeAction.crossFadeTo(next, 0.22, false);
  runtime.activeAction = next;
  runtime.desiredClip = clip;
  runtime.oneShotSettled = false;

  if (runtime.reducedMotion) {
    runtime.mixer.update(0);
    next.paused = true;
  }
}

function settleOneShot(runtime: Runtime) {
  if (!runtime.activeAction || !runtime.desiredClip || runtime.oneShotSettled || !ONE_SHOT_CLIPS.has(runtime.desiredClip)) return;
  const duration = runtime.activeAction.getClip().duration;
  if (runtime.activeAction.time < Math.max(0, duration - 0.06)) return;
  const idle = runtime.actions.get("Idle");
  if (!idle) return;
  idle.enabled = true;
  idle.reset().setLoop(THREE.LoopRepeat, Infinity).play();
  runtime.activeAction.crossFadeTo(idle, 0.24, false);
  runtime.activeAction = idle;
  runtime.oneShotSettled = true;
}

function CompanionWebGl({ request }: { request: CompanionRenderRequest }) {
  const definition = useMemo(() => companionDefinition(request.companionId), [request.companionId]);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let cancelled = false;
    let frameId = 0;
    let model: THREE.Object3D | null = null;
    let loadedTexture: THREE.Texture | null = null;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    setStatus("loading");
    setError(null);
    runtimeRef.current = null;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "WebGL is unavailable on this device.");
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(27, 1, 0.01, 100);
    camera.position.set(0, 0.03, 4.05);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xf2eee6, 0x16111d, 1.65));
    const key = new THREE.DirectionalLight(0xfff8ed, 2.05);
    key.position.set(3.2, 4.8, 4.2);
    scene.add(key);
    const violet = new THREE.DirectionalLight(0xb799c7, 0.9);
    violet.position.set(-4, 2.4, 2.2);
    scene.add(violet);
    const sage = new THREE.DirectionalLight(0x9bc9c1, 0.38);
    sage.position.set(3, -0.8, 1.6);
    scene.add(sage);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    Promise.all([
      gltfLoader.loadAsync(definition.modelUrl),
      textureLoader.loadAsync(definition.textureUrl),
    ]).then(([loaded, texture]) => {
      if (cancelled) {
        texture.dispose();
        return;
      }
      loadedTexture = texture;
      model = loaded.scene ?? loaded.scenes?.[0] ?? null;
      if (!model) throw new Error(`${definition.name} model contains no scene.`);

      applyTexture(model, texture);
      fitModel(model);
      scene.add(model);

      const clipNames = new Set(loaded.animations.map((clip) => clip.name));
      const missing = REQUIRED_CLIPS.filter((clip) => !clipNames.has(clip));
      if (missing.length) throw new Error(`${definition.name} is missing clips: ${missing.join(", ")}`);

      const mixer = new THREE.AnimationMixer(model);
      const actions = new Map<CompanionClipName, THREE.AnimationAction>();
      loaded.animations.forEach((clip) => {
        if ((REQUIRED_CLIPS as readonly string[]).includes(clip.name)) {
          actions.set(clip.name as CompanionClipName, mixer.clipAction(clip));
        }
      });

      const runtime: Runtime = {
        mixer,
        actions,
        activeAction: null,
        desiredClip: null,
        oneShotSettled: false,
        reducedMotion,
      };
      runtimeRef.current = runtime;
      playRuntimeClip(runtime, definition.animationClips[request.reaction]);
      setStatus("ready");

      const clock = new THREE.Clock();
      const frame = () => {
        if (cancelled) return;
        frameId = requestAnimationFrame(frame);
        if (!runtime.reducedMotion) {
          runtime.mixer.update(Math.min(clock.getDelta(), 0.05));
          settleOneShot(runtime);
        }
        renderer.render(scene, camera);
      };
      frame();
    }).catch((cause) => {
      if (cancelled) return;
      setError(cause instanceof Error ? cause.message : `${definition.name} could not be loaded.`);
      setStatus("error");
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      runtimeRef.current?.mixer.stopAllAction();
      runtimeRef.current = null;
      if (model) {
        scene.remove(model);
        disposeScene(model);
      } else {
        loadedTexture?.dispose();
      }
      renderer.dispose();
    };
  }, [definition.id, definition.modelUrl, definition.name, definition.textureUrl]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    playRuntimeClip(runtime, definition.animationClips[request.reaction]);
  }, [definition, request.reaction]);

  if (status === "error") {
    if (definition.id === "oru") {
      return <KoruMascot reaction={request.reaction} compact={request.compact} label={request.label ?? "Oru"}/>;
    }
    return <CompanionPlaceholder name={definition.name} slot={definition.slot} compact={request.compact} message={error ?? "3D asset unavailable"}/>;
  }

  return (
    <div ref={hostRef} className={`oru-stage${request.compact ? " compact" : ""}`} aria-label={`${definition.name} 3D companion`}>
      <div className="paper-glow" aria-hidden="true" />
      <div className="signal-moon" aria-hidden="true" />
      <div className="signal-hill" aria-hidden="true" />
      <canvas ref={canvasRef} className="oru-canvas" />
      {status === "loading" ? <div className="oru-loading"><span className="loading-dot"/><strong>{definition.name === "Oru" ? "ORU IS TRACING THE SIGNAL" : `CALLING ${definition.name.toUpperCase()}`}</strong><small>Preparing the Oru &amp; Friends stage…</small></div> : null}
      <div className="identity-chip"><small>{definition.code}</small><div><strong>{definition.name}</strong><span>{definition.role}</span></div></div>
      <div className="reaction-chip"><i className={status === "ready" ? "ready" : ""}/><span>{status === "ready" ? definition.animationClips[request.reaction].toUpperCase() : "LOADING"}</span></div>
      <style jsx>{`
        .oru-stage{position:relative;isolation:isolate;min-height:440px;overflow:hidden;border:1px solid rgba(205,187,207,.14);border-radius:24px;background:linear-gradient(155deg,#11131a 0%,#090b10 58%,#0c1010 100%)}.oru-stage.compact{min-height:230px;border-radius:18px}.oru-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:3}.paper-glow{position:absolute;z-index:1;width:70%;aspect-ratio:1;left:-22%;top:-38%;border-radius:50%;background:rgba(157,121,164,.12);filter:blur(1px)}.signal-moon{position:absolute;z-index:1;width:26%;aspect-ratio:1;right:-5%;top:15%;border:1px solid rgba(229,216,202,.13);border-radius:50%;background:rgba(230,219,207,.025)}.signal-hill{position:absolute;z-index:1;width:120%;height:42%;left:-10%;bottom:-34%;border:1px solid rgba(128,159,150,.12);border-radius:50%;background:rgba(83,116,106,.035);transform:rotate(-3deg)}.oru-loading{position:absolute;inset:0;z-index:5;display:grid;place-content:center;justify-items:center;gap:7px;pointer-events:none}.oru-loading .loading-dot{width:8px;height:8px;border-radius:50%;background:#b79ac0;box-shadow:0 0 0 8px rgba(183,154,192,.06);animation:pulse 1.4s ease-in-out infinite}.oru-loading strong{margin-top:7px;color:#eee7e2;font-size:9px;letter-spacing:.14em}.oru-loading small{color:#807983;font-size:8px}.identity-chip,.reaction-chip{position:absolute;z-index:6;bottom:13px;border:1px solid rgba(255,255,255,.08);background:rgba(8,9,13,.76);backdrop-filter:blur(12px)}.identity-chip{left:13px;display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:14px}.identity-chip>small{color:#b99bc2;font-size:6px;font-weight:900;letter-spacing:.14em}.identity-chip div{display:grid;gap:1px}.identity-chip strong{color:#eee6e1;font-family:Georgia,serif;font-size:14px;font-weight:500}.identity-chip span{color:#7f7880;font-size:7px}.reaction-chip{right:13px;display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:999px}.reaction-chip i{width:6px;height:6px;border-radius:50%;background:#665f68}.reaction-chip i.ready{background:#85b8a8}.reaction-chip span{color:#9e969f;font-size:6px;font-weight:900;letter-spacing:.11em}.compact .identity-chip,.compact .reaction-chip{bottom:8px}.compact .identity-chip{left:8px}.compact .reaction-chip{right:8px}.compact .identity-chip span{display:none}@keyframes pulse{0%,100%{opacity:.45;transform:scale(.86)}50%{opacity:1;transform:scale(1)}}@media(prefers-reduced-motion:reduce){.oru-loading .loading-dot{animation:none}}
      `}</style>
    </div>
  );
}

export function CompanionRenderer({ request }: { request: CompanionRenderRequest }) {
  const definition = companionDefinition(request.companionId);
  if (!definition.modelUrl) {
    if (definition.id === "oru") return <KoruMascot reaction={request.reaction} compact={request.compact} label={request.label ?? "Oru"}/>;
    return <CompanionPlaceholder name={definition.name} slot={definition.slot} compact={request.compact}/>;
  }
  return <CompanionWebGl request={request}/>;
}
