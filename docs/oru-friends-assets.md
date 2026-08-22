# Oru & Friends 3D assets

The active production character roster is Oru, Nyxen, Solix and Aeris. Kael and Nyra remain in the FateDrop Legacy archive for possible future cameos. Fenn stays a future character until a production asset set exists.

The website owns the canonical public asset paths used by both Web and the mobile app:

```text
public/companions/oru/oru.glb
public/companions/oru/oru-texture.jpg
public/companions/nyxen/nyxen.glb
public/companions/nyxen/nyxen-texture.jpg
public/companions/solix/solix.glb
public/companions/solix/solix-texture.jpg
public/companions/aeris/aeris.glb
public/companions/aeris/aeris-texture.jpg
```

Each GLB must contain the six canonical clip names:

- `Idle`
- `Whisper`
- `Echo`
- `Manifested`
- `Vanished`
- `FateMatch`

The renderer maps FateDrop reactions directly to those names. Whisper and Echo remain distinct evidence states; character animation never changes the lifecycle meaning.

The supplied production pack was optimized before integration. Within each character the original state files shared identical geometry, rig, skin, material and texture data, so the six animations were merged into one GLB. Duplicate embedded 2048 PNG textures were removed and replaced with a single 1024 JPEG per character. The resulting GLBs are roughly 1.6–1.7 MB each and textures roughly 0.3–0.5 MB each.

The web renderer uses Three.js, normalizes each model to a consistent display height, applies the external texture, loops Idle/Whisper/Echo and treats Manifested/Vanished/FateMatch as one-shot reactions that settle back to Idle.
