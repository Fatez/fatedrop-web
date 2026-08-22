export const KORU_BRAND = {
  name: "Koru",
  code: "K-09",
  role: "FateDrop Signal Companion",
  voice: "The mascot and signal voice of FateDrop",
  // Use the approved current Koru artwork. The legacy companion WebPs depict an
  // earlier creature concept and must never be presented as Koru again.
  portrait: "/assets/home/koru-home-hero.png?v=20260822-koru-final",
  fullArtwork: "/assets/home/koru-home-hero.png?v=20260822-koru-final",
  friendsArtwork: "/assets/home/koru-home-section.png",
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
  campaign: "/assets/merch/koru-friends-merch-hero.png",
} as const;
