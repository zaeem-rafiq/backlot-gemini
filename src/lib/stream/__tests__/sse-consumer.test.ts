import { describe, it, expect, vi } from "vitest";
import { consumeStudioSSEStream } from "../sse-consumer";
import { StreamEvent } from "@/lib/types/events";

function createMockReadableStream(chunks: string[], throwOnChunkIndex?: number): ReadableStreamDefaultReader<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return {
    read: vi.fn().mockImplementation(async () => {
      if (throwOnChunkIndex !== undefined && index === throwOnChunkIndex) {
        throw new Error("Network disconnect simulated");
      }
      if (index >= chunks.length) {
        return { done: true, value: undefined };
      }
      const val = encoder.encode(chunks[index]);
      index++;
      return { done: false, value: val };
    }),
    releaseLock: vi.fn(),
    cancel: vi.fn(),
    closed: Promise.resolve(undefined),
  } as unknown as ReadableStreamDefaultReader<Uint8Array>;
}

describe("consumeStudioSSEStream — Stream Failure Recovery & Boundary Integrity", () => {
  it("processes normal stream and registers terminal completion", async () => {
    const chunks = [
      `data: {"type":"agent_log","agent":"director","level":"info","message":"Starting pre-production studio run [run_123456789].","timestamp":"2026-09-08T00:00:00.000Z"}\n\n`,
      `data: {"type":"artifact","kind":"scriptParse","data":{"title":"THE LAST REEL","format":"short","logline":"A projectionist faces the end.","scenes":[]}}\n\n`,
      `data: {"type":"done","runId":"run_123456789","durationMs":28000,"modelsUsed":["gemini-3.5-flash","gemini-3.1-flash-lite"]}\n\n`,
    ];

    const reader = createMockReadableStream(chunks);
    const events: StreamEvent[] = [];
    const prematureErrors: string[] = [];
    const errors: string[] = [];

    const result = await consumeStudioSSEStream({
      reader,
      onEvent: (e) => events.push(e),
      onPrematureEOF: (msg) => prematureErrors.push(msg),
      onError: (err) => errors.push(String(err)),
    });

    expect(result.terminalEventReceived).toBe(true);
    expect(events.length).toBe(3);
    expect(prematureErrors.length).toBe(0);
    expect(errors.length).toBe(0);
  });

  it("detects premature EOF when stream closes before terminal event and triggers onPrematureEOF", async () => {
    // Stream terminates after scriptParse without done or error event!
    const chunks = [
      `data: {"type":"agent_log","agent":"director","level":"info","message":"Starting pre-production studio run [run_123456789].","timestamp":"2026-09-08T00:00:00.000Z"}\n\n`,
      `data: {"type":"artifact","kind":"scriptParse","data":{"title":"THE LAST REEL","format":"short","logline":"A projectionist faces the end.","scenes":[]}}\n\n`,
    ];

    const reader = createMockReadableStream(chunks);
    const events: StreamEvent[] = [];
    const prematureErrors: string[] = [];
    const errors: string[] = [];

    const result = await consumeStudioSSEStream({
      reader,
      onEvent: (e) => events.push(e),
      onPrematureEOF: (msg) => prematureErrors.push(msg),
      onError: (err) => errors.push(String(err)),
    });

    expect(result.terminalEventReceived).toBe(false);
    expect(events.length).toBe(2);
    expect(prematureErrors.length).toBe(1);
    expect(prematureErrors[0]).toContain("premature EOF");
    expect(errors.length).toBe(0);
  });

  it("handles immediate stream closure on empty stream", async () => {
    const reader = createMockReadableStream([]);
    const events: StreamEvent[] = [];
    const prematureErrors: string[] = [];
    const errors: string[] = [];

    const result = await consumeStudioSSEStream({
      reader,
      onEvent: (e) => events.push(e),
      onPrematureEOF: (msg) => prematureErrors.push(msg),
      onError: (err) => errors.push(String(err)),
    });

    expect(result.terminalEventReceived).toBe(false);
    expect(events.length).toBe(0);
    expect(prematureErrors.length).toBe(1);
  });

  it("catches network error during read and triggers onError", async () => {
    const chunks = [
      `data: {"type":"agent_log","agent":"director","level":"info","message":"Starting pre-production studio run [run_123456789].","timestamp":"2026-09-08T00:00:00.000Z"}\n\n`,
    ];

    const reader = createMockReadableStream(chunks, 1);
    const events: StreamEvent[] = [];
    const prematureErrors: string[] = [];
    const errors: string[] = [];

    const result = await consumeStudioSSEStream({
      reader,
      onEvent: (e) => events.push(e),
      onPrematureEOF: (msg) => prematureErrors.push(msg),
      onError: (err) => errors.push(String(err)),
    });

    expect(result.terminalEventReceived).toBe(false);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("Network disconnect simulated");
  });

  it("flushes and processes final buffered event even without trailing double newline", async () => {
    const chunks = [
      `data: {"type":"agent_log","agent":"director","level":"info","message":"Log 1","timestamp":"2026-09-08T00:00:00.000Z"}\n\n`,
      `data: {"type":"done","runId":"run_999","durationMs":15000}`, // No trailing \n\n!
    ];

    const reader = createMockReadableStream(chunks);
    const events: StreamEvent[] = [];
    const prematureErrors: string[] = [];
    const errors: string[] = [];

    const result = await consumeStudioSSEStream({
      reader,
      onEvent: (e) => events.push(e),
      onPrematureEOF: (msg) => prematureErrors.push(msg),
      onError: (err) => errors.push(String(err)),
    });

    expect(result.terminalEventReceived).toBe(true);
    expect(events.length).toBe(2);
    expect(events[1].type).toBe("done");
    expect(prematureErrors.length).toBe(0);
  });
});
