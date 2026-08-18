export type SignalIconName =
  | "unified-search"
  | "true-price"
  | "wishlist"
  | "fatefind"
  | "drop-pulse"
  | "local-radar"
  | "events"
  | "event-vendor"
  | "fatescore"
  | "whisper"
  | "manifested"
  | "vanished"
  | "echo";

export function SignalIcon({ name, className = "" }: { name: SignalIconName; className?: string }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  const icon = (() => {
    switch (name) {
      case "unified-search":
        return <svg {...common}><circle cx="11.5" cy="11.5" r="6.5"/><path d="m16.2 16.2 6.1 6.1"/><path d="M7.8 11.5h7.4M11.5 7.8v7.4"/></svg>;
      case "true-price":
        return <svg {...common}><path d="M4.5 8.2h12.7l6.3 6.1-9.1 9.1-9.9-9.8V8.2Z"/><circle cx="9" cy="12.1" r="1.4"/><path d="M13 15.2h6.6M13 18.7h4.2"/></svg>;
      case "wishlist":
        return <svg {...common}><path d="M7 4.5h14v19l-7-4-7 4v-19Z"/><path d="M10 10.5h8M14 7v7"/></svg>;
      case "fatefind":
        return <svg {...common}><path d="M4.5 7h19M7 14h14M10 21h8"/><circle cx="9" cy="7" r="2"/><circle cx="18" cy="14" r="2"/><circle cx="13" cy="21" r="2"/></svg>;
      case "drop-pulse":
        return <svg {...common}><path d="M3 15h5l2.2-5.4 4.1 10.8 3.1-7.4 2 2H25"/><circle cx="14.2" cy="14.7" r="10.5" opacity=".35"/></svg>;
      case "local-radar":
        return <svg {...common}><circle cx="14" cy="14" r="10"/><circle cx="14" cy="14" r="5.5"/><circle cx="14" cy="14" r="1.7"/><path d="M14 14 21 7"/></svg>;
      case "events":
        return <svg {...common}><rect x="4" y="6.5" width="20" height="17" rx="3"/><path d="M8 4v5M20 4v5M4 11h20"/><circle cx="10" cy="16" r="1"/><circle cx="15" cy="16" r="1"/><circle cx="20" cy="16" r="1"/></svg>;
      case "event-vendor":
        return <svg {...common}><path d="M5 11h18l-2-6H7l-2 6Z"/><path d="M7 11v12h14V11M10 23v-6h8v6"/><path d="M5 11c0 2 3 3.2 4.5.4 1.2 2.6 4.1 2.6 5.3 0 1.3-2.6 4.1-2.6 5.2 0 1.7-1.5 4.5-.4 4.5-.4"/></svg>;
      case "fatescore":
        return <svg {...common}><path d="m14 3 8.5 3.4v6.7c0 5.3-3.5 9.4-8.5 11.9-5-2.5-8.5-6.6-8.5-11.9V6.4L14 3Z"/><path d="m9.5 14 3 3 6-7"/></svg>;
      case "whisper":
        return <svg {...common}><circle cx="14" cy="14" r="2"/><circle cx="14" cy="14" r="6" opacity=".55"/><path d="M4 14h3M21 14h3" opacity=".45"/></svg>;
      case "manifested":
        return <svg {...common}><circle cx="14" cy="14" r="3"/><circle cx="14" cy="14" r="8"/><path d="M14 2v4M14 22v4M2 14h4M22 14h4"/></svg>;
      case "vanished":
        return <svg {...common}><path d="M5 8.5 10 5l4 4 4-3 5 4-3 5 2 5-6 3-4-4-5 2-2-6 3-3-3-3.5Z"/><path d="M9 18 19 8"/></svg>;
      case "echo":
        return <svg {...common}><circle cx="10" cy="14" r="2"/><path d="M14 9.5a6 6 0 0 1 0 9M17.5 6a11 11 0 0 1 0 16"/></svg>;
    }
  })();

  return <span className={`signal-icon signal-icon-${name} ${className}`.trim()}>{icon}</span>;
}
