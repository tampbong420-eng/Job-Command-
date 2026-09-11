import { getReadyDb } from "@/db";
import { withAuth } from "@/lib/http";
import { listJobs } from "@/lib/services/jobs";

export async function GET() {
  return withAuth(async (user) => {
    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream({
      async start(controller) {
        const send = async () => {
          if (closed) return;
          const db = await getReadyDb();
          const jobs = await listJobs(db, user);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ jobs, at: new Date().toISOString() })}\n\n`),
          );
        };
        await send();
        const timer = setInterval(() => {
          void send().catch(() => {
            closed = true;
            clearInterval(timer);
            try {
              controller.close();
            } catch {
              /* already closed */
            }
          });
        }, 4000);
      },
      cancel() {
        closed = true;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  });
}
