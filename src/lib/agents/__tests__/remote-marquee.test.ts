import { describe, it, expect, vi } from "vitest";
import {
  AgentRuntimeMarqueeClient as RemoteMarqueeClient,
  AgentRuntimeError as ManagedAgentRuntimeError,
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

describe("RemoteMarqueeClient — Managed Agent Runtime Execution", () => {
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

  it("RemoteMarqueeClient defaults to MARQUEE_AGENT_URL and invokes remote agent endpoint", async () => {
    const mockFetch = vi.fn().mockImplementation(async (url, opts) => {
      expect(opts.headers["x-backlot-run-id"]).toBe("run_remote_test");
      const parsedBody = JSON.parse(opts.body);
      expect(parsedBody.input.runId).toBe("run_remote_test");

      return {
        ok: true,
        status: 200,
        json: async () => ({
          output: {
            runId: "run_remote_test",
            pitchKit: mockPitchKit,
            modelUsed: "gemini-3.1-flash-lite",
            durationMs: 1400,
            observedMetadata: {
              provider: "google-genai",
              modelObserved: "gemini-3.1-flash-lite",
            },
          },
        }),
      };
    });

    const client = new RemoteMarqueeClient({
      agentUrl: "https://backlot-marquee-agent-112519007745.us-central1.run.app/predict",
      fetchFn: mockFetch as any,
    });

    const result = await client.generatePitchKit(
      "run_remote_test",
      mockScriptParse,
      mockCoverage,
      mockBudget,
      mockBreakdown
    );

    expect(result.runId).toBe("run_remote_test");
    expect(result.pitchKit.tagline).toBe(mockPitchKit.tagline);
    expect(result.modelUsed).toBe("gemini-3.1-flash-lite");
    expect(result.durationMs).toBe(1400);
  });

  it("RemoteMarqueeClient throws ManagedAgentRuntimeError on remote 500 error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: async () => "Parallel Search API key invalid or expired in Agent Runtime container.",
    });

    const client = new RemoteMarqueeClient({
      agentUrl: "https://backlot-marquee-agent-112519007745.us-central1.run.app/predict",
      fetchFn: mockFetch as any,
    });

    await expect(
      client.generatePitchKit(
        "run_fail_test",
        mockScriptParse,
        mockCoverage,
        mockBudget,
        mockBreakdown
      )
    ).rejects.toThrow(ManagedAgentRuntimeError);
  });

  it("Director orchestrator enforces explicit failure when RemoteMarqueeClient fails (no silent fallback)", async () => {
    const mockInk = {
      parseScript: vi.fn().mockResolvedValue({
        scriptParse: FREQUENCY_ZERO_PARSED,
        modelUsed: "gemini-3.5-flash",
      }),
      generateCoverage: vi.fn().mockResolvedValue({
        coverage: mockCoverage,
        modelUsed: "gemini-3.5-flash",
      }),
    } as unknown as InkAgent;

    const mockSlate = {
      breakdownScript: vi.fn().mockResolvedValue({
        scriptBreakdown: mockBreakdown,
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
        pitchKit: { tagline: "Local fallback" },
        modelUsed: "local-gemini",
      }),
    } as unknown as MarqueeAgent;

    const failingRemoteClient = {
      isConfigured: vi.fn().mockReturnValue(true),
      getEndpoint: vi.fn().mockReturnValue("https://backlot-marquee-agent-112519007745.us-central1.run.app/predict"),
      generatePitchKit: vi.fn().mockRejectedValue(
        new ManagedAgentRuntimeError("Cloud Run Agent Runtime container unreachable (503 Service Unavailable)", "HTTP_503", "run_fatal_777", 503)
      ),
    } as unknown as RemoteMarqueeClient;

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
        runId: "run_fatal_777",
        agentRuntimeClient: failingRemoteClient,
        onEvent: (ev) => emittedEvents.push(ev),
      });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeDefined();
    expect((caughtError as Error).message).toContain("Cloud Run Agent Runtime container unreachable");

    // Local Marquee must NOT be called
    expect(localMarqueeSpy.generatePitchKit).not.toHaveBeenCalled();

    // Must emit fatal error event
    const fatalError = emittedEvents.find((e) => e.type === "error");
    expect(fatalError).toBeDefined();

    // Must NOT emit done event
    const doneEvent = emittedEvents.find((e) => e.type === "done");
    expect(doneEvent).toBeUndefined();
  });
});
