# FateDrop launch foundation v1

This document records the durable launch-foundation integration on top of Product Spec v1.

Validation scope:

- the dedicated `/demo` interactive phone reflects the current Home / Search / Indies / Alerts / More product journey and remains visibly sample data;
- public signal language preserves Whisper → Echo → Manifested → Vanished;
- authenticated Koru & Friends selection persists to the FateDrop ID account using exactly Koru, Fenn, Aeris, Nyxen and Solix;
- Koru remains the fixed FateDrop mascot/signal voice while the user's selected companion may vary;
- the Web companion contract has exactly five stable character slots and supports one GLB or a reaction-specific GLB pack per character without creating extra identities;
- Aeris, Nyxen and Solix are registered through the live lightweight WebGL renderer; Fenn awaits final binary handoff/registration and Koru retains the approved 2D fallback until the correct GLB is verified;
- reduced-motion source behaviour keeps a registered 3D model visible while stopping continuous presentation motion;
- verified source animation clip names are metadata only until skeletal playback is separately implemented and visually proven;
- profile pictures remain separate from Koru & Friends companion identity;
- membership entitlements are server authoritative;
- mobile bearer sessions reuse the existing FateDrop account/session backend;
- Wishlist, FateFind, FateMatch and notification preferences sync through authenticated account APIs;
- production database migrations and deployment remain deliberate release steps;
- final public PNG artwork is committed; responsive/mobile composition and production-like browser QA remain release gates rather than assumptions made from CI.
