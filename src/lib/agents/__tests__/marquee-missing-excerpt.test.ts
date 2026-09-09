import { describe, it, expect, vi } from "vitest";
import { validateProductionRecommendation, MarqueeAgent } from "../marquee";
import { Budget } from "@/lib/types/budget";
import { ParallelSourceCitation, ProductionRecommendation } from "@/lib/types/pitch";
import { ScriptParse } from "@/lib/types/screenplay";
import { Coverage } from "@/lib/types/coverage";
import { ScriptBreakdown } from "@/lib/types/breakdown";
import { GeminiStudioClient } from "@/lib/ai/gemini-client";
import { ParallelSearchClient } from "@/lib/parallel/client";

describe("Marquee — Missing Excerpt Evidence and Alternative Citation Support", () => {
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
            tracesTo: "Sound Design, Foley & Mix for post-production audio package",
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

  const emptySnippetCitation: ParallelSourceCitation = {
    title: "The Popcorn List: Short Film Distribution",
    url: "https://www.thefilmcollaborative.org/blog/tag/horror-films/",
    snippet: "", // Missing / empty excerpt
    query: "indie short film audio post comps",
    relevance: "Distribution benchmark",
  };

  const supportedAlternativeCitation: ParallelSourceCitation = {
    title: "Sound Design in Low Budget Filmmaking (ScreenCraft)",
    url: "https://screencraft.org/sound-design-guide",
    snippet: "Industry experts emphasize that high-production-value sound design and foley elevate low-budget thrillers at festivals.",
    query: "indie short film audio post comps",
    relevance: "Audio engineering benchmark",
  };

  const unrelatedCitation: ParallelSourceCitation = {
    title: "Catering and Craft Services for Indie Shoots",
    url: "https://example.com/catering-guide",
    snippet: "Providing adequate meals on remote sets maintains crew morale and prevents union meal penalties.",
    query: "indie film catering standards",
    relevance: "Catering standard",
  };

  it("withholds recommendation when matched citation has empty snippet and no alternative is available", () => {
    const candidateRec: ProductionRecommendation = {
      title: "Protect Sound Design Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: "Model invented fact",
      inferredAdvice: "Protect the sound design budget.",
      actionableDecision: "Protect Sound Design, Foley & Mix line item.",
      tradeoffRationale: "Essential for festivals.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: emptySnippetCitation,
    };

    // When only the empty snippet citation is available: must be withheld
    const result = validateProductionRecommendation(candidateRec, mockBudget, [emptySnippetCitation]);
    expect(result).toBeNull();
  });

  it("uses another genuinely supported returned citation when matched citation has empty snippet", () => {
    const candidateRec: ProductionRecommendation = {
      title: "Protect Sound Design Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: "Model invented fact",
      inferredAdvice: "Protect the sound design budget.",
      actionableDecision: "Protect Sound Design, Foley & Mix line item.",
      tradeoffRationale: "Essential for festivals.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: emptySnippetCitation,
    };

    // When an alternative genuinely supported citation is in marketEvidence:
    const result = validateProductionRecommendation(candidateRec, mockBudget, [
      emptySnippetCitation,
      supportedAlternativeCitation,
    ]);

    expect(result).not.toBeNull();
    expect(result?.sourceCitation.url).toBe(supportedAlternativeCitation.url);
    expect(result?.factualFinding).toBe(supportedAlternativeCitation.snippet);
  });

  it("withholds recommendation when matched citation has empty snippet and alternative citation is unrelated", () => {
    const candidateRec: ProductionRecommendation = {
      title: "Protect Sound Design Allocation",
      category: "BUDGET_ALLOCATION",
      factualFinding: "Model invented fact",
      inferredAdvice: "Protect the sound design budget.",
      actionableDecision: "Protect Sound Design, Foley & Mix line item.",
      tradeoffRationale: "Essential for festivals.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: emptySnippetCitation,
    };

    // Unrelated catering citation does NOT genuinely support sound design recommendation
    const result = validateProductionRecommendation(candidateRec, mockBudget, [
      emptySnippetCitation,
      unrelatedCitation,
    ]);

    expect(result).toBeNull();
  });

  it("in MarqueeAgent: uses genuinely supported alternative when model citation has empty excerpt", async () => {
    const mockScriptParse: ScriptParse = {
      title: "FREQUENCY ZERO",
      format: "short",
      logline: "A radio host discovers a broadcast from the future.",
      scenes: [
        {
          id: 1,
          slugline: "INT. RADIO BOOTH - NIGHT",
          intExt: "INT",
          location: "RADIO BOOTH",
          timeOfDay: "NIGHT",
          summary: "Jack sits by the vintage broadcast console.",
          characters: ["JACK"],
          pageEighths: 8,
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

    const mockGeminiClient = {
      generateStructured: vi.fn().mockResolvedValue({
        data: {
          tagline: "Static in the dark.",
          loglines: ["A late night DJ hears tomorrow's news.", "Static yields secrets."],
          whyNow: "Audio suspense is booming.",
          audience: { primary: "Indie thriller fans", secondary: "Festival goers" },
          festivalStrategy: [{ name: "Sundance", tier: "Tier 1 / Oscar Qualifying", why: "Strong genre fit" }],
          posterConcept: { description: "Radio tower", imagePrompt: "Dark radio tower in storm." },
          pitchParagraph: "Carrying a CONSIDER verdict and an audited budget total of $715.",
          productionRecommendation: {
            title: "Protect Sound Design Allocation",
            category: "BUDGET_ALLOCATION",
            factualFinding: "Model invented text",
            inferredAdvice: "Protect sound allocation.",
            actionableDecision: "Protect Sound Design, Foley & Mix line item.",
            tradeoffRationale: "Essential for festivals.",
            affectedArtifact: {
              kind: "budget_line_item",
              identifier: "Sound Design, Foley & Mix",
              label: "Account 6000: Post Production / Sound Design, Foley & Mix",
              tabTarget: "BUDGET",
            },
            sourceCitation: {
              title: emptySnippetCitation.title,
              url: emptySnippetCitation.url,
            },
          },
        },
        rawText: "{}",
        modelUsed: "gemini-3.1-flash-lite",
        durationMs: 400,
      }),
    } as unknown as GeminiStudioClient;

    const mockParallelClient = {
      searchMarket: vi.fn().mockResolvedValue([
        emptySnippetCitation,
        supportedAlternativeCitation,
      ]),
    } as unknown as ParallelSearchClient;

    const agent = new MarqueeAgent(mockGeminiClient, mockParallelClient);
    const result = await agent.generatePitchKit(mockScriptParse, mockCoverage, mockBudget, mockBreakdown);

    expect(result.pitchKit.productionRecommendation).not.toBeNull();
    expect(result.pitchKit.productionRecommendation?.sourceCitation.url).toBe(supportedAlternativeCitation.url);
    expect(result.pitchKit.productionRecommendation?.factualFinding).toBe(supportedAlternativeCitation.snippet);
  });
});
