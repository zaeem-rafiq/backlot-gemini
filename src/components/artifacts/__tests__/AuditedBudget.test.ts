import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AuditedBudget, getRecommendationForBudgetItem } from "../AuditedBudget";
import { PitchKitView } from "../PitchKitView";
import { Budget, BudgetLineItem } from "@/lib/types/budget";
import { ProductionRecommendation, PitchKit } from "@/lib/types/pitch";

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

  it("getRecommendationForBudgetItem returns recommendation only for exact matching line item and rejects substrings", () => {
    const sfxItem = mockBudget.sections[0].items[0];
    const soundItem = mockBudget.sections[1].items[0];

    // Practical SFX Technician must NOT receive sound recommendation
    expect(getRecommendationForBudgetItem(sfxItem, soundRec)).toBeNull();

    // Sound Design item MUST receive sound recommendation
    expect(getRecommendationForBudgetItem(soundItem, soundRec)).toBe(soundRec);

    // Production Sound Mixer must NOT match Sound Design, Foley & Mix (substring "Sound" must not match!)
    const mixerItem: BudgetLineItem = {
      category: "Crew",
      item: "Production Sound Mixer",
      unit: "day",
      qty: 1,
      rate: 450,
      total: 450,
      tracesTo: "Location Sound Mixer booked for 1 shoot day(s)",
    };
    expect(getRecommendationForBudgetItem(mixerItem, soundRec)).toBeNull();

    // Partial substring recommendation identifier (e.g. "Sound") must NOT match either item
    const partialRec: ProductionRecommendation = {
      ...soundRec,
      affectedArtifact: {
        ...soundRec.affectedArtifact,
        identifier: "Sound", // Partial substring
      },
    };
    expect(getRecommendationForBudgetItem(soundItem, partialRec)).toBeNull();
    expect(getRecommendationForBudgetItem(mixerItem, partialRec)).toBeNull();

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

  it("removes stale recommendation highlighting when loaded without a matching recommendation", () => {
    // When a budget is rendered without a recommendation or with a null recommendation,
    // NO rows have the isRecommended highlight class or Parallel Comp badge
    const html = renderToStaticMarkup(
      React.createElement(AuditedBudget, {
        budget: mockBudget,
        productionRecommendation: null,
      })
    );

    expect(html).not.toContain("Parallel Comp");
    expect(html).not.toContain("border-sky-400");
    expect(html).not.toContain("bg-sky-500/15");
  });

  it("ensures rejected crew-diversion advice is absent from every displayed field", () => {
    // If a recommendation was rejected, passing null ensures no advice appears anywhere
    const html = renderToStaticMarkup(
      React.createElement(AuditedBudget, {
        budget: mockBudget,
        productionRecommendation: null,
        initialSelectedItemName: "Practical SFX Technician",
      })
    );

    expect(html).not.toContain("Divert");
    expect(html).not.toContain("reallocate");
    expect(html).not.toContain("Parallel Market Comp Reference");
    expect(html).not.toContain("Actionable Decision:");
  });
});

describe("PitchKitView — Recommendation & Withholding Copy Calibration", () => {
  const basePitchKit: PitchKit = {
    tagline: "Static in the dark.",
    loglines: ["A late night DJ hears tomorrow's broadcast.", "Static hides secrets."],
    whyNow: "Audio suspense is resonant.",
    audience: {
      primary: "Sci-Fi Thriller enthusiasts",
      secondary: "Indie festival audience",
    },
    festivalStrategy: [
      {
        name: "Sundance Film Festival",
        tier: "Tier 1 / Oscar Qualifying",
        why: "Strong precedent for contained sci-fi.",
      },
    ],
    posterConcept: {
      description: "Radio tower silhouette",
      imagePrompt: "A moody radio tower in a storm.",
    },
    pitchParagraph: "Carrying a RECOMMEND verdict and an audited budget of $11,827.",
    marketEvidence: [],
    productionRecommendation: null,
  };

  it("displays evidence unavailable notice when market evidence is empty", () => {
    const html = renderToStaticMarkup(
      React.createElement(PitchKitView, {
        pitchKit: {
          ...basePitchKit,
          marketEvidence: [],
          productionRecommendation: null,
        },
      })
    );

    expect(html).toContain("Production Recommendation Withheld");
    expect(html).toContain("Production recommendation withheld because market evidence is unavailable.");
    // Must NOT claim Parallel was offline
    expect(html).not.toContain("Live Parallel Search API evidence is currently offline or returned zero verified citations");
  });

  it("distinguishes rejected recommendation with available citations from unavailable search", () => {
    const html = renderToStaticMarkup(
      React.createElement(PitchKitView, {
        pitchKit: {
          ...basePitchKit,
          marketEvidence: [
            {
              title: "The Vast of Night Comps",
              url: "https://rottentomatoes.com/m/the_vast_of_night",
              snippet: "Audio acclaim",
              query: "audio comps",
              relevance: "Benchmark",
            },
          ],
          productionRecommendation: null, // Rejected by feasibility guard!
        },
      })
    );

    expect(html).toContain("Production Recommendation Withheld");
    expect(html).toContain("Live market citations were retrieved, but no supported production recommendation was produced for this screenplay.");
    // Must NOT claim Parallel was offline or returned 0 citations
    expect(html).not.toContain("returned zero verified citations");
    expect(html).not.toContain("currently offline");
  });

  it("displays supported recommendation with retrieved fact and inferred advice strictly partitioned", () => {
    const html = renderToStaticMarkup(
      React.createElement(PitchKitView, {
        pitchKit: {
          ...basePitchKit,
          marketEvidence: [
            {
              title: "The Vast of Night Comps",
              url: "https://rottentomatoes.com/m/the_vast_of_night",
              snippet: "Audio acclaim snippet from source",
              query: "audio comps",
              relevance: "Benchmark",
            },
          ],
          productionRecommendation: {
            title: "Protect Sound Design",
            category: "BUDGET_ALLOCATION",
            factualFinding: "Audio acclaim snippet from source",
            inferredAdvice: "Backlot Studio infers maintaining audio design.",
            actionableDecision: "Protect $650 line item.",
            tradeoffRationale: "Sensory immersion.",
            affectedArtifact: {
              kind: "budget_line_item",
              identifier: "Sound Design, Foley & Mix",
              label: "Account 6000: Post Production / Sound Design, Foley & Mix",
              tabTarget: "BUDGET",
            },
            sourceCitation: {
              title: "The Vast of Night Comps",
              url: "https://rottentomatoes.com/m/the_vast_of_night",
              snippet: "Audio acclaim snippet from source",
              query: "audio comps",
              relevance: "Benchmark",
            },
          },
        },
      })
    );

    expect(html).toContain("[Retrieved Fact · Parallel Search API]");
    expect(html).toContain("Audio acclaim snippet from source");
    expect(html).toContain("[Inferred Producer Advice · Studio OS]");
    expect(html).toContain("Backlot Studio infers maintaining audio design.");
    expect(html).toContain("Sound Design, Foley &amp; Mix");
  });
});
