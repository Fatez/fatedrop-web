# Koru + Fenn production binary handoff

This document records the verified Web production pack prepared from the supplied source exports. It does **not** mark Koru or Fenn registered until the four binaries below are physically present in `public/assets/companions` and the companion contract is updated.

## Stable public paths

- `public/assets/companions/koru/koru.glb`
  - SHA-256: `34b009923cf247284ba027ec69209c19f8a174d19ff3d6be272f2defa62fc26c`
- `public/assets/companions/koru/koru-texture.jpg`
  - SHA-256: `0aac159d218e66fc0b9208b11356db1c0e18333b6cfa93d4d117cd9a722e28fa`
- `public/assets/companions/fenn/fenn.glb`
  - SHA-256: `c25fb816c16a457db000e9dc72c2530c6068c0068b4203bd2c615cb6d448e0d3`
- `public/assets/companions/fenn/fenn-texture.jpg`
  - SHA-256: `11c3984f77e27b8330a13cd8e0f08734919c421b36f743e70b87fcf3eb407b12`

## Production pack contents

The Web handoff uses one optimized GLB plus one shared sibling JPEG per character rather than duplicating the same mesh and texture for every reaction state.

### Koru

The production GLB preserves these verified source clips:

- `Armature|Idle_3|baselayer`
- `Armature|Alert|baselayer`
- `Armature|running|baselayer`
- `Armature|walking_man|baselayer`
- `Armature|Victory_Cheer|baselayer`

The strongest victory treatment remains reserved for confirmed/high-value outcomes such as Manifested, FateMatch and major confirmed alerts. Running is retained in the source pack but is not relabelled as Vanished.

### Fenn

The production GLB preserves these verified source clips:

- `Armature|Idle|baselayer`
- `Armature|Listening_Gesture|baselayer`
- `Armature|Alert|baselayer`
- `Armature|mage_soell_cast_1|baselayer`
- `Armature|Sneaky_Walk|baselayer`
- `Armature|Victory_Cheer|baselayer`

## Web renderer boundary

The current lightweight WebGL renderer displays the production mesh/texture and reaction presentation but does not yet claim skeletal clip playback. A shared `Math.PI` front-facing yaw is applied at the renderer boundary so every registered companion uses the same forward-facing baseline, including reduced-motion mode.

## Registration gate

After all four binaries land at the stable paths:

1. Verify the hashes above.
2. Set Koru `modelUrl` to `/assets/companions/koru/koru.glb` and `modelFormat` to `"glb"`.
3. Set Fenn `modelUrl` to `/assets/companions/fenn/fenn.glb` and `modelFormat` to `"glb"`.
4. Extend the asset tests so Koru and Fenn are required to exist on disk.
5. Run the full Web verification and OpenNext Cloudflare build at the exact PR head before treating the handoff as complete.
