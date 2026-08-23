# FateDrop Koru & Friends model slots

The active website companion roster is intentionally fixed to five characters:

1. Koru — `koru`
2. Fenn — `fenn`
3. Aeris — `aeris`
4. Nyxen — `nyxen`
5. Solix — `solix`

`Kael (K-01)` and `Nyra (N-02)` are legacy/archive references only. They are not active selector slots.

Oru is a FateDrop-world / Koru & Friends character and merch/brand accent. Oru is not a sixth selectable signal companion.

## Stable public asset layout

Each character owns one folder under `/assets/companions/<id>/`.

Current registered single-GLB display packs:

- Koru — `/assets/companions/koru/koru.glb`
- Fenn — `/assets/companions/fenn/fenn.glb`
- Aeris — `/assets/companions/aeris/aeris.glb`
- Nyxen — `/assets/companions/nyxen/nyxen.glb`
- Solix — `/assets/companions/solix/solix.glb`

All five stable slots are registered through the shared WebGL renderer. Koru remains FateDrop's fixed mascot/network voice and default companion; Fenn is a normal selectable Koru & Friends companion despite the historical `fatedrop-mascot-*` source filenames.

A character may also ship approved reaction-specific GLBs inside the same folder when the source pack is exported that way. The canonical Fenn reaction filenames are:

- `fenn-idle.glb`
- `fenn-whisper.glb`
- `fenn-echo.glb`
- `fenn-manifested.glb`
- `fenn-vanished.glb`
- `fenn-fatematch.glb`

Do not introduce separate Droid, Scout, TCG-theme or signal-familiar model slots.

## Registration

Model registration lives only in `lib/companion-contract.ts` inside `ACTIVE_COMPANION_ROSTER`.

For a single GLB containing the production character display model:

1. Add the GLB at the character's stable folder path.
2. Set `modelUrl` to that path.
3. Set `modelFormat` to `"glb"`.
4. Record animation clip names only when they are verified against the actual source asset.
5. Do not equate recorded clip metadata with shipped browser animation playback.
6. Run the full website verification workflow before treating the model as active.

For a reaction-specific state pack:

1. Keep every state GLB inside that character's stable folder.
2. Register the state files through `reactionModelUrls`.
3. Keep `animationClips` mapped to the exact clip names verified inside the real files.
4. `major` may deliberately reuse the approved FateMatch/victory treatment rather than creating a fifth lifecycle state.
5. Treat skeletal playback as a separate renderer capability; source clips alone do not prove playback is live.
6. Run the same full verification gate.

If a registered model fails to load, the companion selector deliberately renders an honest placeholder rather than substituting unrelated campaign/homepage artwork.

## Verified source animation metadata

The supplied **Aeris, Nyxen, Solix and Fenn** state exports were inspected directly. Every state file contains one animation and all four characters use the same verified source clip mapping:

- Idle — `Armature|Idle|baselayer`
- Whisper — `Armature|Listening_Gesture|baselayer`
- Echo — `Armature|Alert|baselayer`
- Manifested — `Armature|mage_soell_cast_1|baselayer`
- Vanished — `Armature|Sneaky_Walk|baselayer`
- FateMatch — `Armature|Victory_Cheer|baselayer`

Fenn additionally has a seventh rigged/base export. Its optimized Web display GLB is now registered at the stable Fenn path above.

Koru's supplied source exports were also inspected directly. The verified source metadata recorded in the companion contract includes:

- Idle — `Armature|Idle_3|baselayer`
- Notice/watch — `Armature|walking_man|baselayer`
- Echo/alert — `Armature|Alert|baselayer`
- confirmed/victory treatment — `Armature|Victory_Cheer|baselayer`

The current lightweight WebGL renderer displays registered meshes/textures and state presentation; it does **not** yet play the skinned animation channels above. These verified names are retained so a future skeletal-animation implementation can bind to real source metadata rather than guessed labels.

The WebGL boundary applies a shared front-facing base yaw so the five display models face the collector consistently. Reduced-motion users retain the real model without continuous presentation motion.

## Reaction contract

Every character uses the same FateDrop meaning:

- Whisper — catalogue/product movement; stock not confirmed.
- Echo — queue, traffic, security or access readiness changed; get ready, stock not confirmed.
- Manifested — purchasable availability confirmed live.
- Vanished — previously confirmed availability is gone or no longer verified.

FateMatch remains a successful hunt result, not a replacement lifecycle state.

The character can change the presentation/personality of a reaction. It must never change the evidence or meaning of the underlying signal.
