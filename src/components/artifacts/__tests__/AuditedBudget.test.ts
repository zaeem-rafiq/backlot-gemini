import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AuditedBudget, getRecommendationForBudgetItem } from "../AuditedBudget";
import { Budget, BudgetLineItem } from "@/lib/types/budget";
import { ProductionRecommendation } from "@/lib/types/pitch";

describe("AuditedBudget — Recommendation Provenance & Drawer Display", () => {
  const mockBudget: Budget = {
    sections: [
      {
        category: "Crew",
        subtotal: 900,
        items: [
          {
            category: "Crew",
            item: "Practical SFX Technician",
            unit: "day",
            qty: 2,
            rate: 450,
            total: 900,
            tracesTo: "Practical SFX Tech booked for 2 day(s) ← practical SFX flagged in scene(s): 1, 2",
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
      crewSubtotal: 900,
      nightPremiumTotal: 0,
      castSubtotal: 0,
      equipmentSubtotal: 0,
      locationsLogisticsSubtotal: 0,
      postSubtotal: 650,
      subtotalBeforeContingency: 1550,
      contingencyTotal: 155,
      grandTotal: 1705,
    },
    rateCardName: "Standard SAG Indie Rate Card",
    currency: "USD",
  };

  const soundRec: ProductionRecommendation = {
    title: "Prioritize Acoustic Environment & Sound Design Allocation",
    category: "BUDGET_ALLOCATION",
    factualFinding: "The Vast of Night achieved 92% Rotten Tomatoes acclaim through audio-centric suspense.",
    inferredAdvice: "Protect the Sound Design line item against budget trimming.",
    actionableDecision: "Protect the $650 Sound Design line item and allocate room tone capture.",
    tradeoffRationale: "Atmospheric audio sci-fi achieves festival breakout through sensory sound immersion.",
    affectedArtifact: {
      kind: "budget_line_item",
      identifier: "Sound Design, Foley & Mix",
      label: "Account 6000: Post Production / Sound Design, Foley & Mix",
      tabTarget: "BUDGET",
    },
    sourceCitation: {
      title: "The Vast of Night - Rotten Tomatoes",
      url: "https://www.rottentomatoes.com/m/the_vast_of_night",
      snippet: "Holds 92% approval rating.",
      query: "The Vast of Night comps",
      relevance: "Critical reception benchmark",
    },
  };

  it("getRecommendationForBudgetItem returns recommendation only for matching line item", () => {
    const sfxItem = mockBudget.sections[0].items[0];
    const soundItem = mockBudget.sections[1].items[0];

    // Practical SFX Technician must NOT receive sound recommendation
    expect(getRecommendationForBudgetItem(sfxItem, soundRec)).toBeNull();

    // Sound Design item MUST receive sound recommendation
    expect(getRecommendationForBudgetItem(soundItem, soundRec)).toBe(soundRec);

    // When recommendation is null, neither receives a recommendation
    expect(getRecommendationForBudgetItem(sfxItem, null)).toBeNull();
    expect(getRecommendationForBudgetItem(soundItem, null)).toBeNull();
  });

  it("never renders hardcoded audio advice on a non-audio target", () => {
    const html = renderToStaticMarkup(
      React.createElement(AuditedBudget, {
        budget: mockBudget,
        productionRecommendation: soundRec,
        recommendedItemName: "Practical SFX Technician",
        initialSelectedItemName: "Practical SFX Technician",
      })
    );

    // The drawer for Practical SFX Technician must show script breakdown provenance
    expect(html).toContain("Practical SFX Tech booked for 2 day(s) ← practical SFX flagged in scene(s): 1, 2");

    // Must NOT contain the old hardcoded audio copy
    expect(html).not.toContain("Backlot Studio infers maintaining this audio design allocation");
    expect(html).not.toContain("maintaining this audio design allocation to preserve festival acquisition value");

    // Must NOT contain the sound design recommendation's factual finding or advice
    expect(html).not.toContain("The Vast of Night");
    expect(html).not.toContain("Protect the Sound Design line item");
  });

  it("renders the actual run's recommendation when the matching line item is selected", () => {
    const html = renderToStaticMarkup(
      React.createElement(AuditedBudget, {
        budget: mockBudget,
        productionRecommendation: soundRec,
        recommendedItemName: "Sound Design, Foley & Mix",
        initialSelectedItemName: "Sound Design, Foley & Mix",
      })
    );

    // Must show script provenance (HTML-encoded ampersand in markup)
    expect(html).toContain("Sound Design, Foley &amp; Mix for post-production audio package");

    // Must show the actual recommendation's factual finding and inferred advice
    expect(html).toContain("The Vast of Night achieved 92% Rotten Tomatoes acclaim");
    expect(html).toContain("Protect the Sound Design line item against budget trimming.");
    expect(html).toContain("The Vast of Night - Rotten Tomatoes");

    // Must NOT contain the old hardcoded string
    expect(html).not.toContain("Backlot Studio infers maintaining this audio design allocation to preserve festival acquisition value");
  });

  it("withholds market comp box cleanly when recommendation is null or absent", () => {
    const html = renderToStaticMarkup(
      React.createElement(AuditedBudget, {
        budget: mockBudget,
        productionRecommendation: null,
        initialSelectedItemName: "Practical SFX Technician",
      })
    );

    // Shows script origin and formula
    expect(html).toContain("Practical SFX Tech booked for 2 day(s)");
    expect(html).toContain("Deterministic Formula:");

    // Withholds market comp box entirely
    expect(html).not.toContain("Parallel Market Comp");
    expect(html).not.toContain("Retrieved Fact");
    expect(html).not.toContain("Inferred Producer Advice");
  });

  it("leaves deterministic budget arithmetic completely unchanged", () => {
    const html = renderToStaticMarkup(
      React.createElement(AuditedBudget, {
        budget: mockBudget,
        productionRecommendation: soundRec,
      })
    );

    expect(html).toContain("$1,705.00");
    expect(html).toContain("$1,550.00");
    expect(html).toContain("+$155.00");
  });
});
