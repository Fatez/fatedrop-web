"use client";

import { useEffect, useRef, useState } from "react";
import {
  COMPANION_ASSETS,
  COMPANION_VARIANTS,
  type CompanionAssetDefinition,
  type CompanionBounds,
  type CompanionVariant,
  validateCompanionGeometry,
} from "@/lib/companion-assets";

type Reaction = "idle" | "watching" | "echo" | "manifested" | "vanished" | "fatematch" | "major";
type Accessor = {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4";
  normalized?: boolean;
};
type Primitive = { attributes: Record<string, number>; indices?: number };
type GlbDocument = {
  accessors: Accessor[];
  bufferViews: { byteOffset?: number; byteStride?: number }[];
  meshes: { primitives: Primitive[] }[];
};
type Mesh = {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
};

const REACTIONS: { id: Reaction; label: string }[] = [
  { id: "idle", label: "Idle" },
  { id: "watching", label: "Watching" },
  { id: "echo", label: "Echo" },
  { id: "manifested", label: "Manifested" },
  { id: "vanished", label: "Vanished" },
  { id: "fatematch", label: "FateMatch" },
  { id: "major", label: "Major" },
];

const BYTES: Record<number, number> = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const SIZES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 } as const;

function component(view: DataView, offset: number, type: number) {
  if (type === 5120) return view.getInt8(offset);
  if (type === 5121) return view.getUint8(offset);
  if (type === 5122) return view.getInt16(offset, true);
  if (type === 5123) return view.getUint16(offset, true);
  if (type === 5125) return view.getUint32(offset, true);
  if (type === 5126) return view.getFloat32(offset, true);
  throw new Error(`Unsupported GLB component ${type}.`);
}

function accessor(document: GlbDocument, binary: ArrayBuffer, index: number) {
  const item = document.accessors[index];
  if (!item || item.bufferView == null) throw new Error("Sparse Companion accessors are unsupported.");
  const bufferView = document.bufferViews[item.bufferView];
  if (!bufferView) throw new Error("Companion buffer view is missing.");
  const size = SIZES[item.type];
  const bytes = BYTES[item.componentType];
  if (!size || !bytes) throw new Error("Unsupported Companion accessor layout.");
  const stride = bufferView.byteStride || size * bytes;
  const start = (bufferView.byteOffset || 0) + (item.byteOffset || 0);
  const source = new DataView(binary);
  const output = new Float32Array(item.count * size);

  for (let row = 0; row < item.count; row += 1) {
    for (let col = 0; col < size; col += 1) {
      let value = component(source, start + row * stride + col * bytes, item.componentType);
      if (item.normalized) {
        if (item.componentType === 5120) value = Math.max(value / 127, -1);
        else if (item.componentType === 5121) value /= 255;
        else if (item.componentType === 5122) value = Math.max(value / 32767, -1);
        else if (item.componentType === 5123) value /= 65535;
      }
      output[row * size + col] = value;
    }
  }
  return output;
}

function calculateBounds(positions: Float32Array): CompanionBounds {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    minY = Math.min(minY, positions[i + 1]);
    minZ = Math.min(minZ, positions[i + 2]);
    maxX = Math.max(maxX, positions[i]);
    maxY = Math.max(maxY, positions[i + 1]);
    maxZ = Math.max(maxZ, positions[i + 2]);
  }
  return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
}

function calculateNormals(positions: Float32Array, indices: Uint16Array) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i + 2 < indices.length; i += 3) {
    const ia = indices[i] * 3, ib = indices[i + 1] * 3, ic = indices[i + 2] * 3;
    const abx = positions[ib] - positions[ia], aby = positions[ib + 1] - positions[ia + 1], abz = positions[ib + 2] - positions[ia + 2];
    const acx = positions[ic] - positions[ia], acy = positions[ic + 1] - positions[ia + 1], acz = positions[ic + 2] - positions[ia + 2];
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    for (const index of [ia, ib, ic]) {
      normals[index] += nx;
      normals[index + 1] += ny;
      normals[index + 2] += nz;
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= length;
    normals[i + 1] /= length;
    normals[i + 2] /= length;
  }
  return normals;
}

function expandColors(rawColors: Float32Array | null, vertexCount: number, asset: CompanionAssetDefinition) {
  const colors = new Float32Array(vertexCount * 4);
  const components = rawColors ? rawColors.length / vertexCount : 0;
  for (let vertex = 0; vertex < vertexCount; vertex += 1) {
    const output = vertex * 4;
    if (rawColors && (components === 3 || components === 4)) {
      const input = vertex * components;
      colors[output] = rawColors[input];
      colors[output + 1] = rawColors[input + 1];
      colors[output + 2] = rawColors[input + 2];
    } else if (asset.role === "droid") {
      colors[output] = 0.12;
      colors[output + 1] = 0.13;
      colors[output + 2] = 0.17;
    } else {
      colors[output] = 0.38;
      colors[output + 1] = 0.33;
      colors[output + 2] = 0.48;
    }
    colors[output + 3] = 1;
  }
  return colors;
}

function parseGlb(buffer: ArrayBuffer, asset: CompanionAssetDefinition): Mesh {
  const view = new DataView(buffer);
  if (buffer.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) {
    throw new Error(`${asset.label} is not a valid GLB v2 asset.`);
  }

  let offset = 12;
  let document: GlbDocument | null = null;
  let binary: ArrayBuffer | null = null;
  while (offset + 8 <= buffer.byteLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (type === 0x4e4f534a) document = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, start, length)).trim()) as GlbDocument;
    if (type === 0x004e4942) binary = buffer.slice(start, start + length);
    offset = start + length;
  }
  if (!document || !binary) throw new Error(`${asset.label} GLB is incomplete.`);

  const primitive = document.meshes?.[0]?.primitives?.[0];
  if (!primitive || primitive.indices == null || primitive.attributes.POSITION == null) {
    throw new Error(`${asset.label} mesh is incomplete.`);
  }

  const rawPositions = accessor(document, binary, primitive.attributes.POSITION);
  const rawColors = primitive.attributes.COLOR_0 == null ? null : accessor(document, binary, primitive.attributes.COLOR_0);
  const rawIndices = accessor(document, binary, primitive.indices);
  const rawBounds = calculateBounds(rawPositions);
  const geometryError = validateCompanionGeometry(asset, rawBounds);
  if (geometryError) throw new Error(geometryError);

  const min = rawBounds.min, max = rawBounds.max;
  const width = Math.max(max[0] - min[0], 0.0001);
  const height = Math.max(max[1] - min[1], 0.0001);
  const depth = Math.max(max[2] - min[2], 0.0001);
  const cx = (min[0] + max[0]) / 2, cy = (min[1] + max[1]) / 2, cz = (min[2] + max[2]) / 2;
  const scale = asset.role === "humanoid" ? 1.72 / height : 1.30 / Math.max(width, height, depth);
  const positions = new Float32Array(rawPositions.length);
  for (let i = 0; i < rawPositions.length; i += 3) {
    positions[i] = (rawPositions[i] - cx) * scale;
    positions[i + 1] = (rawPositions[i + 1] - cy) * scale;
    positions[i + 2] = (rawPositions[i + 2] - cz) * scale;
  }

  const vertexCount = positions.length / 3;
  const maxIndex = rawIndices.reduce((current, value) => Math.max(current, value), 0);
  if (maxIndex >= vertexCount) throw new Error(`${asset.label} contains invalid mesh indices.`);
  if (maxIndex > 65535) throw new Error(`${asset.label} exceeds the lightweight Companion mesh limit.`);
  const indices = new Uint16Array(rawIndices.length);
  for (let i = 0; i < rawIndices.length; i += 1) indices[i] = rawIndices[i];

  return {
    positions,
    normals: calculateNormals(positions, indices),
    colors: expandColors(rawColors, vertexCount, asset),
    indices,
  };
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create Companion shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Companion shader failed.");
  return shader;
}

function tint(reaction: Reaction): [number, number, number] {
  if (reaction === "manifested" || reaction === "fatematch") return [0.36, 1, 0.72];
  if (reaction === "vanished") return [1, 0.32, 0.46];
  if (reaction === "echo" || reaction === "major") return [0.64, 0.31, 1];
  if (reaction === "watching") return [0.30, 0.84, 1];
  return [0.72, 0.48, 1];
}

function render(canvas: HTMLCanvasElement, mesh: Mesh, reaction: Reaction, asset: CompanionAssetDefinition, stopped: () => boolean) {
  const context = canvas.getContext("webgl", { alpha: true, antialias: true });
  if (!context) throw new Error("WebGL is unavailable on this device.");
  const gl: WebGLRenderingContext = context;
  const vs = compile(gl, gl.VERTEX_SHADER, `
    precision mediump float;
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec4 aColor;
    uniform float uAngle;
    uniform float uAspect;
    uniform float uBob;
    varying vec4 vColor;
    varying vec3 vNormal;
    void main(){
      float c=cos(uAngle),s=sin(uAngle);
      mat3 r=mat3(c,0.0,-s,0.0,1.0,0.0,s,0.0,c);
      vec3 p=r*aPosition;
      float a=max(uAspect,0.01);
      if(a>1.0)p.x/=a;else p.y*=a;
      p.y+=uBob;
      gl_Position=vec4(p.x,p.y,p.z*0.42,1.0);
      vColor=aColor;
      vNormal=normalize(r*aNormal);
    }
  `);
  const fs = compile(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec3 uTint;
    varying vec4 vColor;
    varying vec3 vNormal;
    void main(){
      vec3 key=normalize(vec3(-0.35,0.72,0.72));
      float diffuse=0.56+0.50*max(dot(normalize(vNormal),key),0.0);
      vec3 base=max(vColor.rgb,vec3(0.075));
      vec3 material=mix(base,uTint,0.09);
      vec3 lit=min(material*diffuse+uTint*0.028,vec3(1.0));
      gl_FragColor=vec4(lit,1.0);
    }
  `);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create Companion program.");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Companion program failed.");
  gl.useProgram(program);

  const bind = (name: string, data: Float32Array, size: number) => {
    const location = gl.getAttribLocation(program, name);
    if (location < 0) return;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  };
  bind("aPosition", mesh.positions, 3);
  bind("aNormal", mesh.normals, 3);
  bind("aColor", mesh.colors, 4);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  const color = tint(reaction);
  gl.uniform3f(gl.getUniformLocation(program, "uTint"), color[0], color[1], color[2]);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  const started = performance.now();
  let frameId = 0;
  const frame = (now: number) => {
    if (stopped()) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const time = (now - started) / 1000;
    const speed = reaction === "major" ? 0.48 : reaction === "echo" ? 0.34 : 0.20;
    const bob = asset.role === "droid" ? Math.sin(time * 1.7) * 0.035 : Math.sin(time * 1.35) * 0.008;
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(gl.getUniformLocation(program, "uAngle"), Math.sin(time * speed) * (asset.role === "droid" ? 0.38 : 0.20));
    gl.uniform1f(gl.getUniformLocation(program, "uAspect"), width / Math.max(1, height));
    gl.uniform1f(gl.getUniformLocation(program, "uBob"), bob);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    frameId = requestAnimationFrame(frame);
  };
  frameId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(frameId);
}

export function CompanionModelCanvas({
  variant,
  reaction = "idle",
  className = "",
  showStatus = true,
}: {
  variant: CompanionVariant;
  reaction?: Reaction;
  className?: string;
  showStatus?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const generation = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const asset = COMPANION_ASSETS[variant];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || asset.state !== "ready") return;
    const mine = ++generation.current;
    let cleanup: (() => void) | undefined;
    const stopped = () => generation.current !== mine;
    setLoading(true);
    setError(null);

    fetch(asset.file, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`${asset.label} asset returned ${response.status}.`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (stopped()) return;
        cleanup = render(canvas, parseGlb(buffer, asset), reaction, asset, stopped);
        if (!stopped()) setLoading(false);
      })
      .catch((cause: unknown) => {
        if (stopped()) return;
        setLoading(false);
        setError(cause instanceof Error ? cause.message : `${asset.label} 3D preview unavailable.`);
      });

    return () => {
      generation.current += 1;
      cleanup?.();
    };
  }, [asset, reaction]);

  const unavailable = asset.state !== "ready" ? asset.unavailableMessage || `${asset.label} is temporarily unavailable.` : error;

  return <div className={`fd-companion-model ${className}`} data-role={asset.role} data-variant={variant}>
    {asset.state === "ready" ? <canvas ref={canvasRef} aria-label={`${asset.label} 3D model`} /> : null}
    {showStatus && loading ? <div className="fd-model-status">INITIALISING {asset.label.toUpperCase()}</div> : null}
    {showStatus && unavailable ? <div className="fd-model-fallback"><strong>FD</strong><span>{asset.label} unavailable</span><small>{unavailable}</small></div> : null}
    <style jsx>{`
      .fd-companion-model{position:absolute;inset:0;z-index:3}.fd-companion-model canvas{position:absolute;inset:0;width:100%;height:100%}.fd-model-status,.fd-model-fallback{position:absolute;z-index:6;inset:0;display:flex;align-items:center;justify-content:center;color:#8a8390;font:900 8px/1.4 system-ui;letter-spacing:.13em}.fd-model-fallback{flex-direction:column;gap:8px;padding:28px;text-align:center;background:rgba(8,9,14,.88)}.fd-model-fallback strong{color:#b58cff;font-size:30px}.fd-model-fallback span{color:#f3f0f7;font-size:10px}.fd-model-fallback small{max-width:390px;color:#817a88;font-size:8px;font-weight:650;letter-spacing:.03em;line-height:1.55}
    `}</style>
  </div>;
}

export function Companion3DStage() {
  const [variant, setVariant] = useState<CompanionVariant>("droid");
  const [reaction, setReaction] = useState<Reaction>("idle");
  const selected = COMPANION_ASSETS[variant];

  return <section className="fd-companion3d" aria-label="FateDrop 3D Companion preview">
    <div className="fd-copy">
      <span>LIVE 3D COMPANION</span>
      <h2>{selected.label}</h2>
      <p>{selected.description}. Preview the same signal reactions used across FateDrop.</p>
      <div className="fd-variants">
        {COMPANION_VARIANTS.map((id) => {
          const asset = COMPANION_ASSETS[id];
          return <button key={id} data-active={variant === id} data-state={asset.state} aria-pressed={variant === id} onClick={() => setVariant(id)} title={asset.state === "quarantined" ? "Invalid deployed asset blocked" : asset.description}>
            {asset.label}{asset.state === "quarantined" ? <small>ASSET BLOCKED</small> : null}
          </button>;
        })}
      </div>
    </div>

    <div className="fd-stage" data-role={selected.role}>
      <CompanionModelCanvas variant={variant} reaction={reaction}/>
      <div className="fd-grid"/>
      <div className="fd-platform"/>
      <div className="fd-glow" data-reaction={reaction}/>
      <div className="fd-stage-chip"><span>{selected.role === "droid" ? "FAMILIAR" : "RIG"}</span><b>{selected.state === "ready" ? "READY" : "BLOCKED"}</b></div>
    </div>

    <div className="fd-reactions">
      {REACTIONS.map((item) => <button key={item.id} data-active={reaction === item.id} aria-pressed={reaction === item.id} onClick={() => setReaction(item.id)}>{item.label}</button>)}
    </div>

    <style jsx>{`
      .fd-companion3d{display:grid;grid-template-columns:minmax(230px,.78fr) minmax(360px,1.22fr);gap:18px;padding:18px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:linear-gradient(145deg,#100d1b,#07080d)}.fd-copy{padding:16px 10px;align-self:center}.fd-copy>span{color:#75eaff;font-size:8px;font-weight:900;letter-spacing:.18em}.fd-copy h2{margin:9px 0 8px;font-size:clamp(1.8rem,3vw,3rem)}.fd-copy p{color:#918a98;font-size:11px;line-height:1.65}.fd-variants{display:grid;gap:7px;margin-top:18px}.fd-companion3d button{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);color:#8b8590;border-radius:10px;padding:9px 10px;font:800 8px/1 system-ui;letter-spacing:.08em;cursor:pointer}.fd-companion3d button[data-active=true]{border-color:rgba(117,234,255,.4);background:rgba(157,109,255,.12);color:white}.fd-variants button{position:relative;display:flex;align-items:center;justify-content:center;gap:8px}.fd-variants button small{color:#ff9bad;font-size:5px;letter-spacing:.09em}.fd-variants button[data-state=quarantined]{border-style:dashed}.fd-stage{position:relative;min-height:440px;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:19px;background:radial-gradient(circle at 50% 72%,rgba(119,83,255,.16),transparent 30%),#090a10}.fd-grid{position:absolute;inset:0;opacity:.13;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:34px 34px}.fd-platform{position:absolute;z-index:1;left:21%;right:21%;bottom:9%;height:28px;border:1px solid rgba(157,109,255,.22);border-radius:50%;box-shadow:0 0 36px rgba(125,76,255,.18),inset 0 0 26px rgba(106,226,255,.05);transform:perspective(180px) rotateX(68deg)}.fd-glow{position:absolute;z-index:2;left:22%;right:22%;bottom:8%;height:58px;border-radius:999px;background:rgba(157,109,255,.18);filter:blur(17px)}.fd-glow[data-reaction=manifested],.fd-glow[data-reaction=fatematch]{background:rgba(75,255,184,.22)}.fd-glow[data-reaction=vanished]{background:rgba(255,79,103,.2)}.fd-stage-chip{position:absolute;z-index:5;right:14px;top:13px;display:flex;gap:6px;align-items:center;padding:6px 8px;border:1px solid rgba(255,255,255,.06);border-radius:999px;background:rgba(4,5,9,.55);font-size:5px;letter-spacing:.1em}.fd-stage-chip span{color:#746d7d}.fd-stage-chip b{color:#72eaff}.fd-reactions{grid-column:1/-1;display:flex;gap:7px;flex-wrap:wrap}.fd-reactions button{border-radius:999px}@media(max-width:860px){.fd-companion3d{grid-template-columns:1fr}.fd-stage{min-height:390px}.fd-reactions{grid-column:auto}}@media(max-width:520px){.fd-companion3d{padding:12px}.fd-stage{min-height:330px}}
    `}</style>
  </section>;
}
