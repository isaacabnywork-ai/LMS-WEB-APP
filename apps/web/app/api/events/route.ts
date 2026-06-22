import { NextRequest } from "next/server";
import { eventBus } from "@/lib/realtime";
import { auth } from "@/auth";

// Server-Sent Events (SSE) endpoint for real-time notifications
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        `data: ${JSON.stringify({ event: "connected", data: null })}\n\n`
      );

      // Listen for events specific to this user
      const channelName = `user-${userId}`;
      const listener = (payload: { event: string; data: any }) => {
        controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
      };

      eventBus.on(channelName, listener);

      // Keep connection alive
      const interval = setInterval(() => {
        controller.enqueue(`: ping\n\n`);
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        eventBus.off(channelName, listener);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
