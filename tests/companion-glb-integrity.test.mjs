import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

for (const id of ["aeris", "nyxen", "solix"]) {
  test(`${id} registered GLB has a resolvable base-colour texture`, () => {
    const file = `public/assets/companions/${id}/${id}.glb`;
    const document = glbJson(file);
    const primitive = document.meshes?.[0]?.primitives?.[0];
    const material = primitive?.material == null ? undefined : document.materials?.[primitive.material];
    const textureIndex = material?.pbrMetallicRoughness?.baseColorTexture?.index;
    assert.notEqual(textureIndex, undefined, `${id} must declare a base-colour texture`);
    const source = document.textures?.[textureIndex]?.source;
    const image = source == null ? undefined : document.images?.[source];
    assert.ok(image, `${id} texture image must exist`);
    assert.ok(image.bufferView != null || typeof image.uri === "string", `${id} texture must be embedded or URI-backed`);
    if (typeof image.uri === "string" && !image.uri.startsWith("data:")) {
      const texturePath = path.join(path.dirname(path.join(root, file)), image.uri);
      assert.equal(fs.existsSync(texturePath), true, `${id} external texture ${image.uri} must exist beside the GLB`);
    }
    console.log(`COMPANION_TEXTURE_SOURCE ${id} ${image.bufferView != null ? "embedded" : image.uri}`);
  });
}
