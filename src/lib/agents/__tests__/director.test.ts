import { describe, it, expect, vi } from "vitest";
import { DirectorOrchestrator } from "../director";
import { InkAgent } from "../ink";
import { SlateAgent } from "../slate";
import { EaselAgent } from "../easel";
import { MarqueeAgent } from "../marquee";
import { StreamEvent } from "../../types/events";
import { FREQUENCY_ZERO_SCRIPT, FREQUENCY_ZERO_PARSED } from "../../../fixtures/frequency-zero";
import { Coverage } from "../../types/coverage";
import { ScriptBreakdown } from "../../types/breakdown";
import { BoardPlan } from "../../types/storyboard";
import { PitchKit } from "../../types/pitch";

describe("Director Orchestrator Pipeline", () => {
  it("orchestrates all 5 agents (Ink, Slate, Ledger, Easel, Marquee) with streaming events and provenance", async () => {
    const mockCoverage: Coverage = {
      logline: FREQUENCY_ZERO_PARSED.logline,
      synopsis: "A radio DJ races against time.",
      genre: ["Sci-Fi", "Thriller"],
      tone: "Moody thriller",
      themes: ["Fate", "Courage"],
      comparables: [{ title: "The Vast of Night", why: "Audio-centric retro thriller" }],
      strengths: ["Original concept", "High tension"],
      concerns: ["Needs precise stunt coordination"],
      pacingNotes: "Pacing ramps up continuously.",
      scores: { premise: 9, structure: 9, character: 8, dialogue: 8, marketability: 9 },
      verdict: "RECOMMEND",
      verdictRationale: "Exceptional concept and execution.",
      pullQuote: "Electrifying high-concept storytelling.",
    };

    const mockBreakdown: ScriptBreakdown = {
      breakdowns: [
        {
          sceneId: 1,
          cast: ["JACK", "MAYA"],
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
        {
          sceneId: 8,
          cast: ["JACK"],
          background: [],
          props: ["FLARE"],
          setDressing: [],
          wardrobe: [],
          makeupHair: [],
          vehicles: [],
          sfx: ["RAIN EFFECTS"],
          vfx: [],
          stunts: ["GUARDRAIL DIVE"],
          animals: [],
          sound: [],
          specialEquipment: [],
          complexity: 5,
          complexityReason: "Night stunt fall",
        },
      ],
    };

    const mockBoardPlan: BoardPlan = {
      visualStyleStatement: "1970s warm amber neon interior contrasting cold torrential night exterior",
      aspectRatio: "2.39:1",
      frames: [
        {
          sceneId: 1,
          frameId: "1A",
          shotType: "CU",
          movement: "STATIC",
          lensMm: "50mm anamorphic",
          description: "Jack speaks into the glowing RCA ribbon mic.",
          blocking: "Jack seated, leaning forward.",
          lighting: "Amber desk lamp key, cool violet oscilloscope back fill.",
          imagePrompt: "Cinematic close-up of a 50-year-old radio DJ speaking into a vintage 1970s ribbon microphone in a moody desert broadcast booth, amber practical lighting, 35mm film grain, 2.39:1 aspect ratio.",
        },
        {
          sceneId: 8,
          frameId: "8A",
          shotType: "WS",
          movement: "HANDHELD",
          lensMm: "35mm anamorphic",
          description: "Jack dives over the bridge guardrail in pouring rain as freight truck headlights sweep across.",
          blocking: "Jack leaping left to right into dark gravel bank.",
          lighting: "Harsh blinding halogen truck headlights cutting through torrential rain.",
          imagePrompt: "Wide cinematic angle of a man diving over a highway guardrail on a rain-slicked desert bridge at night, blinding truck headlights, torrential rain, 2.39:1 aspect ratio.",
        },
      ],
    };

    const mockPitchKit: PitchKit = {
      tagline: "Tomorrow's news is tonight's last broadcast.",
      loglines: [
        "When an isolated desert DJ intercepts a broadcast from 24 hours in the future predicting a fatal highway collapse, he must risk everything on live air to stop an oncoming freight convoy.",
        "A graveyard-shift radio DJ receives tomorrow's fatal news on tonight's airwaves.",
        "One night, one microphone, and a warning from twenty-four hours ahead.",
      ],
      whyNow: "Resonant resurgence in contained analogue audio-thrillers and high-concept single-night suspense.",
      audience: {
        primary: "Adults 18-35 fans of atmospheric sci-fi and Twilight Zone/Vast of Night suspense.",
        secondary: "Indie festival programmers and episodic anthology development executives.",
      },
      festivalStrategy: [
        {
          name: "Sundance Film Festival (Shorts)",
          tier: "Tier 1 / Oscar Qualifying",
          why: "Premise originality and tight structural economy make it a prime contender for narrative short programming.",
        },
        {
          name: "SXSW Midnighters (Shorts)",
          tier: "Genre Specialist",
          why: "High-octane practical SFX and audio-driven suspense align directly with midnight programming taste.",
        },
      ],
      posterConcept: {
        description: "Vertical key art featuring a glowing vacuum tube transmitter silhouette over a rainy canyon bridge.",
        imagePrompt: "Movie poster for FREQUENCY ZERO, glowing vintage radio dial and shadowy desert bridge in a thunderstorm, typography title, 2:3 vertical aspect ratio.",
      },
      pitchParagraph:
        "Backed by an Ink Story Analyst verdict of RECOMMEND and an audited Ledger budget total of $18,450, FREQUENCY ZERO is an airtight proof-of-concept for high-concept sci-fi suspense.",
      marketEvidence: [
        {
          title: "Sundance Short Film Track Record",
          url: "https://www.sundance.org/festivals/short-film-program",
          snippet: "Narrative sci-fi and thriller shorts with tight structural containment achieve top programmer conversion.",
          query: "Sundance short film festival market comps",
          relevance: "Validates festival selection strategy.",
        },
      ],
    };

    const mockInk = {
      parseScript: vi.fn().mockResolvedValue({
        scriptParse: FREQUENCY_ZERO_PARSED,
        modelUsed: "gemini-3.5-flash",
        durationMs: 1200,
      }),
      generateCoverage: vi.fn().mockResolvedValue({
        coverage: mockCoverage,
        modelUsed: "gemini-3.5-flash",
        durationMs: 1800,
      }),
    } as unknown as InkAgent;

    const mockSlate = {
      breakdownScript: vi.fn().mockResolvedValue({
        scriptBreakdown: mockBreakdown,
        modelUsed: "gemini-3.5-flash",
        durationMs: 1500,
      }),
    } as unknown as SlateAgent;

    const mockEasel = {
      generateBoardPlan: vi.fn().mockResolvedValue({
        boardPlan: mockBoardPlan,
        modelUsed: "gemini-3.1-flash-lite",
        durationMs: 1100,
      }),
    } as unknown as EaselAgent;

    const mockMarquee = {
      generatePitchKit: vi.fn().mockResolvedValue({
        pitchKit: mockPitchKit,
        modelUsed: "gemini-3.1-flash-lite",
        durationMs: 1400,
      }),
    } as unknown as MarqueeAgent;

    const director = new DirectorOrchestrator(mockInk, mockSlate, mockEasel, mockMarquee);

    const emittedEvents: StreamEvent[] = [];
    const runState = await director.executeRun(FREQUENCY_ZERO_SCRIPT, {
      onEvent: (event) => emittedEvents.push(event),
    });

    expect(runState.status).toBe("complete");
    expect(runState.scriptParse).toBeDefined();
    expect(runState.coverage).toBeDefined();
    expect(runState.breakdown).toBeDefined();
    expect(runState.schedule).toBeDefined();
    expect(runState.budget).toBeDefined();
    expect(runState.boardPlan).toBeDefined();
    expect(runState.pitchKit).toBeDefined();

    // Verify Pitch Kit references coverage verdict and budget
    expect(runState.pitchKit?.pitchParagraph).toContain("RECOMMEND");
    expect(runState.pitchKit?.pitchParagraph).toContain("$");
    expect(runState.pitchKit?.marketEvidence.length).toBeGreaterThan(0);

    // Verify all 7 artifact kinds emitted in stream
    const artifacts = emittedEvents.filter((e) => e.type === "artifact");
    const kinds = artifacts.map((a: any) => a.kind);
    expect(kinds).toEqual(["scriptParse", "coverage", "breakdown", "schedule", "budget", "boardPlan", "pitchKit"]);
  });
});
