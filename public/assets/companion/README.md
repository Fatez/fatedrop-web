# FateDrop Companion 3D assets

The production Companion renderer expects the current Sentinel model at:

`public/assets/companion/fatedrop-companion-v1.glb`

## Sentinel v1 asset profile

- Format: GLB / glTF 2.0
- One mesh / one material
- 8,718 vertices
- 10,178 triangles
- PBR base colour, normal, and metallic/roughness textures
- No skeleton / skin in this first asset
- No embedded animation clips in this first asset
- Web-optimised target supplied from the approved source model: about 379 KB

The UI therefore treats v1 as the live 3D presentation body while keeping the existing account loadout and illustrated renderer as fallback. Do not pretend the current baked mesh supports modular clothing, hair swaps, or skeletal reactions. Those require a rigged/modular v2 asset.

Use versioned filenames for future models so Cloudflare can cache these assets immutably without stale-model problems.
