"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Variant = "male" | "female" | "droid";
type Reaction = "idle" | "watching" | "echo" | "manifested" | "vanished" | "fatematch" | "major";

type Accessor = {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4";
  normalized?: boolean;
};

type GlbDocument = {
  accessors: Accessor[];
  bufferViews: { byteOffset?: number; byteStride?: number }[];
  meshes: { primitives: { attributes: Record<string, number>; indices?: number }[] }[];
};

type Mesh = {
  positions: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
};

const ASSET_BASE =
  process.env.NEXT_PUBLIC_FATEDROP_COMPANION_ASSET_BASE?.replace(/\/$/, "") ||
  "https://raw.githubusercontent.com/Fatez/FateDrop-App/agent/mobile-companion-rescue/mobile/assets/models";

const MODELS: Record<Variant, { label: string; file: string; role: string }> = {
  male: { label: "Signal Scout", file: "fatedrop-male.glb", role: "Collector companion" },
  female: { label: "Signal Warden", file: "fatedrop-female.glb", role: "Collector companion" },
  droid: { label: "Signal Droid", file: "fatedrop-droid.glb", role: "Floating signal familiar" },
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

const COMPONENT_BYTES: Record<number, number> = { 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const TYPE_SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 } as const;

function readComponent(view: DataView, offset: number, type: number) {
  if (type === 5121) return view.getUint8(offset);
  if (type === 5122) return view.getInt16(offset, true);
  if (type === 5123) return view.getUint16(offset, true);
  if (type === 5125) return view.getUint32(offset, true);
  if (type === 5126) return view.getFloat32(offset, true);
  throw new Error(`Unsupported GLB component ${type}`);
}

function readAccessor(document: GlbDocument, binary: ArrayBuffer, index: number) {
  const item = document.accessors[index];
  if (item.bufferView == null) throw new Error("Sparse GLB accessors are unsupported.");
  const bufferView = document.bufferViews[item.bufferView];
  const components = TYPE_SIZE[item.type];
  const bytes = COMPONENT_BYTES[item.componentType];
  if (!components || !bytes) throw new Error("Unsupported Companion accessor layout.");

  const stride = bufferView.byteStride || components * bytes;
  const start = (bufferView.byteOffset || 0) + (item.byteOffset || 0);
  const input = new DataView(binary);
  const output = new Float32Array(item.count * components);

  for (let row = 0; row < item.count; row += 1) {
    for (let column = 0; column < components; column += 1) {
      let value = readComponent(input, start + row * stride + column * bytes, item.componentType);
      if (item.normalized) {
        if (item.componentType === 5122) value = Math.max(value / 32767, -1);
        else if (item.componentType === 5123) value /= 65535;
        else if (item.componentType === 5121) value /= 255;
      }
      output[row * components + column] = value;
    }
  }

  return output;
}

function parseGlb(buffer: ArrayBuffer): Mesh {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) {
    throw new Error("Companion asset is not GLB v2.");
  }

  let offset = 12;
  let document: GlbDocument | null = null;
  let binary: ArrayBuffer | null = null;

  while (offset + 8 <= buffer.byteLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (type === 0x4e4f534a) {
      document = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, start, length)).trim()) as GlbDocument;
    }
    if (type === 0x004e4942) binary = buffer.slice(start, start + length);
    offset = start + length;
  }

  if (!document || !binary) throw new Error("Companion GLB is incomplete.");
  const primitive = document.meshes?.[0]?.primitives?.[0];
  if (!primitive || primitive.indices == null || primitive.attributes.POSITION == null) {
    throw new Error("Companion mesh is incomplete.");
  }

  const rawPositions = readAccessor(document, binary, primitive.attributes.POSITION);
  const rawColors = primitive.attributes.COLOR_0 == null ? null : readAccessor(document, binary, primitive.attributes.COLOR_0);
  const rawIndices = readAccessor(document, binary, primitive.indices);

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let index = 0; index < rawPositions.length; index += 3) {
    minX = Math.min(minX, rawPositions[index]);
    maxX = Math.max(maxX, rawPositions[index]);
    minY = Math.min(minY, rawPositions[index + 1]);
    maxY = Math.max(maxY, rawPositions[index + 1]);
    minZ = Math.min(minZ, rawPositions[index + 2]);
    maxZ = Math.max(maxZ, rawPositions[index + 2]);
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const scale = 1.72 / Math.max(maxX - minX, maxY - minY, maxZ - minZ, 0.001);
  const positions = new Float32Array(rawPositions.length);
  for (let index = 0; index < rawPositions.length; index += 3) {
    positions[index] = (rawPositions[index] - cx) * scale;
    positions[index + 1] = (rawPositions[index + 1] - cy) * scale;
    positions[index + 2] = (rawPositions[index + 2] - cz) * scale;
  }

  const vertexCount = positions.length / 3;
  const colors = rawColors?.length === vertexCount * 4 ? rawColors : new Float32Array(vertexCount * 4).fill(1);
  const indices = new Uint16Array(rawIndices.length);
  for (let index = 0; index < rawIndices.length; index += 1) indices[index] = rawIndices[index];

  return { positions, colors, indices };
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create Companion shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Companion shader failed.");
  }
  return shader;
}

function reactionTint(reaction: Reaction): [number, number, number] {
  if (reaction === "manifested" || reaction === "fatematch") return [0.48, 1, 0.8];
  if (reaction === "vanished") return [1, 0.42, 0.52];
  if (reaction === "echo" || reaction === "major") return [0.68, 0.38, 1];
  if (reaction === "watching") return [0.4, 0.88, 1];
  return [1, 0.94, 1];
}

function runRenderer(
  canvas: HTMLCanvasElement,
  mesh: Mesh,
  reaction: Reaction,
  stopped: () => boolean,
) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
  if (!gl) throw new Error("WebGL is unavailable on this device.");

  const vertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    `precision mediump float;
     attribute vec3 aPosition;
     attribute vec4 aColor;
     uniform float uAngle;
     uniform float uAspect;
     uniform float uBob;
     varying vec4 vColor;
     varying float vLight;
     void main(){
       float c=cos(uAngle),s=sin(uAngle);
       mat3 r=mat3(c,0.0,-s,0.0,1.0,0.0,s,0.0,c);
       vec3 p=r*aPosition;
       float a=max(uAspect,0.01);
       if(a>1.0)p.x/=a;else p.y*=a;
       p.y+=uBob;
       gl_Position=vec4(p.x,p.y,p.z*0.45,1.0);
       vColor=aColor;
       vLight=0.82+0.18*clamp(p.z+0.5,0.0,1.0);
     }`,
  );
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    `precision mediump float;
     uniform vec3 uTint;
     varying vec4 vColor;
     varying float vLight;
     void main(){
       vec3 t=mix(vec3(1.0),uTint,0.12);
       gl_FragColor=vec4(vColor.rgb*t*vLight,vColor.a);
     }`,
  );

  const program = gl.createProgram();
  if (!program) throw new Error("Could not create Companion WebGL program.");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Companion program failed.");
  }
  gl.useProgram(program);

  function bind(name: string, data: Float32Array, size: number) {
    const location = gl.getAttribLocation(program!, name);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  bind("aPosition", mesh.positions, 3);
  bind("aColor", mesh.colors, 4);
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  const tint = reactionTint(reaction);
  gl.uniform3f(gl.getUniformLocation(program, "uTint"), tint[0], tint[1], tint[2]);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  const started = performance.now();
  let frameId = 0;
  const frame = (now: number) => {
    if (stopped()) return;
    const width = Math.max(1, Math.floor(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)));
    const height = Math.max(1, Math.floor(canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 2)));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const time = (now - started) / 1000;
    const speed = reaction === "major" ? 0.48 : reaction === "echo" ? 0.34 : 0.2;
    const amplitude = reaction === "manifested" || reaction === "fatematch" ? 0.025 : 0.012;
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(gl.getUniformLocation(program, "uAngle"), Math.sin(time * speed) * 0.34);
    gl.uniform1f(gl.getUniformLocation(program, "uAspect"), width / Math.max(1, height));
    gl.uniform1f(gl.getUniformLocation(program, "uBob"), Math.sin(time * 1.7) * amplitude);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    frameId = requestAnimationFrame(frame);
  };
  frameId = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(frameId);
}

export function Companion3DStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const generation = useRef(0);
  const [variant, setVariant] = useState<Variant>("male");
  const [reaction, setReaction] = useState<Reaction>("idle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selected = useMemo(() => MODELS[variant], [variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mine = ++generation.current;
    let cleanup: (() => void) | undefined;
    const stopped = () => generation.current !== mine;

    setLoading(true);
    setError(null);

    fetch(`${ASSET_BASE}/${selected.file}`, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Companion asset returned ${response.status}.`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (stopped()) return;
        cleanup = runRenderer(canvas, parseGlb(buffer), reaction, stopped);
        if (!stopped()) setLoading(false);
      })
      .catch((cause: unknown) => {
        if (stopped()) return;
        setLoading(false);
        setError(cause instanceof Error ? cause.message : "3D Companion preview unavailable.");
      });

    return () => {
      generation.current += 1;
      cleanup?.();
    };
  }, [reaction, selected.file]);

  return (
    <section className="fd-companion3d" aria-label="FateDrop 3D Companion preview">
      <div className="fd-companion3d-copy">
        <span>LIVE 3D COMPANION</span>
        <h2>{selected.label}</h2>
        <p>{selected.role}. Preview the same signal reactions used across FateDrop before we wire them to live account events.</p>
        <div className="fd-companion3d-variants">
          {(Object.keys(MODELS) as Variant[]).map((id) => (
            <button key={id} type="button" data-active={variant === id} onClick={() => setVariant(id)}>
              {MODELS[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="fd-companion3d-stage">
        <canvas ref={canvasRef} />
        <div className="fd-companion3d-grid" />
        <div className="fd-companion3d-glow" data-reaction={reaction} />
        {loading ? <div className="fd-companion3d-status">INITIALISING COMPANION</div> : null}
        {error ? (
          <div className="fd-companion3d-fallback">
            <strong>FD</strong>
            <span>3D preview unavailable</span>
            <small>The dashboard remains available. Reload this panel to retry.</small>
          </div>
        ) : null}
      </div>

      <div className="fd-companion3d-reactions" aria-label="Companion reaction preview">
        {REACTIONS.map((item) => (
          <button key={item.id} type="button" data-active={reaction === item.id} onClick={() => setReaction(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .fd-companion3d{display:grid;grid-template-columns:minmax(230px,.78fr) minmax(360px,1.22fr);gap:18px;padding:18px;border:1px solid rgba(157,109,255,.18);border-radius:24px;background:linear-gradient(145deg,rgba(16,13,27,.98),rgba(7,8,13,.98));box-shadow:0 24px 80px rgba(0,0,0,.2)}
        .fd-companion3d-copy{padding:16px 10px 16px 12px;align-self:center}.fd-companion3d-copy>span{color:#75eaff;font-size:8px;font-weight:900;letter-spacing:.18em}.fd-companion3d-copy h2{margin:9px 0 8px;font-size:clamp(1.8rem,3vw,3rem);letter-spacing:-.05em}.fd-companion3d-copy p{margin:0;color:#918a98;font-size:11px;line-height:1.65}.fd-companion3d-variants{display:grid;gap:7px;margin-top:18px}.fd-companion3d-variants button,.fd-companion3d-reactions button{appearance:none;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);color:#8b8590;border-radius:10px;padding:9px 10px;font:800 8px/1 system-ui;letter-spacing:.08em;cursor:pointer;transition:.18s ease}.fd-companion3d-variants button:hover,.fd-companion3d-reactions button:hover{border-color:rgba(157,109,255,.42);color:#fff}.fd-companion3d-variants button[data-active=true],.fd-companion3d-reactions button[data-active=true]{border-color:rgba(117,234,255,.4);background:linear-gradient(90deg,rgba(117,234,255,.08),rgba(157,109,255,.12));color:#fff;box-shadow:0 0 24px rgba(121,91,255,.08)}
        .fd-companion3d-stage{position:relative;min-height:440px;overflow:hidden;border:1px solid rgba(255,255,255,.07);border-radius:19px;background:radial-gradient(circle at 50% 72%,rgba(119,83,255,.17),transparent 28%),radial-gradient(circle at 50% 30%,rgba(88,227,255,.06),transparent 28%),#090a10}.fd-companion3d-stage canvas{position:absolute;z-index:3;inset:0;width:100%;height:100%}.fd-companion3d-grid{position:absolute;z-index:1;inset:0;opacity:.16;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(to bottom,transparent 3%,#000 35%,#000 100%)}.fd-companion3d-glow{position:absolute;z-index:2;left:22%;right:22%;bottom:10%;height:54px;border-radius:999px;background:rgba(157,109,255,.18);filter:blur(17px);transition:.25s ease}.fd-companion3d-glow[data-reaction=manifested],.fd-companion3d-glow[data-reaction=fatematch]{background:rgba(75,255,184,.22)}.fd-companion3d-glow[data-reaction=vanished]{background:rgba(255,79,103,.2)}.fd-companion3d-glow[data-reaction=echo],.fd-companion3d-glow[data-reaction=major]{background:rgba(157,109,255,.27)}.fd-companion3d-status,.fd-companion3d-fallback{position:absolute;z-index:5;inset:0;display:flex;align-items:center;justify-content:center;color:#8a8390;font:900 8px/1 system-ui;letter-spacing:.15em}.fd-companion3d-fallback{flex-direction:column;gap:9px;padding:24px;text-align:center;background:rgba(8,9,14,.9)}.fd-companion3d-fallback strong{color:#b58cff;font-size:32px;letter-spacing:-.06em}.fd-companion3d-fallback span{color:#fff;font-size:11px;letter-spacing:.05em}.fd-companion3d-fallback small{max-width:300px;color:#77717f;font-size:9px;line-height:1.55;letter-spacing:0}
        .fd-companion3d-reactions{grid-column:1/-1;display:flex;gap:7px;flex-wrap:wrap}.fd-companion3d-reactions button{padding:8px 11px;border-radius:999px}
        @media(max-width:860px){.fd-companion3d{grid-template-columns:1fr}.fd-companion3d-stage{min-height:400px}.fd-companion3d-reactions{grid-column:auto}}
        @media(max-width:560px){.fd-companion3d{padding:12px}.fd-companion3d-copy{padding:10px 4px}.fd-companion3d-stage{min-height:360px}.fd-companion3d-reactions{gap:5px}.fd-companion3d-reactions button{padding:8px 9px;font-size:7px}}
      `}</style>
    </section>
  );
}
