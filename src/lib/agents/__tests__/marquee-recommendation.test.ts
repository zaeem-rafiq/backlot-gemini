import { describe, it, expect } from "vitest";
import { validateProductionRecommendation } from "../marquee";
import { Budget } from "@/lib/types/budget";
import { ParallelSourceCitation, ProductionRecommendation } from "@/lib/types/pitch";

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

  it("narrows a recommendation to supported post-production allocation when source citation genuinely supports it", () => {
    const candidateRec: ProductionRecommendation = {
      title: "Audio Priority",
      category: "BUDGET_ALLOCATION",
      factualFinding: audioCitation.snippet,
      inferredAdvice: "Divert $200 from SFX toward sound design.",
      actionableDecision: "Divert funds toward Sound Design, Foley & Mix to achieve audio suspense.",
      tradeoffRationale: audioCitation.snippet,
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Practical SFX Technician",
        label: "Account 2000: Crew / Practical SFX Technician",
        tabTarget: "BUDGET",
      },
      sourceCitation: audioCitation,
    };

    const validated = validateProductionRecommendation(candidateRec, mockBudget, [audioCitation]);
    expect(validated).not.toBeNull();
    // Must be narrowed away from the script-required crew item to the supported post-production item
    expect(validated!.affectedArtifact.identifier).toBe("Sound Design, Foley & Mix");
    expect(validated!.affectedArtifact.tabTarget).toBe("BUDGET");
    expect(validated!.actionableDecision).not.toContain("Divert funds");
    expect(validated!.actionableDecision).toContain("Sound Design, Foley & Mix");
  });

  it("permits valid, supported recommendations targeting enhanceable line items", () => {
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
