# FateDrop Koru & Friends model slots

The active website companion roster is intentionally fixed to five characters:

1. Koru — `koru`
2. Fenn — `fenn`
3. Aeris — `aeris`
4. Nyxen — `nyxen`
5. Solix — `solix`

`Kael (K-01)` and `Nyra (N-02)` are legacy/archive references only. They are not active selector slots.

## Stable public asset layout

Each character owns one folder under `/assets/companions/<id>/`.

Current registered single-GLB packs:

- Aeris — `/assets/companions/aeris/aeris.glb`
- Nyxen — `/assets/companions/nyxen/nyxen.glb`
- Solix — `/assets/companions/solix/solix.glb`

Reserved final paths:

- Koru — `/assets/companions/koru/koru.glb`
- Fenn base/rig — `/assets/companions/fenn/fenn.glb`

A character may also ship approved reaction-specific GLBs inside the same folder when the source pack is exported that way. The canonical reaction filenames are:

- `fenn-idle.glb`
- `fenn-whisper.glb`
- `fenn-echo.glb`
- `fenn-manifested.glb`
- `fenn-vanished.glb`
- `fenn-fatematch.glb`

Do not introduce separate Droid, Scout, TCG-theme or signal-familiar model slots.

## Registration

Model registration lives only in `lib/companion-contract.ts` inside `ACTIVE_COMPANION_ROSTER`.

For a single GLB containing the production character model/clip set:

1. Add the GLB at the character's stable folder path.
2. Set `modelUrl` to that path.
3. Set `modelFormat` to `"glb"`.
4. Add animation clip names only when they are verified against the actual asset.
5. Run the full website verification workflow before treating the model as active.

For a reaction-specific state pack:

1. Keep every state GLB inside that character's stable folder.
2. Register the state files through `reactionModelUrls`.
3. Keep `animationClips` mapped to the exact clip names verified inside the real files.
4. `major` may deliberately reuse the approved FateMatch/victory treatment rather than creating a fifth lifecycle state.
5. Run the same full verification gate.

Until a GLB is registered, the companion selector deliberately renders an honest fallback. Koru may use approved 2D mascot artwork as its fallback.

## Verified Fenn source pack

The supplied Fenn pack has one skinned model per state and the following verified animation names:

- Idle — `Armature|Idle|baselayer`
- Whisper — `Armature|Listening_Gesture|baselayer`
- Echo — `Armature|Alert|baselayer`
- Manifested — `Armature|mage_soell_cast_1|baselayer`
- Vanished — `Armature|Sneaky_Walk|baselayer`
- FateMatch — `Armature|Victory_Cheer|baselayer`

The seventh Fenn file is the rigged/base export. These names are recorded in the companion contract but Fenn must not be marked as a registered web model until the corresponding binaries are present under its stable public folder.

## Reaction contract

Every character uses the same FateDrop meaning:

- Whisper — catalogue/product movement; stock not confirmed.
- Echo — queue, traffic, security or access readiness changed; get ready, stock not confirmed.
- Manifested — purchasable availability confirmed live.
- Vanished — previously confirmed availability is gone or no longer verified.

FateMatch remains a successful hunt result, not a replacement lifecycle state.

The character can change the animation/personality of a reaction. It must never change the evidence or meaning of the underlying signal.
