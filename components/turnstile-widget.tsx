"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type TurnstileWidgetApi = {
  render: (container: HTMLElement, options: Record<string, string>) => string;
  remove?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileWidgetApi & { reset: (widgetId?: string) => void };
  }
}

export function TurnstileWidget({ siteKey, action }: { siteKey: string; action: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme: "dark",
    });
  }, [action, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      const widgetId = widgetIdRef.current;
      if (widgetId) window.turnstile?.remove?.(widgetId);
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} data-turnstile-widget={action} />
    </>
  );
}
