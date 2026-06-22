"use client";

import { useEffect, useState } from "react";

type RealtimeEvent = {
  event: string;
  data: any;
};

export function useRealtime() {
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("[useRealtime] Received event:", payload);
        if (payload.event !== "connected") {
          setLastEvent(payload);
        }
      } catch (err) {
        console.error("Failed to parse realtime event", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[useRealtime] SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { lastEvent };
}
