import { EventEmitter } from "events";

// Global event bus for Server-Sent Events (SSE)
// In production, this would be Pusher or Supabase Realtime
declare global {
  var _eventBus: EventEmitter | undefined;
}

export const eventBus = globalThis._eventBus || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalThis._eventBus = eventBus;
}

export function triggerEvent(channel: string, event: string, data: any) {
  console.log(`[REALTIME] Triggering '${event}' on '${channel}'`, data);
  eventBus.emit(channel, { event, data });
}
