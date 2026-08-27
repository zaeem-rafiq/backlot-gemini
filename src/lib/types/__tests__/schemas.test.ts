import { describe, it, expect } from "vitest";
import {
  ScriptParseSchema,
  CoverageSchema,
  ScriptBreakdownSchema,
  ScheduleSchema,
  BudgetSchema,
  BoardPlanSchema,
  PitchKitSchema,
  StreamEventSchema,
} from "../index";
import { FREQUENCY_ZERO_PARSED } from "../../../fixtures/frequency-zero";

describe("Typed Contracts & Schemas", () => {
  it("validates valid ScriptParse fixture", () => {
    const result = ScriptParseSchema.safeParse(FREQUENCY_ZERO_PARSED);
    expect(result.success).toBe(true);
  });

  it("rejects malformed scene data", () => {
    const invalidScene = {
      title: "Broken",
      format: "short",
      logline: "Test",
      scenes: [
        {
          id: -1, // invalid negative id
          slugline: "INT. ROOM",
          intExt: "INVALID", // invalid intExt
        },
      ],
    };
    const result = ScriptParseSchema.safeParse(invalidScene);
    expect(result.success).toBe(false);
  });

  it("validates Coverage with standard verdicts", () => {
    const validCoverage = {
      logline: "A late-night DJ races against time.",
      synopsis: "Full synopsis paragraphs here...",
      genre: ["Sci-Fi", "Thriller"],
      tone: "Moody high-tension thriller",
      themes: ["Fate vs free will", "Isolation"],
      comparables: [
        {
          title: "The Vast of Night",
          year: 2019,
          why: "Single-night audio-driven mystery setting.",
        },
      ],
      strengths: ["Gripping high concept", "Tight claustrophobic pacing"],
      concerns: ["Requires careful SFX execution on bridge sequence"],
      pacingNotes: "Pacing escalates steadily across scenes 1 through 8.",
      scores: {
        premise: 9,
        structure: 8,
        character: 8,
        dialogue: 8,
        marketability: 9,
      },
      verdict: "RECOMMEND",
      verdictRationale: "Outstanding high-concept short film screenplay.",
      pullQuote: "A masterclass in audio-driven tension.",
    };

    const result = CoverageSchema.safeParse(validCoverage);
    expect(result.success).toBe(true);
  });

  it("validates StreamEvent discriminated union", () => {
    const statusEvent = {
      type: "agent_status",
      agent: "ink",
      status: "working",
      message: "Analyzing scene structure and themes...",
    };
    expect(StreamEventSchema.safeParse(statusEvent).success).toBe(true);

    const logEvent = {
      type: "agent_log",
      agent: "director",
      level: "info",
      message: "Orchestration initialized.",
      timestamp: new Date().toISOString(),
    };
    expect(StreamEventSchema.safeParse(logEvent).success).toBe(true);

    const frameImageEvent = {
      type: "frame_image",
      frameId: "1A",
      imageUrl: "data:image/png;base64,mock",
    };
    expect(StreamEventSchema.safeParse(frameImageEvent).success).toBe(true);
  });

  it("safely accepts null values for optional fields emitted by Gemini structured outputs", () => {
    const coverageWithNullYear = {
      logline: "Test logline",
      synopsis: "Test synopsis",
      genre: ["Drama"],
      tone: "Atmospheric",
      themes: ["Memory"],
      comparables: [
        {
          title: "Pi",
          year: null, // Gemini frequently returns null for unstated years
          why: "Mathematical intensity.",
        },
      ],
      strengths: ["Tight focus"],
      concerns: ["Budget"],
      pacingNotes: "Even pacing.",
      scores: { premise: 8, structure: 7, character: 8, dialogue: 8, marketability: 7 },
      verdict: "CONSIDER",
      verdictRationale: "Solid script.",
      pullQuote: "Intriguing premise.",
    };
    expect(CoverageSchema.safeParse(coverageWithNullYear).success).toBe(true);

    const frameWithNullImage = {
      visualStyleStatement: "Bleak anamorphic neo-noir",
      aspectRatio: "2.39:1",
      frames: [
        {
          sceneId: 1,
          frameId: "1A",
          shotType: "WS",
          movement: "STATIC",
          lensMm: "35mm anamorphic",
          description: "A shadowy figure in a broadcast booth.",
          blocking: "Stationary at microphone.",
          lighting: "Amber desk lamp.",
          imagePrompt: "Photorealistic broadcast booth.",
          imageUrl: null, // null when images are disabled or unrendered
        },
      ],
    };
    expect(BoardPlanSchema.safeParse(frameWithNullImage).success).toBe(true);
  });
});
