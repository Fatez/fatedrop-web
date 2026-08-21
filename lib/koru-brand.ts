export const KORU_BRAND = {
  name: "Koru",
  code: "K-09",
  role: "FateDrop Signal Companion",
  voice: "The mascot and signal voice of FateDrop",
  portrait: "/assets/companions/koru-portrait.webp",
  fullArtwork: "/assets/companions/koru-signal-companion.webp",
  friendsArtwork: "/assets/home/koru-home-section.png",
  modelUrl: null as string | null,
  modelFormat: null as "glb" | null,
} as const;

export const KORU_LIFECYCLE = [
  { state: "Whisper", copy: "Product or catalogue movement. Something may be coming.", reaction: "watching" },
  { state: "Echo", copy: "Queue, traffic or security changed. Get ready.", reaction: "echo" },
  { state: "Manifested", copy: "Confirmed purchasable stock. It is live.", reaction: "manifested" },
  { state: "Vanished", copy: "Confirmed availability is gone.", reaction: "vanished" },
] as const;

export const KORU_MERCH = {
  hero: "/assets/merch/koru-crystal-jersey.webp",
  universe: "/assets/home/koru-home-section.png",
} as const;
