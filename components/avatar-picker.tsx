"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import styles from "./avatar-picker.module.css";

const PRESETS = [
  { id: "signal-hood", label: "Signal Hood" },
  { id: "night-mask", label: "Night Mask" },
  { id: "void-cat", label: "Void Cat" },
  { id: "orbit-runner", label: "Orbit Runner" },
  { id: "signal-crown", label: "Signal Crown" },
  { id: "prism-core", label: "Prism Core" },
  { id: "radar-pulse", label: "Radar Pulse" },
  { id: "city-ghost", label: "City Ghost" },
  { id: "lunar-signal", label: "Lunar Signal" },
  { id: "blue-wolf", label: "Blue Wolf" },
  { id: "echo-portal", label: "Echo Portal" },
  { id: "shadow-samurai", label: "Shadow Samurai" },
] as const;

const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const MAX_STORED_DATA_URL = 300_000;
const OUTPUT_SIZE = 384;

function presetPath(id: string) {
  return `/assets/avatars/${id}.webp`;
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the processed avatar."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be opened."));
    };
    image.src = url;
  });
}

async function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

async function prepareAvatar(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error("Use a JPG, PNG or WEBP image.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Avatar uploads must be 5MB or smaller.");

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare that image.");

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  let blob = await canvasBlob(canvas, 0.84);
  if (!blob) throw new Error("Your browser could not compress that image.");
  if (blob.size > 180_000) blob = await canvasBlob(canvas, 0.66);
  if (!blob) throw new Error("Your browser could not compress that image.");

  const dataUrl = await readBlobAsDataUrl(blob);
  if (dataUrl.length > MAX_STORED_DATA_URL) throw new Error("That image is still too detailed after compression. Try another image.");
  return dataUrl;
}

export function AvatarPicker({ value, displayName, onChange }: { value: string; displayName: string; onChange: (value: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const initials = useMemo(() => displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "FD", [displayName]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      onChange(await prepareAvatar(file));
      setMessage("Custom avatar ready. Save profile to keep it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Avatar could not be prepared.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <section className={styles.picker} id="avatar-picker" aria-labelledby="avatar-picker-title">
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>FateDrop avatar</span>
          <h3 className={styles.title} id="avatar-picker-title">Choose your signal.</h3>
          <p className={styles.copy}>Pick a FateDrop preset or upload your own image. Your avatar follows your FateDrop ID across your profile and dashboard.</p>
        </div>
        <div className={styles.previewWrap}>
          <div className={styles.preview} aria-label="Current avatar preview">
            {value ? <span className={styles.previewImage} style={{ backgroundImage: `url("${value}")` }} /> : <strong>{initials}</strong>}
          </div>
          <span className={styles.previewLabel}>Live preview</span>
        </div>
      </div>

      <div className={styles.divider} />
      <div className={styles.sectionLabel}><strong>Preset avatars</strong><span>Choose one now · change anytime</span></div>
      <div className={styles.grid} role="list" aria-label="FateDrop preset avatars">
        {PRESETS.map((preset) => {
          const src = presetPath(preset.id);
          const active = value === src;
          return (
            <button className={`${styles.preset}${active ? ` ${styles.active}` : ""}`} type="button" key={preset.id} onClick={() => { onChange(src); setMessage(`${preset.label} selected. Save profile to keep it.`); }} aria-pressed={active} title={preset.label}>
              <span className={styles.thumb} style={{ backgroundImage: `url("${src}")` }} />
              <small className={styles.name}>{preset.label}</small>
              {active ? <b className={styles.check}>✓</b> : null}
            </button>
          );
        })}
      </div>

      <div className={styles.uploadPanel}>
        <div className={styles.uploadCopy}><strong>Upload your own</strong><span>JPG, PNG or WEBP · max 5MB · automatically cropped square and compressed.</span></div>
        <div className={styles.actions}>
          <input ref={fileRef} className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
          <button className={styles.uploadButton} type="button" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? "Preparing…" : "Choose image"}</button>
          {value ? <button className={styles.removeButton} type="button" onClick={() => { onChange(""); setMessage("Avatar removed. Save profile to keep the change."); }}>Remove</button> : null}
        </div>
      </div>
      {message ? <p className={styles.status} role="status">{message}</p> : null}
    </section>
  );
}
