import { NextRequest } from "next/server";
import { DirectorOrchestrator } from "@/lib/agents/director";
import { StreamEvent } from "@/lib/types/events";
import { FREQUENCY_ZERO_SCRIPT } from "@/fixtures/frequency-zero";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const screenplayText = (body.screenplayText as string) || FREQUENCY_ZERO_SCRIPT;
    const enableImages = Boolean(body.enableImages);

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (event: StreamEvent) => {
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      await writer.write(encoder.encode(payload));
    };

    // Run the pipeline in background while streaming
    (async () => {
      const director = new DirectorOrchestrator();
      try {
        await director.executeRun(screenplayText, {
          enableImages,
          onEvent: (event) => {
            sendEvent(event).catch((e) => {
              console.error("Error writing SSE stream event:", e);
            });
          },
        });
      } catch (runErr) {
        console.error("Director run error:", runErr);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("API /api/run route error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
