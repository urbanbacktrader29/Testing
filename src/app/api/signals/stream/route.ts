import { getServerSession } from "next-auth";
import { authOptions, isSubscriptionActive } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRandomSignal, getRecentSignals } from "@/lib/signals";

export const runtime = "nodejs";

const GENERATION_INTERVAL_MS = 12_000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Not authenticated", { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !isSubscriptionActive(user)) {
    return new Response("Subscription required", { status: 403 });
  }

  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const recent = await getRecentSignals(20);
      send("initial", recent);

      interval = setInterval(async () => {
        try {
          const signal = await createRandomSignal();
          send("signal", signal);
        } catch {
          // transient DB hiccup — the client will still get the next tick
        }
      }, GENERATION_INTERVAL_MS);
    },
    cancel() {
      clearInterval(interval);
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
