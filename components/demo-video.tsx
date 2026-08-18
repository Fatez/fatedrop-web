"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { AppScreen } from "./app-screen";

export function DemoVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "180px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || failed) return;
    videoRef.current?.play().catch(() => undefined);
  }, [visible, failed]);

  return (
    <div className={expanded ? "demo-player expanded" : "demo-player"} ref={wrapRef}>
      <div className="demo-fallback"><AppScreen compact screen="search" /></div>
      {visible && !failed ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          controls={expanded}
          onError={() => setFailed(true)}
          onPlay={() => trackEvent("video_play", { location: "home_demo" })}
        >
          <source src="/assets/fatedrop-demo.mp4" type="video/mp4" />
          <track kind="captions" src="/assets/fatedrop-demo.vtt" srcLang="en" label="English" />
        </video>
      ) : null}
      <div className="demo-overlay">
        <span className="live-dot">App demo</span>
        {failed ? (
          <span className="demo-missing">Demo video slot ready</span>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? "Close full video controls" : "Open full video controls"}
          >
            {expanded ? "Close" : "Play full demo"} <span aria-hidden="true">▶</span>
          </button>
        )}
      </div>
    </div>
  );
}
