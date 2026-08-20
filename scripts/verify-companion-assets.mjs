import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const companionDir = path.join(root, "public", "assets", "companions");
const REQUIRED_CLIPS = ["Idle", "Echo", "Notice", "Manifested", "Celebrate", "Walk", "Run"];

function fail(message) {
  throw new Error(message);
}

function readGlb(filename, { minimumBytes = 1, clips = [] } = {}) {
  const file = path.join(companionDir, filename);
  if (!fs.existsSync(file)) fail(`${filename}: file is missing.`);
  const buffer = fs.readFileSync(file);
  const magic8 = buffer.subarray(0, 8).toString("ascii");
  if (magic8 === "MESHY.AI") {
    fail(`${filename}: Meshy wrapper detected. Convert/re-export it to a standard GLB before shipping.`);
  }
  if (buffer.length < 20 || buffer.subarray(0, 4).toString("ascii") !== "glTF") {
    fail(`${filename}: not a standard GLB v2 file.`);
  }
  if (buffer.readUInt32LE(4) !== 2) fail(`${filename}: expected GLB version 2.`);
  if (buffer.length < minimumBytes) fail(`${filename}: only ${buffer.length} bytes; production asset expected at least ${minimumBytes}.`);

  let offset = 12;
  let document = null;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (type === 0x4e4f534a) {
      document = JSON.parse(buffer.subarray(start, start + length).toString("utf8").trim());
      break;
    }
    offset = start + length;
  }
  if (!document) fail(`${filename}: GLB JSON chunk is missing.`);

  const primitive = document.meshes?.[0]?.primitives?.[0];
  if (!primitive || primitive.attributes?.POSITION == null || primitive.indices == null) {
    fail(`${filename}: expected one renderable indexed mesh primitive.`);
  }

  const positionAccessor = document.accessors?.[primitive.attributes.POSITION];
  if (!positionAccessor?.min || !positionAccessor?.max) fail(`${filename}: POSITION bounds are missing.`);
  const width = Math.abs(positionAccessor.max[0] - positionAccessor.min[0]);
  const height = Math.abs(positionAccessor.max[1] - positionAccessor.min[1]);
  const depth = Math.abs(positionAccessor.max[2] - positionAccessor.min[2]);

  if (clips.length) {
    const names = new Set((document.animations || []).map((animation) => animation.name));
    for (const clip of clips) if (!names.has(clip)) fail(`${filename}: missing animation clip ${clip}.`);
    if (!document.skins?.length) fail(`${filename}: production humanoid must contain a skin/rig.`);
    if (height < width * 1.12 || height < depth * 1.12) fail(`${filename}: geometry does not read as a vertical humanoid.`);
  }

  return {
    filename,
    bytes: buffer.length,
    meshes: document.meshes?.length || 0,
    primitives: document.meshes?.reduce((sum, mesh) => sum + (mesh.primitives?.length || 0), 0) || 0,
    animations: (document.animations || []).map((animation) => animation.name).filter(Boolean),
    bounds: { width, height, depth },
  };
}

const results = [
  readGlb("fatedrop-male.glb", { minimumBytes: 500_000, clips: REQUIRED_CLIPS }),
  readGlb("fatedrop-female.glb", { minimumBytes: 500_000, clips: REQUIRED_CLIPS }),
];

const droidPath = path.join(companionDir, "fatedrop-droid.glb");
if (fs.existsSync(droidPath)) {
  results.push(readGlb("fatedrop-droid.glb"));
}

const cardPath = path.join(companionDir, "fatedrop-card.glb");
if (fs.existsSync(cardPath)) {
  results.push(readGlb("fatedrop-card.glb"));
}

console.log("FateDrop Companion asset verification passed.");
for (const result of results) {
  console.log(`- ${result.filename}: ${(result.bytes / 1024 / 1024).toFixed(2)} MB · ${result.meshes} mesh(es) · ${result.primitives} primitive(s)${result.animations.length ? ` · clips: ${result.animations.join(", ")}` : ""}`);
}
