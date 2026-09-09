import { describe, it, expect } from "vitest";
import {
  findSupportedCitation,
  isCitationSubstantivelySupported,
  validateProductionRecommendation,
  calibrateRecommendationAssertions,
} from "../marquee";
import { formatSourceAttribution, derivePublisherFromUrl } from "@/lib/parallel/client";
import { Budget } from "@/lib/types/budget";
import { ParallelSourceCitation, ProductionRecommendation } from "@/lib/types/pitch";

describe("Marquee — Citation Integrity, Source Attribution & Evidence Calibration", () => {
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
            tracesTo: "Dialogue cleanup, custom sound design, Foley, and festival mix",
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

  // ---------------------------------------------------------------------------
  // REGRESSION CASE 1: Relevant query words paired with an unrelated excerpt
  // ---------------------------------------------------------------------------
  it("REGRESSION CASE 1: rejects citations where query has relevant words but excerpt is unrelated", () => {
    const soundRec: ProductionRecommendation = {
      title: "Enhancing Post-Production Polish for Genre Competitiveness",
      category: "BUDGET_ALLOCATION",
      factualFinding: "Unverified finding",
      inferredAdvice: "Reallocate contingency into the Sound Design, Foley & Mix line item.",
      actionableDecision: "Increase the 'Sound Design, Foley & Mix' allocation by 10%.",
      tradeoffRationale: "Elevates audio-scape to meet festival expectations.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: {
        title: "Craft Catering Standards for Remote Indie Locations",
        url: "https://example.com/catering-standards",
        // The query has all the relevant audio keywords!
        query: "FREQUENCY ZERO Horror indie short film sound design foley audio mix comps",
        // But the actual excerpt is completely unrelated (catering)
        snippet: "Providing adequate meals on remote sets maintains crew morale and prevents union meal penalties under section 12.",
        relevance: "Catering benchmark",
      },
    };

    const citationWithRelevantQueryOnly: ParallelSourceCitation = soundRec.sourceCitation;

    // 1. isCitationSubstantivelySupported MUST be false because search queries are retrieval instructions, not source evidence
    const isSupported = isCitationSubstantivelySupported(soundRec, citationWithRelevantQueryOnly);
    expect(isSupported).toBe(false);

    // 2. findSupportedCitation MUST return null
    const alternative = findSupportedCitation(soundRec, [citationWithRelevantQueryOnly], mockBudget);
    expect(alternative).toBe(null);

    // 3. validateProductionRecommendation MUST withhold the recommendation (return null)
    const validated = validateProductionRecommendation(soundRec, mockBudget, [citationWithRelevantQueryOnly]);
    expect(validated).toBe(null);
  });

  // ---------------------------------------------------------------------------
  // REGRESSION CASE 2: Incorrect archive/sidebar article attribution
  // ---------------------------------------------------------------------------
  it("REGRESSION CASE 2: correctly attributes archive/tag URLs to publisher archive rather than unverified sidebar title", () => {
    const archiveUrl = "https://www.thefilmcollaborative.org/blog/tag/horror-films/";
    const scrapedSidebarTitle = "Wrap Report – The Popcorn List: Pop Up Series - An Experiment in Collaborative Non-Theatrical Distribution";
    const publishDate = "2013-10-03";
    const actualExcerpt = "At a recent event hosted at the LA Film School by Screen Craft entitled Horror Filmmaking: The Guts of the Craft, several involved in the horror genre talked about budgeting and distributing indie horror films. All agreed the production value bar has to be raised so much higher...";

    // Format attribution through client helper
    const attribution = formatSourceAttribution(
      archiveUrl,
      scrapedSidebarTitle,
      publishDate,
      actualExcerpt
    );

    // 1. Must NOT present the unverified sidebar article title as the verified article title
    expect(attribution.title).not.toBe(scrapedSidebarTitle);
    expect(attribution.title).not.toContain("Popcorn List");

    // 2. Must honestly attribute to publisher archive and tag
    expect(attribution.title).toBe("The Film Collaborative (Archive: horror films, 2013)");
    expect(attribution.publisher).toBe("The Film Collaborative");
    expect(attribution.isArchive).toBe(true);

    // 3. Must preserve raw provider metadata separately
    expect(attribution.rawTitle).toBe(scrapedSidebarTitle);

    // 4. Must accurately identify historical material (2013 is historical precedent, not live market conditions)
    expect(attribution.isHistorical).toBe(true);
  });

  it("REGRESSION CASE 2B: derives publisher accurately from various domains without hardcoding", () => {
    expect(derivePublisherFromUrl("https://screencraft.org/articles/sound-design")).toBe("ScreenCraft");
    expect(derivePublisherFromUrl("https://filmmakermagazine.com/archives/2021/")).toBe("Filmmaker Magazine");
    expect(derivePublisherFromUrl("https://indiewire.com/criticism/")).toBe("IndieWire");
    expect(derivePublisherFromUrl("https://variety.com/2024/film/")).toBe("Variety");
  });

  // ---------------------------------------------------------------------------
  // REGRESSION CASE 3: Unsupported alternative-source substitution
  // ---------------------------------------------------------------------------
  it("REGRESSION CASE 3: withholds recommendation when matched citation is empty and alternatives lack substantive support", () => {
    const emptyCitation: ParallelSourceCitation = {
      title: "The Film Collaborative (Archive: horror films, 2013)",
      url: "https://www.thefilmcollaborative.org/blog/tag/horror-films/",
      snippet: "", // Empty / missing excerpt
      query: "indie short film audio post comps",
      relevance: "Historical distribution benchmark",
    };

    const festivalDeadlineCitation: ParallelSourceCitation = {
      title: "Sundance Film Festival Submissions Guide",
      url: "https://festival.sundance.org/submit",
      snippet: "Early bird shorts deadlines require a secure Vimeo link and a $45 entry fee by late August.",
      query: "sundance film festival submissions deadlines",
      relevance: "Festival submission calendar",
    };

    const colorGradingCitation: ParallelSourceCitation = {
      title: "Color Grading in DaVinci Resolve",
      url: "https://blackmagicdesign.com/color-pipeline",
      snippet: "ACES color management standardizes log footage transforms across camera models.",
      query: "indie film color finishing pipeline",
      relevance: "Color post benchmark",
    };

    const audioRec: ProductionRecommendation = {
      title: "Enhancing Post-Production Polish for Genre Competitiveness",
      category: "BUDGET_ALLOCATION",
      factualFinding: "",
      inferredAdvice: "Reallocate contingency into the Sound Design, Foley & Mix budget line.",
      actionableDecision: "Increase Sound Design, Foley & Mix line item.",
      tradeoffRationale: "Vital for low-location thrillers.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: emptyCitation,
    };

    // When alternatives do not substantively support sound design, must withhold (return null)
    const result = validateProductionRecommendation(audioRec, mockBudget, [
      emptyCitation,
      festivalDeadlineCitation,
      colorGradingCitation,
    ]);

    expect(result).toBeNull();
  });

  it("REGRESSION CASE 3B: accepts alternative citation ONLY when its authentic excerpt substantively supports the domain", () => {
    const emptyCitation: ParallelSourceCitation = {
      title: "The Film Collaborative (Archive: horror films, 2013)",
      url: "https://www.thefilmcollaborative.org/blog/tag/horror-films/",
      snippet: "",
      query: "indie short film audio post comps",
      relevance: "Historical distribution benchmark",
    };

    const genuineAudioCitation: ParallelSourceCitation = {
      title: "ScreenCraft — The Guts of Genre Craft",
      url: "https://screencraft.org/genre-craft-panel",
      snippet: "At the LA Film School event, filmmakers agreed that bespoke sound design and foley are what separate amateur shorts from festival selections.",
      query: "indie short film audio post comps",
      relevance: "Audio engineering craft benchmark",
    };

    const audioRec: ProductionRecommendation = {
      title: "Enhancing Post-Production Polish for Genre Competitiveness",
      category: "BUDGET_ALLOCATION",
      factualFinding: "",
      inferredAdvice: "Reallocate contingency into the Sound Design, Foley & Mix budget line.",
      actionableDecision: "Increase Sound Design, Foley & Mix line item.",
      tradeoffRationale: "Vital for low-location thrillers.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: emptyCitation,
    };

    const result = validateProductionRecommendation(audioRec, mockBudget, [
      emptyCitation,
      genuineAudioCitation,
    ]);

    expect(result).not.toBeNull();
    expect(result?.sourceCitation.url).toBe(genuineAudioCitation.url);
    expect(result?.factualFinding).toBe(genuineAudioCitation.snippet);
  });

  // ---------------------------------------------------------------------------
  // REGRESSION CASE 4: Model suggestions framing & removal of unsupported assertions
  // ---------------------------------------------------------------------------
  it("REGRESSION CASE 4: keeps proposed allocations clearly identified as model suggestions and eliminates unsupported assertions", () => {
    const rawRec: ProductionRecommendation = {
      title: "Enhancing Post-Production Polish for Genre Competitiveness",
      category: "BUDGET_ALLOCATION",
      factualFinding: "Panelists agreed that production value standards are elevated.",
      inferredAdvice: "Investing in sound design is the most cost-effective way to elevate a low-location thriller, directly increasing the likelihood of festival selection.",
      actionableDecision: "Increase the 'Sound Design, Foley & Mix' allocation by 10% through a strategic drawdown of the 10% contingency reserve.",
      tradeoffRationale: "Investing in high-end sound design is the most cost-effective way to elevate a low-location thriller, directly increasing the likelihood of festival selection while preserving critical practical SFX.",
      affectedArtifact: {
        kind: "budget_line_item",
        identifier: "Sound Design, Foley & Mix",
        label: "Account: Post Production / Sound Design, Foley & Mix",
        tabTarget: "BUDGET",
      },
      sourceCitation: {
        title: "The Film Collaborative (Archive: horror films, 2013)",
        url: "https://www.thefilmcollaborative.org/blog/tag/horror-films/",
        snippet: "At a recent event hosted at the LA Film School by Screen Craft entitled Horror Filmmaking: The Guts of the Craft, several involved in the horror genre talked about budgeting and distributing indie horror films. All agreed the production value bar has to be raised so much higher...",
        query: "indie short film audio post comps",
        relevance: "Historical distribution benchmark",
        isHistorical: true,
        publishedDate: "2013-10-03",
      },
    };

    const calibrated = calibrateRecommendationAssertions(rawRec);

    // 1. Actionable decision must be clearly framed as a model suggestion
    expect(calibrated.actionableDecision).toContain("Model suggestion:");

    // 2. Unsupported assertion "most cost-effective way" must be removed
    expect(calibrated.tradeoffRationale).not.toContain("most cost-effective way");
    expect(calibrated.inferredAdvice).not.toContain("most cost-effective way");

    // 3. Unsupported causal claim "directly increasing the likelihood of festival selection" must be removed
    expect(calibrated.tradeoffRationale).not.toContain("directly increasing the likelihood of festival selection");
    expect(calibrated.inferredAdvice).not.toContain("directly increasing the likelihood of festival selection");

    // 4. Calibrated language must describe strategic options and meeting craft expectations
    expect(calibrated.tradeoffRationale).toContain("aimed at meeting festival craft expectations");
  });
});
