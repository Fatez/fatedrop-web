export function configuredTestFlightUrl() {
  const raw = process.env.FATEDROP_TESTFLIGHT_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (url.hostname !== "testflight.apple.com") return null;
    if (!url.pathname || url.pathname === "/") return null;
    return url.toString();
  } catch {
    return null;
  }
}
