import { describe, it, expect, vi } from "vitest";
import { validateProductionRecommendation, MarqueeAgent } from "../marquee";
import { Budget } from "@/lib/types/budget";
import { ParallelSourceCitation, ProductionRecommendation } from "@/lib/types/pitch";
import { ScriptParse } from "@/lib/types/screenplay";
import { Coverage } from "@/lib/types/coverage";
import { ScriptBreakdown } from "@/lib/types/breakdown";
import { GeminiStudioClient } from "@/lib/ai/gemini-client";
import { ParallelSearchClient } from "@/lib/parallel/client";

describe("validateProductionRecommendation — Physical Feasibility & Feasibility Guards", () => {
  const mockBudget: Budget = {
    sections: [
      {
        category: "Crew",
        subtotal: 1350,
        items: [
          {
            category: "Crew",
            item: "Practical SFX Technician",
            unit: "day",
            qty: 1,
            rate: 450,
            total: 450,
            tracesTo: "Practical SFX Tech booked for 1 day(s) ← practical SFX flagged in scene(s): 1, 2",
          },
          {
            category: "Crew",
            item: "Stunt Coordinator",
            unit: "day",
            qty: 1,
            rate: 900,
            total: 900,
            tracesTo: "Stunt Coordinator booked for 1 day(s) ← stunts flagged in scene(s): 2",
          },
        ],
      },
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
            tracesTo: "Sound Design, Foley & Mix for post-production audio package",
          },
        ],
      },
    ],
    summary: {
      crewSubtotal: 1350,
      nightPremiumTotal: 0,
      castSubtotal: 0,
      equipmentSubtotal: 0,
      locationsLogisticsSubtotal: 0,
      postSubtotal: 650,
      subtotalBeforeContingency: 2000,
      contingencyTotal: 200,
      grandTotal: 2200,
    },
    rateCardName: "Standard SAG Indie Rate Card",
    currency: "USD",
  };

  const generalCitation: ParallelSourceCitation = {
    title: "European Short Film Financing & Distribution Models (IndieWire)",
    url: "https://www.indiewire.com/features/general/european-short-film-models",
    snippet: "Regional funding mechanisms in Europe increasingly favor co-productions and festival-first distribution.",
    query: "short film festival market comps",
    relevance: "Regional market strategy benchmark",
  };

  const audioCitation: ParallelSourceCitation = {
    title: "The Vast of Night - Rotten Tomatoes (92% Certified Fresh)",
    url: "https://www.rottentomatoes.com/m/the_vast_of_night",
    snippet: "Critics praised the innovative audio-driven direction and atmospheric sound design.",
    query: "indie sci fi thriller festival breakout sound design",
    relevance: "Audio engineering benchmark",
  };

  it("withholds an unsupported recommendation proposing to divert budget away from script-required crew", () => {
    const unsupportedRec: ProductionRecommendation = {
      title: "Reallocate Practical SFX toward Audio",
      category: "DISTRIBUTION_STRATEGY",
      factualFinding: generalCitation.snippet,
      inferredAdvice: "Divert part of the Practical SFX Technician allocation toward sound design.",
      actionableDecision: "Allocate a portion of the $450 'Practical SFX Technician' budget toward high-quality color grading and sound design.",
      tradeoffRationale: "General festival comps favor audio/visual finish.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Practical SFX Technician",
        label: "Account 2000: Crew / Practical SFX Technician",
        tabTarget: "BUDGET",
      },
      sourceCitation: generalCitation,
    };

    // Because Practical SFX Technician is required by physical scene breakdown (tracesTo flags scene 1, 2)
    // and the general citation does NOT establish that SFX can be defunded:
    // the system must withhold the recommendation!
    const validated = validateProductionRecommendation(unsupportedRec, mockBudget, [generalCitation]);
    expect(validated).toBeNull();
  });

  it("withholds recommendation proposing unsupported budget diversions from script-required crew without rewriting", () => {
    const candidateRec: ProductionRecommendation = {
      title: "Audio Priority",
      category: "BUDGET_ALLOCATION",
      factualFinding: audioCitation.snippet,
      inferredAdvice: "Divert $200 from SFX toward sound design.",
      actionableDecision: "Divert funds from SFX toward Sound Design, Foley & Mix to achieve audio suspense.",
      tradeoffRationale: audioCitation.snippet,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Practical SFX Technician",
        label: "Account 2000: Crew / Practical SFX Technician",
        tabTarget: "BUDGET",
      },
      sourceCitation: audioCitation,
    };

    // For this release: do not rewrite, retarget, or manufacture replacement advice; withhold entirely!
    const validated = validateProductionRecommendation(candidateRec, mockBudget, [audioCitation]);
    expect(validated).toBeNull();
  });

  it("rejects citation when URL does not match an actual returned citation (title match alone is insufficient)", () => {
    const fakeUrlCitation: ParallelSourceCitation = {
      ...audioCitation,
      url: "https://unknown-domain.org/fake-path", // Unknown URL with identical title
    };

    const recWithUnknownUrl: ProductionRecommendation = {
      title: "Protect Sound Design Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: audioCitation.snippet,
      inferredAdvice: "Protect the sound design allocation.",
      actionableDecision: "Protect Sound Design line item.",
      tradeoffRationale: audioCitation.snippet,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account 6000: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: fakeUrlCitation,
    };

    // Must be rejected because URL does not match an actual returned citation
    const validated = validateProductionRecommendation(recWithUnknownUrl, mockBudget, [audioCitation]);
    expect(validated).toBeNull();
  });

  it("rejects nonexistent or ambiguous budget item targets", () => {
    const nonexistentTargetRec: ProductionRecommendation = {
      title: "Protect Nonexistent Item",
      category: "BUDGET_ALLOCATION",
      factualFinding: audioCitation.snippet,
      inferredAdvice: "Allocate budget to non-existent department.",
      actionableDecision: "Increase VFX pipeline funding.",
      tradeoffRationale: audioCitation.snippet,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Nonexistent Visual Department",
        label: "Unknown Account",
        tabTarget: "BUDGET",
      },
      sourceCitation: audioCitation,
    };

    expect(validateProductionRecommendation(nonexistentTargetRec, mockBudget, [audioCitation])).toBeNull();

    // Ambiguous / substring target like "Sound" must be rejected when not an exact unique line item name
    const ambiguousTargetRec: ProductionRecommendation = {
      ...nonexistentTargetRec,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound", // Partial substring
        label: "Sound",
        tabTarget: "BUDGET",
      },
    };
    expect(validateProductionRecommendation(ambiguousTargetRec, mockBudget, [audioCitation])).toBeNull();
  });

  it("rejects advice about post-production Foley/mixing targeting on-set Production Sound Mixer", () => {
    const budgetWithMixer: Budget = {
      ...mockBudget,
      sections: [
        {
          category: "Crew",
          subtotal: 450,
          items: [
            {
              category: "Crew",
              item: "Production Sound Mixer",
              unit: "day",
              qty: 1,
              rate: 450,
              total: 450,
              tracesTo: "Location Sound Mixer booked for 1 shoot day(s)",
            },
          ],
        },
        ...mockBudget.sections.slice(1),
      ],
    };

    const postAudioTargetingCrewRec: ProductionRecommendation = {
      title: "Sound Polish Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: audioCitation.snippet,
      inferredAdvice: "Prioritize post-production foley and mixing.",
      actionableDecision: "Allocate contingency toward custom foley and 5.1 surround sound mix.",
      tradeoffRationale: audioCitation.snippet,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Production Sound Mixer", // Wrong resource: targeting on-set mixer for post foley/mix!
        label: "Account: Crew / Production Sound Mixer",
        tabTarget: "BUDGET",
      },
      sourceCitation: audioCitation,
    };

    // Must be rejected: advice about post-production Foley/mixing must not target an on-set mixer
    const validated = validateProductionRecommendation(postAudioTargetingCrewRec, budgetWithMixer, [audioCitation]);
    expect(validated).toBeNull();
  });

  it("permits valid, supported recommendations targeting enhanceable line items with exact identity", () => {
    const validRec: ProductionRecommendation = {
      title: "Protect Sound Design Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: audioCitation.snippet,
      inferredAdvice: "Protect the $650 sound design allocation against budget cuts.",
      actionableDecision: "Protect the $650 Sound Design line item.",
      tradeoffRationale: audioCitation.snippet,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account 6000: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: audioCitation,
    };

    const validated = validateProductionRecommendation(validRec, mockBudget, [audioCitation]);
    expect(validated).toEqual(validRec);
  });

  it("withholds recommendation when market evidence is empty", () => {
    const validRec: ProductionRecommendation = {
      title: "Protect Sound Design Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: audioCitation.snippet,
      inferredAdvice: "Protect the $650 sound design allocation.",
      actionableDecision: "Protect the $650 Sound Design line item.",
      tradeoffRationale: audioCitation.snippet,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account 6000: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: audioCitation,
    };

    const validated = validateProductionRecommendation(validRec, mockBudget, []);
    expect(validated).toBeNull();
  });
});

describe("MarqueeAgent Normalization Boundary & Provider Mocking", () => {
  const mockScriptParse: ScriptParse = {
    title: "FREQUENCY ZERO",
    logline: "A radio host discovers a broadcast from the future.",
    scenes: [
      {
        sceneId: 1,
        slugline: "INT. RADIO BOOTH - NIGHT",
        location: "RADIO BOOTH",
        timeOfDay: "NIGHT",
        pageEighths: 8,
        description: "Jack sits by the vintage broadcast console.",
      },
    ],
  };

  const mockCoverage: Coverage = {
    logline: mockScriptParse.logline,
    synopsis: "Contained suspense thriller.",
    genre: ["Sci-Fi", "Thriller"],
    tone: "Moody",
    themes: ["Isolation"],
    comparables: [{ title: "The Vast of Night", why: "Period audio sci-fi" }],
    strengths: ["Compelling soundscape"],
    concerns: [],
    pacingNotes: "Tight pacing",
    scores: { premise: 8, structure: 8, character: 8, dialogue: 8, marketability: 8 },
    verdict: "CONSIDER",
    verdictRationale: "High production value contained premise.",
    pullQuote: "Sensory audio suspense.",
  };

  const mockBreakdown: ScriptBreakdown = {
    breakdowns: [
      {
        sceneId: 1,
        cast: ["JACK"],
        background: [],
        props: ["CONSOLE"],
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
        complexity: 1,
        complexityReason: "Interior booth",
      },
    ],
  };

  const mockFullBudget: Budget = {
    sections: [
      {
        category: "Crew",
        subtotal: 450,
        items: [
          {
            category: "Crew",
            item: "Production Sound Mixer",
            unit: "day",
            qty: 1,
            rate: 450,
            total: 450,
            tracesTo: "Location Sound Mixer booked for 1 shoot day(s)",
          },
        ],
      },
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
            tracesTo: "Sound Design, Foley & Mix for post-production audio package",
          },
        ],
      },
    ],
    summary: {
      crewSubtotal: 450,
      nightPremiumTotal: 0,
      castSubtotal: 0,
      equipmentSubtotal: 0,
      locationsLogisticsSubtotal: 0,
      postSubtotal: 650,
      subtotalBeforeContingency: 1100,
      contingencyTotal: 110,
      grandTotal: 1210,
    },
    rateCardName: "Standard SAG Indie Rate Card",
    currency: "USD",
  };

  const canonicalCitation: ParallelSourceCitation = {
    title: "The Vast of Night - Rotten Tomatoes (92% Certified Fresh)",
    url: "https://www.rottentomatoes.com/m/the_vast_of_night",
    snippet: "Holds a 92% approval rating. Critics praised the innovative audio-driven direction and atmospheric sound design.",
    query: "indie sci fi thriller festival breakout sound design",
    relevance: "Audio engineering benchmark",
  };

  it("withholds recommendation when model citation URL is unknown (does NOT fallback to marketEvidence[0])", async () => {
    const mockGeminiClient = {
      generateStructured: vi.fn().mockResolvedValue({
        data: {
          tagline: "Static in the dark.",
          loglines: ["A late night DJ hears tomorrow's news.", "Static yields secrets."],
          whyNow: "Audio suspense is booming.",
          audience: { primary: "Indie thriller fans", secondary: "Festival goers" },
          festivalStrategy: [{ name: "Sundance", tier: "Tier 1 / Oscar Qualifying", why: "Strong genre fit" }],
          posterConcept: { description: "Radio tower", imagePrompt: "Dark radio tower in storm." },
          pitchParagraph: "Carrying a CONSIDER verdict and an audited budget total of $1,210.",
          productionRecommendation: {
            title: "Audio Priority",
            category: "BUDGET_ALLOCATION",
            factualFinding: "Made-up model finding that does not match citation.",
            inferredAdvice: "Allocate contingency to sound.",
            actionableDecision: "Protect Sound Design.",
            tradeoffRationale: "Essential for festivals.",
            affectedArtifact: {
              kind: "budget_line_item",
              identifier: "Sound Design, Foley & Mix",
              label: "Account 6000: Post Production / Sound Design, Foley & Mix",
              tabTarget: "BUDGET",
            },
            sourceCitation: {
              title: "The Vast of Night",
              url: "https://hallucinated-source.com/wrong-url", // UNKNOWN URL!
            },
          },
        },
        rawText: "{}",
        modelUsed: "gemini-3.1-flash-lite",
        durationMs: 400,
      }),
    } as unknown as GeminiStudioClient;

    const mockParallelClient = {
      searchMarket: vi.fn().mockResolvedValue([canonicalCitation]),
    } as unknown as ParallelSearchClient;

    const agent = new MarqueeAgent(mockGeminiClient, mockParallelClient);
    const result = await agent.generatePitchKit(mockScriptParse, mockCoverage, mockFullBudget, mockBreakdown);

    // MUST be withheld because URL did not match canonical citation! Must NOT acquire marketEvidence[0]!
    expect(result.pitchKit.productionRecommendation).toBeNull();
    expect(result.pitchKit.marketEvidence).toHaveLength(2); // Two search queries ran
  });

  it("uses canonical returned citation snippet as displayed evidence (factualFinding) for valid recommendation", async () => {
    const mockGeminiClient = {
      generateStructured: vi.fn().mockResolvedValue({
        data: {
          tagline: "Static in the dark.",
          loglines: ["A late night DJ hears tomorrow's news.", "Static yields secrets."],
          whyNow: "Audio suspense is booming.",
          audience: { primary: "Indie thriller fans", secondary: "Festival goers" },
          festivalStrategy: [{ name: "Sundance", tier: "Tier 1 / Oscar Qualifying", why: "Strong genre fit" }],
          posterConcept: { description: "Radio tower", imagePrompt: "Dark radio tower in storm." },
          pitchParagraph: "Carrying a CONSIDER verdict and an audited budget total of $1,210.",
          productionRecommendation: {
            title: "Protect Sound Design Allocation",
            category: "BUDGET_ALLOCATION",
            factualFinding: "Model-written synthetic text", // Should be replaced by canonical snippet!
            inferredAdvice: "Protect the $650 sound design allocation against budget trimming.",
            actionableDecision: "Protect the $650 Sound Design, Foley & Mix line item.",
            tradeoffRationale: "Festivals reward pristine audio finishing.",
            affectedArtifact: {
              kind: "budget_line_item",
              identifier: "Sound Design, Foley & Mix",
              label: "Account 6000: Post Production / Sound Design, Foley & Mix",
              tabTarget: "BUDGET",
            },
            sourceCitation: {
              title: "The Vast of Night - Rotten Tomatoes (92% Certified Fresh)",
              url: "https://www.rottentomatoes.com/m/the_vast_of_night", // EXACT MATCHING URL!
            },
          },
        },
        rawText: "{}",
        modelUsed: "gemini-3.1-flash-lite",
        durationMs: 400,
      }),
    } as unknown as GeminiStudioClient;

    const mockParallelClient = {
      searchMarket: vi.fn().mockResolvedValue([canonicalCitation]),
    } as unknown as ParallelSearchClient;

    const agent = new MarqueeAgent(mockGeminiClient, mockParallelClient);
    const result = await agent.generatePitchKit(mockScriptParse, mockCoverage, mockFullBudget, mockBreakdown);

    expect(result.pitchKit.productionRecommendation).not.toBeNull();
    const rec = result.pitchKit.productionRecommendation!;

    // Factual finding must be the canonical citation's actual snippet excerpt!
    expect(rec.factualFinding).toBe(canonicalCitation.snippet);
    expect(rec.sourceCitation.url).toBe(canonicalCitation.url);
    expect(rec.sourceCitation.title).toBe(canonicalCitation.title);
    expect(rec.inferredAdvice).toBe("Protect the $650 sound design allocation against budget trimming.");
    expect(rec.affectedArtifact.identifier).toBe("Sound Design, Foley & Mix");
  });

  it("passes ALL eligible budget items to the Marquee prompt instead of only the first eight", async () => {
    let capturedPrompt = "";
    const mockGeminiClient = {
      generateStructured: vi.fn().mockImplementation((opts: { prompt: string }) => {
        capturedPrompt = opts.prompt;
        return Promise.resolve({
          data: {
            tagline: "Static in the dark.",
            loglines: ["A late night DJ hears tomorrow's news.", "Static yields secrets."],
            whyNow: "Audio suspense is booming.",
            audience: { primary: "Indie thriller fans", secondary: "Festival goers" },
            festivalStrategy: [{ name: "Sundance", tier: "Tier 1 / Oscar Qualifying", why: "Strong genre fit" }],
            posterConcept: { description: "Radio tower", imagePrompt: "Dark radio tower in storm." },
            pitchParagraph: "Carrying a CONSIDER verdict.",
            productionRecommendation: null,
          },
          rawText: "{}",
          modelUsed: "gemini-3.1-flash-lite",
          durationMs: 400,
        });
      }),
    } as unknown as GeminiStudioClient;

    const mockParallelClient = {
      searchMarket: vi.fn().mockResolvedValue([]),
    } as unknown as ParallelSearchClient;

    const agent = new MarqueeAgent(mockGeminiClient, mockParallelClient);
    await agent.generatePitchKit(mockScriptParse, mockCoverage, mockFullBudget, mockBreakdown);

    // Ensure prompt includes both the Crew item and the Post Production item
    expect(capturedPrompt).toContain("ELIGIBLE BUDGET LINE ITEMS FROM AUDITED LEDGER:");
    expect(capturedPrompt).toContain("Production Sound Mixer");
    expect(capturedPrompt).toContain("Sound Design, Foley & Mix");
  });
});
