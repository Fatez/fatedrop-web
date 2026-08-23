import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ACTIVE_COMPANIONS = ["koru", "fenn", "aeris", "nyxen", "solix"];

function glbJson(file) {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, `${file} must be GLB`);
  assert.equal(buffer.readUInt32LE(4), 2, `${file} must be GLB v2`);
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (type === 0x4e4f534a) return JSON.parse(buffer.subarray(start, start + length).toString("utf8").trim());
    offset = start + length;
  }
  throw new Error(`${file} has no GLB JSON chunk`);
}

for (const id of ACTIVE_COMPANIONS) {
  test(`${id} registered GLB has UVs and a resolvable FateDrop texture source`, () => {
    const file = `public/assets/companions/${id}/${id}.glb`;
    const document = glbJson(file);
    const primitive = document.meshes?.[0]?.primitives?.[0];
    assert.notEqual(primitive?.attributes?.TEXCOORD_0, undefined, `${id} must retain texture coordinates`);

    const material = primitive?.material == null ? undefined : document.materials?.[primitive.material];
    const textureIndex = material?.pbrMetallicRoughness?.baseColorTexture?.index;
    const source = textureIndex == null ? undefined : document.textures?.[textureIndex]?.source;
    const image = source == null ? undefined : document.images?.[source];
    const embeddedTexture = Boolean(image && image.bufferView != null);
    const siblingTexture = path.join(root, `public/assets/companions/${id}/${id}-texture.jpg`);
    const siblingExists = fs.existsSync(siblingTexture);

    assert.ok(embeddedTexture || siblingExists, `${id} must have either an embedded texture or ${id}-texture.jpg`);
  });
}

test("web companion renderer supports the registered GLB plus sibling-JPEG package", () => {
  const renderer = fs.readFileSync(path.join(root, "components/companion-webgl-model.tsx"), "utf8");
  assert.ok(renderer.includes("companionSiblingTextureUrl"));
  assert.ok(renderer.includes("optionalSiblingTexture"));
  assert.ok(renderer.includes("if (!model.imageBlob && siblingTexture) model.imageBlob = siblingTexture"));
  assert.ok(renderer.includes("-texture.jpg"));
});
