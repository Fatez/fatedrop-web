"use client";

import { useEffect, useRef, useState } from "react";
import type { CompanionReaction } from "@/lib/companion-contract";

type Accessor = {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4";
  normalized?: boolean;
};

type BufferView = { byteOffset?: number; byteLength: number; byteStride?: number };
type Primitive = { attributes: Record<string, number>; indices?: number; material?: number };
type GlbDocument = {
  accessors: Accessor[];
  bufferViews: BufferView[];
  meshes: { primitives: Primitive[] }[];
  images?: { bufferView?: number; mimeType?: string }[];
  textures?: { source?: number }[];
  materials?: {
    pbrMetallicRoughness?: {
      baseColorTexture?: { index: number };
      baseColorFactor?: [number, number, number, number];
    };
  }[];
};

type ParsedModel = {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array | Uint32Array;
  indexComponentType: number;
  imageBlob: Blob | null;
  baseColor: [number, number, number, number];
};

type GL = WebGLRenderingContext | WebGL2RenderingContext;

const BYTES: Record<number, number> = { 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const SIZES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 } as const;
const FRONT_FACING_YAW = Math.PI;

function component(view: DataView, offset: number, type: number) {
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
        if (item.componentType === 5122) value = Math.max(value / 32767, -1);
        else if (item.componentType === 5123) value /= 65535;
        else if (item.componentType === 5121) value /= 255;
      }
      output[row * size + col] = value;
    }
  }
  return output;
}

function parseGlb(buffer: ArrayBuffer): ParsedModel {
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

  const rawPositions = accessor(document, binary, primitive.attributes.POSITION);
  const rawNormals = primitive.attributes.NORMAL == null ? null : accessor(document, binary, primitive.attributes.NORMAL);
  const rawUvs = primitive.attributes.TEXCOORD_0 == null ? null : accessor(document, binary, primitive.attributes.TEXCOORD_0);
  const rawIndices = accessor(document, binary, primitive.indices);
  const indexAccessor = document.accessors[primitive.indices];

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < rawPositions.length; i += 3) {
    minX = Math.min(minX, rawPositions[i]); maxX = Math.max(maxX, rawPositions[i]);
    minY = Math.min(minY, rawPositions[i + 1]); maxY = Math.max(maxY, rawPositions[i + 1]);
    minZ = Math.min(minZ, rawPositions[i + 2]); maxZ = Math.max(maxZ, rawPositions[i + 2]);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const scale = 1.7 / Math.max(maxX - minX, maxY - minY, maxZ - minZ, 0.001);
  const positions = new Float32Array(rawPositions.length);
  for (let i = 0; i < rawPositions.length; i += 3) {
    positions[i] = (rawPositions[i] - cx) * scale;
    positions[i + 1] = (rawPositions[i + 1] - cy) * scale;
    positions[i + 2] = (rawPositions[i + 2] - cz) * scale;
  }

  const vertexCount = positions.length / 3;
  const normals = rawNormals?.length === vertexCount * 3 ? rawNormals : new Float32Array(vertexCount * 3);
  if (!rawNormals) for (let i = 2; i < normals.length; i += 3) normals[i] = 1;
  const uvs = rawUvs?.length === vertexCount * 2 ? rawUvs : new Float32Array(vertexCount * 2);
  const indices = indexAccessor.componentType === 5125
    ? Uint32Array.from(rawIndices)
    : Uint16Array.from(rawIndices);

  const material = primitive.material == null ? undefined : document.materials?.[primitive.material];
  const baseColor = material?.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1];
  const textureIndex = material?.pbrMetallicRoughness?.baseColorTexture?.index;
  const imageIndex = textureIndex == null ? undefined : document.textures?.[textureIndex]?.source;
  const image = imageIndex == null ? undefined : document.images?.[imageIndex];
  const imageView = image?.bufferView == null ? undefined : document.bufferViews[image.bufferView];
  const imageBlob = image && imageView
    ? new Blob([
        new Uint8Array(binary, imageView.byteOffset || 0, imageView.byteLength),
      ], { type: image.mimeType || "image/png" })
    : null;

  return { positions, normals, uvs, indices, indexComponentType: indexAccessor.componentType, imageBlob, baseColor };
}

function companionSiblingTextureUrl(modelUrl: string): string | null {
  const clean = modelUrl.split("?", 1)[0];
  const segments = clean.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const characterId = segments[segments.length - 2];
  const directory = clean.slice(0, clean.lastIndexOf("/"));
  return `${directory}/${characterId}-texture.jpg`;
}

async function optionalSiblingTexture(modelUrl: string): Promise<Blob | null> {
  const textureUrl = companionSiblingTextureUrl(modelUrl);
  if (!textureUrl) return null;
  try {
    const response = await fetch(textureUrl, { cache: "force-cache" });
    return response.ok ? await response.blob() : null;
  } catch {
    return null;
  }
}

function compile(gl: GL, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create Companion shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Companion shader failed.");
  }
  return shader;
}

async function decodeTexture(blob: Blob) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    return { source: bitmap as TexImageSource, dispose: () => bitmap.close() };
  }
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Companion texture could not be decoded."));
  });
  image.src = url;
  await loaded;
  return { source: image as TexImageSource, dispose: () => URL.revokeObjectURL(url) };
}

function reactionTint(reaction: CompanionReaction): [number, number, number] {
  if (reaction === "manifested" || reaction === "fatematch") return [0.8, 1, 0.88];
  if (reaction === "vanished") return [1, 0.82, 0.84];
  if (reaction === "echo" || reaction === "major") return [0.9, 0.82, 1];
  if (reaction === "watching") return [0.86, 0.94, 1];
  return [1, 1, 1];
}

async function renderModel(canvas: HTMLCanvasElement, model: ParsedModel, reaction: CompanionReaction, stopped: () => boolean, reducedMotion: boolean) {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: true })
    || canvas.getContext("webgl", { alpha: true, antialias: true });
  if (!gl) throw new Error("WebGL is unavailable on this device.");
  if (model.indexComponentType === 5125 && !(gl instanceof WebGL2RenderingContext) && !gl.getExtension("OES_element_index_uint")) {
    throw new Error("This browser cannot render the Companion index format.");
  }

  const vertexShader = compile(gl, gl.VERTEX_SHADER, `
    precision mediump float;
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aUv;
    uniform float uAngle;
    uniform float uAspect;
    uniform float uBob;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main(){
      float c=cos(uAngle),s=sin(uAngle);
      mat3 r=mat3(c,0.0,-s,0.0,1.0,0.0,s,0.0,c);
      vec3 p=r*aPosition;
      float a=max(uAspect,0.01);
      if(a>1.0)p.x/=a;else p.y*=a;
      p.y+=uBob;
      gl_Position=vec4(p.x,p.y,p.z*0.42,1.0);
      vNormal=normalize(r*aNormal);
      vUv=aUv;
    }
  `);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec4 uBaseColor;
    uniform vec3 uTint;
    uniform float uHasTexture;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main(){
      vec4 tex=texture2D(uTexture,vUv);
      vec4 base=mix(uBaseColor,tex*uBaseColor,uHasTexture);
      float light=.58+.42*max(dot(normalize(vNormal),normalize(vec3(.25,.7,.9))),0.0);
      vec3 tinted=base.rgb*uTint*light;
      if(base.a<.03) discard;
      gl_FragColor=vec4(tinted,base.a);
    }
  `);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create Companion program.");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Companion program failed.");
  }
  gl.useProgram(program);

  const buffers: WebGLBuffer[] = [];
  const bindAttribute = (name: string, data: Float32Array, size: number) => {
    const location = gl.getAttribLocation(program, name);
    if (location < 0) return;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Could not allocate Companion buffer.");
    buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  };
  bindAttribute("aPosition", model.positions, 3);
  bindAttribute("aNormal", model.normals, 3);
  bindAttribute("aUv", model.uvs, 2);

  const indexBuffer = gl.createBuffer();
  if (!indexBuffer) throw new Error("Could not allocate Companion index buffer.");
  buffers.push(indexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);

  const texture = gl.createTexture();
  if (!texture) throw new Error("Could not allocate Companion texture.");
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));

  let textureDispose = () => {};
  let hasTexture = 0;
  if (model.imageBlob) {
    const decoded = await decodeTexture(model.imageBlob);
    if (stopped()) { decoded.dispose(); return () => {}; }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, decoded.source);
    textureDispose = decoded.dispose;
    hasTexture = 1;
  }

  gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);
  gl.uniform1f(gl.getUniformLocation(program, "uHasTexture"), hasTexture);
  gl.uniform4f(gl.getUniformLocation(program, "uBaseColor"), ...model.baseColor);
  const tint = reactionTint(reaction);
  gl.uniform3f(gl.getUniformLocation(program, "uTint"), ...tint);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const started = performance.now();
  let frameId = 0;
  const frame = (now: number) => {
    if (stopped()) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const elapsed = reducedMotion ? 0 : (now - started) / 1000;
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(gl.getUniformLocation(program, "uAngle"), FRONT_FACING_YAW + (reducedMotion ? 0 : Math.sin(elapsed * 0.22) * 0.28));
    gl.uniform1f(gl.getUniformLocation(program, "uAspect"), width / Math.max(1, height));
    gl.uniform1f(gl.getUniformLocation(program, "uBob"), reducedMotion ? 0 : Math.sin(elapsed * 1.25) * 0.012);
    const indexType = model.indexComponentType === 5125 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    gl.drawElements(gl.TRIANGLES, model.indices.length, indexType, 0);
    if (!reducedMotion) frameId = requestAnimationFrame(frame);
  };
  if (reducedMotion) frame(started);
  else frameId = requestAnimationFrame(frame);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
    textureDispose();
    gl.deleteTexture(texture);
    for (const buffer of buffers) gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  };
}

export function CompanionWebglModel({ name, modelUrl, reaction, compact = false }: { name: string; modelUrl: string; reaction: CompanionReaction; compact?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const generation = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mine = ++generation.current;
    const stopped = () => generation.current !== mine;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup: (() => void) | undefined;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(modelUrl, { cache: "force-cache" }).then((response) => {
        if (!response.ok) throw new Error(`Companion model returned ${response.status}.`);
        return response.arrayBuffer();
      }),
      optionalSiblingTexture(modelUrl),
    ])
      .then(([buffer, siblingTexture]) => {
        const model = parseGlb(buffer);
        if (siblingTexture) model.imageBlob = siblingTexture;
        return model;
      })
      .then((model) => renderModel(canvas, model, reaction, stopped, reducedMotion))
      .then((dispose) => {
        if (stopped()) { dispose(); return; }
        cleanup = dispose;
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (stopped()) return;
        setLoading(false);
        setError(cause instanceof Error ? cause.message : "3D Companion preview unavailable.");
      });
    return () => { generation.current += 1; cleanup?.(); };
  }, [modelUrl, reaction]);

  return <div className={`companion-webgl${compact ? " compact" : ""}`} aria-label={`${name} 3D companion preview`}>
    <canvas ref={canvasRef} aria-hidden="true" />
    <div className="companion-webgl-grid" aria-hidden="true" />
    <div className="companion-webgl-glow" data-reaction={reaction} aria-hidden="true" />
    {loading ? <div className="companion-webgl-status">LOADING 3D MODEL</div> : null}
    {error ? <div className="companion-webgl-fallback"><strong>{name.slice(0, 1)}</strong><span>3D preview unavailable</span><small>{error}</small></div> : null}
    <div className="companion-webgl-label"><small>LIVE 3D · KORU &amp; FRIENDS</small><strong>{name}</strong></div>
    <style jsx>{`
      .companion-webgl{position:relative;isolation:isolate;min-height:440px;overflow:hidden;border:1px solid rgba(205,187,207,.12);border-radius:24px;background:radial-gradient(circle at 50% 72%,rgba(132,96,147,.2),transparent 28%),linear-gradient(145deg,#11131a,#080a0f)}
      .companion-webgl.compact{min-height:230px;border-radius:18px}.companion-webgl canvas{position:absolute;z-index:3;inset:0;width:100%;height:100%}.companion-webgl-grid{position:absolute;z-index:1;inset:0;opacity:.11;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:34px 34px}.companion-webgl-glow{position:absolute;z-index:2;left:22%;right:22%;bottom:9%;height:48px;border-radius:999px;background:rgba(157,109,255,.2);filter:blur(16px)}.companion-webgl-glow[data-reaction="manifested"],.companion-webgl-glow[data-reaction="fatematch"]{background:rgba(75,255,184,.22)}.companion-webgl-glow[data-reaction="vanished"]{background:rgba(255,79,103,.2)}.companion-webgl-status,.companion-webgl-fallback{position:absolute;z-index:6;inset:0;display:flex;align-items:center;justify-content:center;color:#8a8390;font-size:7px;font-weight:900;letter-spacing:.14em}.companion-webgl-fallback{flex-direction:column;gap:7px;padding:18px;text-align:center;background:rgba(8,9,14,.93)}.companion-webgl-fallback strong{color:#d9c6de;font-family:Georgia,serif;font-size:48px;font-weight:500}.companion-webgl-fallback span{color:#aaa0ad;font-size:9px}.companion-webgl-fallback small{max-width:260px;color:#665f6a;font-size:7px;line-height:1.45;letter-spacing:0}.companion-webgl-label{position:absolute;z-index:5;left:18px;right:18px;bottom:16px;display:grid;gap:3px;padding:9px 11px;border:1px solid rgba(255,255,255,.065);border-radius:11px;background:rgba(7,8,12,.68);backdrop-filter:blur(10px)}.companion-webgl-label small{color:#9c7da5;font-size:6px;font-weight:900;letter-spacing:.12em}.companion-webgl-label strong{color:#eee5df;font-family:Georgia,serif;font-size:17px;font-weight:500}.compact .companion-webgl-label{left:9px;right:9px;bottom:8px;padding:7px 8px}.compact .companion-webgl-label strong{font-size:13px}.compact .companion-webgl-label small{font-size:5px}
    `}</style>
  </div>;
}