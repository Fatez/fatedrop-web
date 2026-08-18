"use client";

import { useEffect, useRef } from "react";

export type FateSignalVariant = "signal" | "bloom" | "grid" | "radar" | "market" | "events";

export function FateSignalField({
  variant = "signal",
  className = "",
}: {
  variant?: FateSignalVariant;
  className?: string;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onPointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
        const y = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
        field.style.setProperty("--fd-pointer-x", x.toFixed(3));
        field.style.setProperty("--fd-pointer-y", y.toFixed(3));
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div ref={fieldRef} className={`fate-signal-field fate-variant-${variant} ${className}`.trim()} aria-hidden="true">
      <div className="fate-signal-grid" />
      <div className="fate-signal-rings"><i /><i /><i /><i /></div>
      <div className="fate-signal-threads">
        <i className="thread-one" /><i className="thread-two" /><i className="thread-three" /><i className="thread-four" />
      </div>
      <div className="fate-signal-nodes">
        <i className="node-one" /><i className="node-two" /><i className="node-three" /><i className="node-four" /><i className="node-five" /><i className="node-six" />
      </div>
      <div className="fate-signal-cards"><i /><i /><i /></div>
      <div className="fate-signal-bloom"><i /><i /></div>
      <div className="fate-event-route"><i /><i /><i /><i /></div>
    </div>
  );
}
