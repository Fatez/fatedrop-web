"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const ALERT_REFRESH_INTERVAL_MS = 10_000;

export default function AlertsTemplate({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let timer: number | null = null;

    const stopPolling = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const startPolling = () => {
      stopPolling();
      if (document.visibilityState !== "visible") return;
      timer = window.setInterval(refreshIfVisible, ALERT_REFRESH_INTERVAL_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        startPolling();
        return;
      }
      stopPolling();
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return children;
}
