import { describe, it, expect, vi } from "vitest";
import {
  AgentRuntimeMarqueeClient,
  AgentRuntimeError,
  AgentRuntimeTimeoutError,
  AgentRuntimeAuthenticationError,
  AgentRuntimeValidationError,
  AgentRuntimeFinancialTamperingError,
} from "../agent-runtime-client";
import { DirectorOrchestrator } from "../director";
import { InkAgent } from "../ink";
import { SlateAgent } from "../slate";
import { EaselAgent } from "../easel";
import { MarqueeAgent } from "../marquee";
import { ScriptParse } from "../../types/screenplay";
import { Coverage } from "../../types/coverage";
import { Budget } from "../../types/budget";
import { ScriptBreakdown } from "../../types/breakdown";
import { PitchKit } from "../../types/pitch";
import { StreamEvent } from "../../types/events";
import { FREQUENCY_ZERO_PARSED } from "../../../fixtures/frequency-zero";

describe("AgentRuntimeMarqueeClient — Google Agent Runtime Remote Boundary", () => {
  const mockScriptParse: ScriptParse = FREQUENCY_ZERO_PARSED;

  const mockCoverage: Coverage = {
    logline: mockScriptParse.logline,
    synopsis: "A midnight radio DJ receives tomorrow's fatal broadcast.",
    genre: ["Sci-Fi", "Thriller"],
    tone: "Moody thriller",
    themes: ["Fate", "Courage"],
    comparables: [{ title: "The Vast of Night", why: "Contained audio sci-fi" }],
    strengths: ["High tension"],
    concerns: [],
    pacingNotes: "Pacing ramps steadily.",
    scores: { premise: 9, structure: 9, character: 8, dialogue: 8, marketability: 9 },
    verdict: "RECOMMEND",
    verdictRationale: "High production value contained thriller.",
    pullQuote: "Electrifying audio suspense.",
  };

  const mockBudget: Budget = {
    sections: [
      {
        category: "Post Production",
        subtotal: 650,
        items: [
          {
            category: "Post Production",
            item: "Sound Design, Foley & Mix",
            unit: "flat",
            qty: 1,
            rate: 650,
            total: 650,
            tracesTo: "Custom audio post-production package",
          },
        ],
      },
    ],
    summary: {
      crewSubtotal: 0,
      nightPremiumTotal: 0,
      castSubtotal: 0,
      equipmentSubtotal: 0,
      locationsLogisticsSubtotal: 0,
      postSubtotal: 650,
      subtotalBeforeContingency: 650,
      contingencyTotal: 65,
      grandTotal: 715,
    },
    rateCardName: "Standard SAG Indie Rate Card",
    currency: "USD",
  };

  const mockBreakdown: ScriptBreakdown = {
    breakdowns: [
      {
        sceneId: 1,
        cast: ["JACK"],
        background: [],
        props: ["MICROPHONE"],
        setDressing: [],
        wardrobe: [],
        makeupHair: [],
        vehicles: [],
        sfx: [],
        vfx: [],
        stunts: [],
        animals: [],
        sound: [],
        specialEquipment: [],
        complexity: 2,
        complexityReason: "Studio dialogue",
      },
    ],
  };

  const mockPitchKit: PitchKit = {
    tagline: "Tomorrow's news is tonight's last broadcast.",
    loglines: [
      "A radio host intercepts tomorrow's warning on tonight's airwaves.",
      "Static yields secrets from 24 hours ahead.",
      "One booth, one frequency, no way out.",
    ],
    whyNow: "Resonant resurgence of analogue audio sci-fi thrillers.",
    audience: {
      primary: "Fans of Twilight Zone and Vast of Night",
      secondary: "Indie festival programmers",
    },
    festivalStrategy: [
      {
        name: "Sundance Film Festival (Shorts)",
        tier: "Tier 1 / Oscar Qualifying",
        why: "Contained narrative economy.",
      },
    ],
    posterConcept: {
      description: "Glowing radio transmitter overlooking a rain-slicked desert bridge.",
      imagePrompt: "Cinematic movie poster of glowing radio tube in thunderstorm, 2:3 vertical.",
    },
    pitchParagraph: "Carrying a RECOMMEND verdict and an audited budget of $715.",
    marketEvidence: [
      {
        title: "ScreenCraft — The Guts of Genre Craft",
        url: "https://screencraft.org/genre-craft-panel",
        snippet: "Filmmakers agreed that bespoke sound design and foley are what separate amateur shorts from festival selections.",
        query: "indie short film audio post comps",
        relevance: "Audio engineering craft benchmark",
      },
    ],
    productionRecommendation: {
      title: "Protect Sound Design Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: "Filmmakers agreed that bespoke sound design and foley are what separate amateur shorts from festival selections.",
      inferredAdvice: "Protect the $650 sound design allocation against budget cuts.",
      actionableDecision: "Protect the $650 Sound Design, Foley & Mix line item.",
      tradeoffRationale: "Atmospheric audio creates competitive festival positioning.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account 6000: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: {
        title: "ScreenCraft — The Guts of Genre Craft",
        url: "https://screencraft.org/genre-craft-panel",
        snippet: "Filmmakers agreed that bespoke sound design and foley are what separate amateur shorts from festival selections.",
        query: "indie short film audio post comps",
        relevance: "Audio engineering craft benchmark",
      },
    },
  };

  it("successfully invokes remote Agent Runtime and returns schema-validated Pitch Kit with provider telemetry", async () => {
    const mockFetch = vi.fn().mockImplementation(async (url, opts) => {
      expect(opts.headers["x-backlot-run-id"]).toBe("run_test_123");
      const parsedBody = JSON.parse(opts.body);
      expect(parsedBody.class_method).toBe("generate_pitch_kit");
      expect(parsedBody.input.runId).toBe("run_test_123");

      return {
        ok: true,
        status: 200,
        json: async () => ({
          output: {
            runId: "run_test_123",
            pitchKit: mockPitchKit,
            modelUsed: "gemini-3.1-flash-lite",
            durationMs: 1250,
            observedMetadata: {
              provider: "google-genai",
              modelConfigured: "gemini-3.1-flash-lite",
              modelObserved: "gemini-3.1-flash-lite",
              durationMs: 1250,
              marketEvidenceCount: 1,
              hasProductionRecommendation: true,
              timestamp: "2026-09-09T02:00:00.000Z",
            },
          },
        }),
      };
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://us-central1-aiplatform.googleapis.com/v1/projects/polygraph-hackathon/locations/us-central1/reasoningEngines/123:query",
      authToken: "test-auth-token",
      fetchFn: mockFetch as any,
    });

    const result = await client.generatePitchKit(
      "run_test_123",
      mockScriptParse,
      mockCoverage,
      mockBudget,
      mockBreakdown
    );

    expect(result.runId).toBe("run_test_123");
    expect(result.pitchKit.tagline).toBe(mockPitchKit.tagline);
    expect(result.modelUsed).toBe("gemini-3.1-flash-lite");
    expect(result.durationMs).toBe(1250);
    expect(result.observedMetadata.provider).toBe("google-genai");
    expect(result.observedMetadata.marketEvidenceCount).toBe(1);
  });

  it("rejects response when returned runId does not match originating runId", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        output: {
          runId: "run_different_id_456", // Mismatched ID!
          pitchKit: mockPitchKit,
          modelUsed: "gemini-3.1-flash-lite",
        },
      }),
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_expected_123",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeValidationError);
  });

  it("rejects remote response that attempts to replace or tamper with deterministic budget totals", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        output: {
          runId: "run_test_123",
          pitchKit: mockPitchKit,
          modelUsed: "gemini-3.1-flash-lite",
          // Remote agent attempts to override budget grand total!
          budget: {
            ...mockBudget,
            summary: {
              ...mockBudget.summary,
              grandTotal: 999999, // Tampered financial total!
            },
          },
        },
      }),
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_test_123",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeFinancialTamperingError);
  });

  it("handles network timeout explicitly and throws AgentRuntimeTimeoutError", async () => {
    const mockFetch = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          setTimeout(() => reject(err), 20);
        })
    );

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      timeoutMs: 10,
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_test_123",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeTimeoutError);
  });

  it("handles authentication failure (HTTP 401/403) explicitly without silent retry", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Missing or expired IAM credentials for Vertex AI Reasoning Engine.",
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_test_123",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeAuthenticationError);
  });

  it("handles remote server errors (HTTP 500) explicitly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "Agent Runtime container crashed during synthesis.",
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_test_123",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeError);
  });

  it("handles malformed non-JSON responses explicitly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON at position 0");
      },
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_test_123",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeValidationError);
  });

  it("handles Pitch Kit schema violations explicitly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        output: {
          runId: "run_test_123",
          pitchKit: {
            // Missing required fields (tagline, loglines, etc.)
            description: "Just a plain string",
          },
          modelUsed: "gemini-3.1-flash-lite",
        },
      }),
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_test_123",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeValidationError);
  });

  it("withholds remote recommendation if it fails originating budget cross-verification", async () => {
    const recWithInvalidBudgetTarget: PitchKit = {
      ...mockPitchKit,
      productionRecommendation: {
        ...mockPitchKit.productionRecommendation!,
        affectedArtifact: {
          kind: "budget_line_item",
          identifier: "Nonexistent Drone Crew Department", // Target not in budget!
          label: "Unknown",
          tabTarget: "BUDGET",
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        output: {
          runId: "run_test_123",
          pitchKit: recWithInvalidBudgetTarget,
          modelUsed: "gemini-3.1-flash-lite",
        },
      }),
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    const result = await client.generatePitchKit(
      "run_test_123",
      mockScriptParse,
      mockCoverage,
      mockBudget,
      mockBreakdown
    );

    // Pitch kit is preserved, but invalid recommendation is safely withheld (null)
    expect(result.pitchKit.tagline).toBe(mockPitchKit.tagline);
    expect(result.pitchKit.productionRecommendation).toBeNull();
  });

  it("propagates caller AbortSignal cancellation explicitly", async () => {
    const callerController = new AbortController();
    const mockFetch = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Slow network")), 500);
        })
    );

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    const runPromise = client.generatePitchKit(
      "run_abort_test",
      mockScriptParse,
      mockCoverage,
      mockBudget,
      mockBreakdown,
      { signal: callerController.signal }
    );

    // Caller aborts mid-flight
    callerController.abort(new Error("User cancelled run"));

    await expect(runPromise).rejects.toThrow("User cancelled run");
  });

  it("keeps request timeout active through response body stream parsing", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        new Promise((_, reject) => {
          // Simulate hung response stream that exceeds timeout
          setTimeout(() => {
            const err = new Error("Stream timed out");
            err.name = "AbortError";
            reject(err);
          }, 30);
        }),
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      timeoutMs: 15,
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_stream_timeout",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeTimeoutError);
  });

  it("rejects response when returned runId is missing entirely", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        output: {
          // runId omitted entirely!
          pitchKit: mockPitchKit,
          modelUsed: "gemini-3.1-flash-lite",
        },
      }),
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_expected_missing",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeValidationError);
  });

  it("rejects response when modelUsed is missing (refuses to fabricate observed model metadata)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        output: {
          runId: "run_test_no_model",
          pitchKit: mockPitchKit,
          // modelUsed omitted!
        },
      }),
    });

    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_test_no_model",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(AgentRuntimeValidationError);
  });

  it("resolves Vertex AI ReasoningEngine resource name to canonical :query REST endpoint", () => {
    const client = new AgentRuntimeMarqueeClient({
      resourceName: "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/backlot-marquee-v1",
    });

    expect(client.isConfigured()).toBe(true);
    expect(client.getResourceName()).toBe("projects/polygraph-hackathon/locations/us-central1/reasoningEngines/backlot-marquee-v1");
    expect(client.getEndpoint()).toBe(
      "https://us-central1-aiplatform.googleapis.com/v1/projects/polygraph-hackathon/locations/us-central1/reasoningEngines/backlot-marquee-v1:query"
    );
  });

  it("strictly requires managed resource configuration in production", async () => {
    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      const client = new AgentRuntimeMarqueeClient({ endpoint: "" });

      await expect(
        client.generatePitchKit(
          "run_prod_test",
          mockScriptParse,
          mockCoverage,
          mockBudget,
          mockBreakdown
        )
      ).rejects.toThrow(AgentRuntimeError);
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });

  it("in production, requires canonical ReasoningEngine resource name and prevents legacy generic endpoint variables from overriding it", async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevLegacyUrl = process.env.AGENT_RUNTIME_URL;
    const prevResourceName = process.env.VERTEX_REASONING_ENGINE_RESOURCE_NAME;

    try {
      process.env.NODE_ENV = "production";
      process.env.AGENT_RUNTIME_URL = "https://legacy-unmanaged-endpoint.example.com";
      process.env.VERTEX_REASONING_ENGINE_RESOURCE_NAME = "";

      // Client with legacy variable set in production must NOT be configured
      const clientWithLegacyOnly = new AgentRuntimeMarqueeClient();
      expect(clientWithLegacyOnly.isConfigured()).toBe(false);
      expect(clientWithLegacyOnly.getEndpoint()).toBe("");

      await expect(
        clientWithLegacyOnly.generatePitchKit(
          "run_prod_legacy",
          mockScriptParse,
          mockCoverage,
          mockBudget,
          mockBreakdown
        )
      ).rejects.toThrow("canonical ReasoningEngine resource target is strictly required in production");

      // With canonical resource name, it derives the canonical :query URL
      const clientWithCanonical = new AgentRuntimeMarqueeClient({
        resourceName: "projects/polygraph-hackathon/locations/us-central1/reasoningEngines/backlot-marquee-v1",
      });
      expect(clientWithCanonical.isConfigured()).toBe(true);
      expect(clientWithCanonical.getEndpoint()).toBe(
        "https://us-central1-aiplatform.googleapis.com/v1/projects/polygraph-hackathon/locations/us-central1/reasoningEngines/backlot-marquee-v1:query"
      );
    } finally {
      process.env.NODE_ENV = prevEnv;
      process.env.AGENT_RUNTIME_URL = prevLegacyUrl;
      process.env.VERTEX_REASONING_ENGINE_RESOURCE_NAME = prevResourceName;
    }
  });

  it("rechecks caller cancellation after token acquisition before network dispatch", async () => {
    const callerController = new AbortController();
    const mockFetch = vi.fn();

    // Client with an explicit auth token probe that triggers abort during resolution
    const client = new AgentRuntimeMarqueeClient({
      endpoint: "https://agent-runtime.example.com/api/reasoning_engine",
      authToken: undefined,
      fetchFn: mockFetch as any,
    });

    const prevGcpToken = process.env.GCP_ACCESS_TOKEN;
    try {
      // Set a token so token acquisition completes, but abort caller before dispatch
      process.env.GCP_ACCESS_TOKEN = "test-token";

      // Abort signal right before dispatch
      callerController.abort(new Error("Cancelled after auth"));

      await expect(
        client.generatePitchKit(
          "run_abort_post_auth",
          mockScriptParse,
          mockCoverage,
          mockBudget,
          mockBreakdown,
          { signal: callerController.signal }
        )
      ).rejects.toThrow("Cancelled after auth");

      // Verify that network fetch was NEVER called!
      expect(mockFetch).not.toHaveBeenCalled();
    } finally {
      process.env.GCP_ACCESS_TOKEN = prevGcpToken;
    }
  });
});

describe("Director Orchestrator with Google Agent Runtime", () => {
  it("when Google Agent Runtime fails, Director produces explicit error state and NEVER falls back to local Marquee", async () => {
    const mockInk = {
      parseScript: vi.fn().mockResolvedValue({
        scriptParse: FREQUENCY_ZERO_PARSED,
        modelUsed: "gemini-3.5-flash",
      }),
      generateCoverage: vi.fn().mockResolvedValue({
        coverage: {
          logline: FREQUENCY_ZERO_PARSED.logline,
          synopsis: "Contained suspense.",
          genre: ["Sci-Fi"],
          tone: "Moody",
          themes: [],
          comparables: [],
          strengths: [],
          concerns: [],
          pacingNotes: "",
          scores: { premise: 8, structure: 8, character: 8, dialogue: 8, marketability: 8 },
          verdict: "CONSIDER",
          verdictRationale: "",
          pullQuote: "",
        },
        modelUsed: "gemini-3.5-flash",
      }),
    } as unknown as InkAgent;

    const mockSlate = {
      breakdownScript: vi.fn().mockResolvedValue({
        scriptBreakdown: { breakdowns: [] },
        modelUsed: "gemini-3.5-flash",
      }),
    } as unknown as SlateAgent;

    const mockEasel = {
      generateBoardPlan: vi.fn().mockResolvedValue({
        boardPlan: { visualStyleStatement: "Moody", aspectRatio: "2.39:1", frames: [] },
        modelUsed: "gemini-3.1-flash-lite",
      }),
    } as unknown as EaselAgent;

    // A local MarqueeAgent spy to verify it is NEVER called on remote failure!
    const localMarqueeSpy = {
      generatePitchKit: vi.fn().mockResolvedValue({
        pitchKit: { tagline: "Local fallback pitch kit" },
        modelUsed: "local-model",
      }),
    } as unknown as MarqueeAgent;

    // Failing remote Agent Runtime client
    const failingRemoteClient = {
      isConfigured: vi.fn().mockReturnValue(true),
      getEndpoint: vi.fn().mockReturnValue("https://agent-runtime.example.com/api/reasoning_engine"),
      generatePitchKit: vi.fn().mockRejectedValue(
        new AgentRuntimeError("Vertex AI Reasoning Engine container timeout after 60s", "AGENT_RUNTIME_TIMEOUT", "run_fail_test")
      ),
    } as unknown as AgentRuntimeMarqueeClient;

    const director = new DirectorOrchestrator(
      mockInk,
      mockSlate,
      mockEasel,
      localMarqueeSpy,
      failingRemoteClient
    );

    const emittedEvents: StreamEvent[] = [];
    let caughtError: unknown = null;

    try {
      await director.executeRun("INT. RADIO BOOTH - NIGHT\nJack speaks.", {
        runId: "run_fail_test",
        agentRuntimeClient: failingRemoteClient,
        onEvent: (ev) => emittedEvents.push(ev),
      });
    } catch (err) {
      caughtError = err;
    }

    // 1. Must throw fatal error
    expect(caughtError).toBeDefined();
    expect((caughtError as Error).message).toContain("Vertex AI Reasoning Engine container timeout");

    // 2. Local Marquee agent MUST NOT have been called (no silent fallback!)
    expect(localMarqueeSpy.generatePitchKit).not.toHaveBeenCalled();

    // 3. Error event emitted to stream with fatal: true
    const errorEvent = emittedEvents.find((e) => e.type === "error");
    expect(errorEvent).toBeDefined();
    expect((errorEvent as any).fatal).toBe(true);

    // 4. Marquee agent status event must be "error"
    const marqueeStatusEvent = emittedEvents.find(
      (e) => e.type === "agent_status" && (e as any).agent === "marquee" && (e as any).status === "error"
    );
    expect(marqueeStatusEvent).toBeDefined();

    // 5. Director status event must be "error"
    const directorStatusEvent = emittedEvents.find(
      (e) => e.type === "agent_status" && (e as any).agent === "director" && (e as any).status === "error"
    );
    expect(directorStatusEvent).toBeDefined();

    // 6. Must NOT have emitted a "done" event
    const doneEvent = emittedEvents.find((e) => e.type === "done");
    expect(doneEvent).toBeUndefined();
  });

  it("Director in production refuses fallback to local Marquee when Agent Runtime is unconfigured", async () => {
    const prevEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";

      const mockInk = {
        parseScript: vi.fn().mockResolvedValue({
          scriptParse: FREQUENCY_ZERO_PARSED,
          modelUsed: "gemini-3.5-flash",
        }),
        generateCoverage: vi.fn().mockResolvedValue({
          coverage: {
            logline: FREQUENCY_ZERO_PARSED.logline,
            synopsis: "Contained suspense.",
            genre: ["Sci-Fi"],
            tone: "Moody",
            themes: [],
            comparables: [],
            strengths: [],
            concerns: [],
            pacingNotes: "",
            scores: { premise: 8, structure: 8, character: 8, dialogue: 8, marketability: 8 },
            verdict: "CONSIDER",
            verdictRationale: "",
            pullQuote: "",
          },
          modelUsed: "gemini-3.5-flash",
        }),
      } as unknown as InkAgent;

      const mockSlate = {
        breakdownScript: vi.fn().mockResolvedValue({
          scriptBreakdown: { breakdowns: [] },
          modelUsed: "gemini-3.5-flash",
        }),
      } as unknown as SlateAgent;

      const mockEasel = {
        generateBoardPlan: vi.fn().mockResolvedValue({
          boardPlan: { visualStyleStatement: "Moody", aspectRatio: "2.39:1", frames: [] },
          modelUsed: "gemini-3.1-flash-lite",
        }),
      } as unknown as EaselAgent;

      const localMarqueeSpy = {
        generatePitchKit: vi.fn().mockResolvedValue({
          pitchKit: { tagline: "Local fallback pitch kit" },
          modelUsed: "local-model",
        }),
      } as unknown as MarqueeAgent;

      // Unconfigured client
      const unconfiguredClient = new AgentRuntimeMarqueeClient({ endpoint: "" });

      const director = new DirectorOrchestrator(
        mockInk,
        mockSlate,
        mockEasel,
        localMarqueeSpy,
        unconfiguredClient
      );

      let caughtError: unknown = null;
      try {
        await director.executeRun("INT. RADIO BOOTH - NIGHT\nJack speaks.", {
          runId: "run_prod_unconfigured",
          agentRuntimeClient: unconfiguredClient,
          onEvent: () => {},
        });
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(AgentRuntimeError);
      expect((caughtError as Error).message).toContain("strictly required in production");
      expect(localMarqueeSpy.generatePitchKit).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});
