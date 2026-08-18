export type AnalyticsEvent =
  | "cta_click"
  | "form_start"
  | "form_submit_attempt"
  | "form_submit_stored"
  | "video_play";

export function trackEvent(
  event: AnalyticsEvent,
  details: Record<string, string> = {},
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("fatedrop:analytics", { detail: { event, ...details } }),
  );
}
