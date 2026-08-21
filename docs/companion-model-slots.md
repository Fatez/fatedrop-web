# FateDrop Koru & Friends model slots

The active website companion roster is intentionally fixed to five characters:

1. Koru — `koru`
2. Fenn — `fenn`
3. Aeris — `aeris`
4. Nyxen — `nyxen`
5. Solix — `solix`

`Kael (K-01)` and `Nyra (N-02)` are legacy/archive references only. They are not active selector slots.

## Expected GLB destinations

When approved models arrive, use these stable public paths:

- `/assets/companions/models/koru.glb`
- `/assets/companions/models/fenn.glb`
- `/assets/companions/models/aeris.glb`
- `/assets/companions/models/nyxen.glb`
- `/assets/companions/models/solix.glb`

Do not introduce separate Droid, Scout, TCG-theme or signal-familiar model slots.

## Registration

Model registration lives in `lib/companion-contract.ts` inside `ACTIVE_COMPANION_ROSTER`.

For each approved model:

1. Add the GLB at the stable path above.
2. Set that character's `modelUrl` to the path.
3. Set `modelFormat` to `"glb"`.
4. Add animation clip names only when they are verified against the actual GLB.
5. Run the full website verification workflow before treating the model as active.

Until a GLB is registered, the companion selector deliberately renders a branded placeholder. Koru may use approved 2D artwork as its fallback.

## Reaction contract

Every character uses the same FateDrop meaning:

- Whisper — catalogue/product movement; stock not confirmed.
- Echo — queue, traffic, security or access readiness changed; get ready, stock not confirmed.
- Manifested — purchasable availability confirmed live.
- Vanished — previously confirmed availability is gone or no longer verified.

FateMatch remains a successful hunt result, not a replacement lifecycle state.

The character can change the animation/personality of a reaction. It must never change the evidence or meaning of the underlying signal.
