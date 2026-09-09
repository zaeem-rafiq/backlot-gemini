import { StreamEvent } from "@/lib/types/events";

export interface SSEStreamConsumerOptions {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  onEvent: (event: StreamEvent) => void;
  onError: (error: Error | string) => void;
  onPrematureEOF: (errorMessage: string) => void;
}

export interface SSEStreamConsumerResult {
  terminalEventReceived: boolean;
  terminalEventKind?: "done" | "error";
}

/**
 * Robust consumer for Server-Sent Events (SSE) from the Backlot studio run endpoint.
 *
 * Enforces:
 * 1. Explicit tracking of terminal events ('done' or 'error').
 * 2. Classification of unexpected EOF (stream end without terminal event) as a visible, recoverable error.
 * 3. Consistent handling of network transport errors during chunk reading.
 * 4. Proper decoder flushing and processing of trailing buffered data across chunk boundaries.
 */
export async function consumeStudioSSEStream(
  options: SSEStreamConsumerOptions
): Promise<SSEStreamConsumerResult> {
  const { reader, onEvent, onError, onPrematureEOF } = options;
  const decoder = new TextDecoder();
  let buffer = "";
  let terminalEventReceived = false;
  let terminalEventKind: "done" | "error" | undefined;

  const handleLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;

    const jsonStr = trimmed.replace(/^data:\s*/, "");
    if (!jsonStr) return;

    try {
      const event: StreamEvent = JSON.parse(jsonStr);
      if (event.type === "done" || event.type === "error") {
        terminalEventReceived = true;
        terminalEventKind = event.type;
      }
      onEvent(event);
    } catch (parseErr) {
      console.error("Error parsing SSE JSON payload:", parseErr, "Payload:", jsonStr);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        handleLine(line);
      }
    }

    // Flush any remaining buffered characters from the decoder
    buffer += decoder.decode();
    if (buffer.trim()) {
      const remainingLines = buffer.split("\n\n");
      for (const line of remainingLines) {
        handleLine(line);
      }
    }

    if (!terminalEventReceived) {
      const prematureMessage =
        "Stream terminated unexpectedly before studio run completed (premature EOF).";
      onPrematureEOF(prematureMessage);
    }

    return {
      terminalEventReceived,
      terminalEventKind,
    };
  } catch (err: any) {
    onError(err instanceof Error ? err : String(err));
    return {
      terminalEventReceived: false,
    };
  }
}
