import { describe, it, expect, vi } from "vitest";
import { GET as healthGet } from "@/app/health/route";
import { GET as reasoningEngineGet, POST as reasoningEnginePost } from "@/app/api/reasoning_engine/route";
import { NextRequest } from "next/server";
import { FREQUENCY_ZERO_PARSED } from "@/fixtures/frequency-zero";
import { MarqueeAgent } from "../marquee";

describe("Agent Runtime API Routes (/health and /api/reasoning_engine)", () => {
  it("GET /health returns 200 with Agent Runtime contract metadata", async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("backlot-agent-runtime");
    expect(body.contract).toContain("Vertex AI Agent Runtime");
  });

  it("GET /api/reasoning_engine returns 200 with supported methods", async () => {
    const res = await reasoningEngineGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.contract).toContain("/api/reasoning_engine");
    expect(body.supportedMethods).toContain("generate_pitch_kit");
  });

  it("POST /api/reasoning_engine validates missing required arguments with 400 Bad Request", async () => {
    const req = new NextRequest("http://localhost:8080/api/reasoning_engine", {
      method: "POST",
      body: JSON.stringify({ input: {} }),
    });

    const res = await reasoningEnginePost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("INVALID_ARGUMENT");
  });

  it("POST /api/reasoning_engine executes MarqueeAgent and returns output envelope", async () => {
    const mockPitchKit = {
      tagline: "Test Tagline",
      loglines: ["Logline 1", "Logline 2", "Logline 3"],
      whyNow: "Timely sci-fi",
      audience: { primary: "General", secondary: "Indie" },
      festivalStrategy: [{ name: "Sundance", tier: "Tier 1 / Oscar Qualifying", why: "Fit" }],
      posterConcept: { description: "Poster", imagePrompt: "Prompt" },
      pitchParagraph: "Backed by RECOMMEND and $715 budget.",
      marketEvidence: [],
      productionRecommendation: null,
    };

    vi.spyOn(MarqueeAgent.prototype, "generatePitchKit").mockResolvedValueOnce({
      pitchKit: mockPitchKit as any,
      modelUsed: "gemini-3.1-flash-lite",
      durationMs: 450,
    });

    const req = new NextRequest("http://localhost:8080/api/reasoning_engine", {
      method: "POST",
      headers: {
        "x-backlot-run-id": "run_route_test_789",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        class_method: "generate_pitch_kit",
        input: {
          runId: "run_route_test_789",
          scriptParse: FREQUENCY_ZERO_PARSED,
          coverage: {
            logline: "logline",
            synopsis: "synopsis",
            genre: ["Sci-Fi"],
            tone: "Moody",
            themes: ["Isolation"],
            comparables: [{ title: "The Vast of Night", why: "Contained sci-fi" }],
            strengths: ["Strong pacing"],
            concerns: ["Budget risk"],
            pacingNotes: "Taut pacing",
            scores: { premise: 8, structure: 8, character: 8, dialogue: 8, marketability: 8 },
            verdict: "RECOMMEND",
            verdictRationale: "High potential",
            pullQuote: "Gripping audio thriller",
          },
          budget: {
            sections: [],
            summary: {
              crewSubtotal: 0,
              nightPremiumTotal: 0,
              castSubtotal: 0,
              equipmentSubtotal: 0,
              locationsLogisticsSubtotal: 0,
              postSubtotal: 715,
              subtotalBeforeContingency: 715,
              contingencyTotal: 0,
              grandTotal: 715,
            },
            rateCardName: "SAG",
            currency: "USD",
          },
          breakdown: { breakdowns: [] },
        },
      }),
    });

    const res = await reasoningEnginePost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.output.runId).toBe("run_route_test_789");
    expect(body.output.pitchKit.tagline).toBe("Test Tagline");
    expect(body.output.modelUsed).toBe("gemini-3.1-flash-lite");
    expect(body.output.observedMetadata.provider).toBe("google-genai");
  });

  it("POST /api/reasoning_engine rejects unsupported class_method with 400 Bad Request", async () => {
    const req = new NextRequest("http://localhost:8080/api/reasoning_engine", {
      method: "POST",
      body: JSON.stringify({
        class_method: "unsupported_operation",
        input: {},
      }),
    });

    const res = await reasoningEnginePost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("INVALID_ARGUMENT");
    expect(body.error.message).toContain("Unsupported class_method");
  });

  it("GET and POST /predict routes forward correctly to Reasoning Engine", async () => {
    const { GET: predictGet, POST: predictPost } = await import("@/app/predict/route");
    const getRes = await predictGet();
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.status).toBe("healthy");

    const req = new NextRequest("http://localhost:8080/predict", {
      method: "POST",
      body: JSON.stringify({ input: {} }),
    });
    const postRes = await predictPost(req);
    expect(postRes.status).toBe(400);
  });
});
