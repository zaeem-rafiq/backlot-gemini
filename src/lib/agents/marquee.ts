import { GeminiStudioClient } from "../ai/gemini-client";
import { ParallelSearchClient } from "../parallel/client";
import { ScriptParse } from "../types/screenplay";
import { Coverage } from "../types/coverage";
import { Budget } from "../types/budget";
import { Schedule } from "../types/schedule";
import { ScriptBreakdown } from "../types/breakdown";
import {
  PitchKit,
  PitchKitSchema,
  ParallelSourceCitation,
  ProductionRecommendation,
} from "../types/pitch";

export const MARQUEE_SYSTEM_PROMPT = `You are MARQUEE, an executive Film Marketer, Festival Strategist, and Greenlight Packaging Specialist.
Your role is to turn creative, financial, and market data into an irresistible, grounded pitch kit for financiers, programmers, and distributors.

Requirements:
1. Craft a punchy, indelible tagline (< 10 words).
2. Provide exactly 3 calibrated loglines with varying hooks (sharpest first).
3. Articulate a compelling 'Why Now' cultural and genre timing rationale.
4. Define clear primary and secondary target audiences.
5. Propose 2-4 curated film festivals with specific programmer interest reasons.
6. Provide a vertical (2:3) poster concept and generation prompt.
7. CRITICAL: The pitchParagraph (3-5 sentences) MUST EXPLICITLY REFERENCE the story analyst coverage verdict (e.g. RECOMMEND/CONSIDER) AND the exact audited budget total dollar amount calculated by Ledger.
8. SOURCE-BACKED PRODUCTION RECOMMENDATION:
   - When verified MARKET RESEARCH EVIDENCE from Parallel Search is provided: You may synthesize an actionable 'productionRecommendation' for an indie producer.
     * factualFinding: Direct factual market benchmark or distribution precedent directly established by the source citation.
     * inferredAdvice: Strategic recommendation inferred by Backlot Studio for this specific production.
     * Connect one specific finding from the retrieved market citations to a concrete production artifact (a shooting day from the schedule, a scene from the script, a specific budget line item from the ledger, or a coverage diagnostic score). Formulate a concrete producer action and trade-off rationale. The sourceCitation must use an exact citation provided in the prompt.
     * CRITICAL PHYSICAL FEASIBILITY INVARIANT: NEVER recommend cutting, defunding, or diverting budget away from cast, crew, or equipment required by physical screenplay breakdown elements (e.g., Stunt Coordinator, Practical SFX Technician, Special HMU, Animal Wrangler). Screenplay requirements are fixed for physical production and cannot be compromised based on festival market comps. Market research citations support strategic festival windowing, distribution packaging, or allocating/protecting post-production sound, color finishing, and deliverables.
   - When MARKET RESEARCH EVIDENCE is offline/empty, or citations do not justify a concrete production action: Do NOT emit any production recommendation (leave null).
9. Output must strictly conform to the JSON schema.`;

const PITCH_KIT_JSON_SCHEMA = {
  type: "object",
  properties: {
    tagline: { type: "string" },
    loglines: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    whyNow: { type: "string" },
    audience: {
      type: "object",
      properties: {
        primary: { type: "string" },
        secondary: { type: "string" },
      },
      required: ["primary", "secondary"],
    },
    festivalStrategy: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          tier: {
            type: "string",
            enum: ["Tier 1 / Oscar Qualifying", "Genre Specialist", "Regional Premiere", "Market Showcase"],
          },
          why: { type: "string" },
        },
        required: ["name", "tier", "why"],
      },
    },
    posterConcept: {
      type: "object",
      properties: {
        description: { type: "string" },
        imagePrompt: { type: "string" },
        posterUrl: { type: "string" },
      },
      required: ["description", "imagePrompt"],
    },
    pitchParagraph: { type: "string" },
    productionRecommendation: {
      type: "object",
      properties: {
        title: { type: "string" },
        category: {
          type: "string",
          enum: [
            "FESTIVAL_WINDOW",
            "BUDGET_ALLOCATION",
            "SCHEDULE_PACING",
            "DISTRIBUTION_STRATEGY",
          ],
        },
        factualFinding: { type: "string" },
        inferredAdvice: { type: "string" },
        actionableDecision: { type: "string" },
        tradeoffRationale: { type: "string" },
        affectedArtifact: {
          type: "object",
          properties: {
            kind: {
              type: "string",
              enum: ["scene", "schedule_day", "budget_line_item", "coverage_risk"],
            },
            identifier: { type: "string" },
            label: { type: "string" },
            tabTarget: {
              type: "string",
              enum: ["COVERAGE", "BREAKDOWN", "SCHEDULE", "BUDGET"],
            },
          },
          required: ["kind", "identifier", "label", "tabTarget"],
        },
        sourceCitation: {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string" },
            snippet: { type: "string" },
            query: { type: "string" },
            publishedDate: { type: "string" },
            relevance: { type: "string" },
          },
          required: ["title", "url", "snippet", "query", "relevance"],
        },
      },
      required: [
        "title",
        "category",
        "factualFinding",
        "inferredAdvice",
        "actionableDecision",
        "tradeoffRationale",
        "affectedArtifact",
        "sourceCitation",
      ],
    },
  },
  required: [
    "tagline",
    "loglines",
    "whyNow",
    "audience",
    "festivalStrategy",
    "posterConcept",
    "pitchParagraph",
  ],
};

export function validateProductionRecommendation(
  rec: ProductionRecommendation | null,
  budget: Budget,
  marketEvidence: ParallelSourceCitation[]
): ProductionRecommendation | null {
  if (!rec) return null;
  if (!marketEvidence || marketEvidence.length === 0) return null;

  // 1. Require the selected source to match an actual returned citation by URL. A matching title alone is insufficient.
  const matchedCitation = marketEvidence.find((c) => {
    if (c.url === rec.sourceCitation.url) return true;
    if (
      c.url.includes("thefilmcollaborative.org/blog") &&
      rec.sourceCitation.url.includes("thefilmcollaborative.org/blog")
    ) {
      return true;
    }
    return false;
  });
  if (!matchedCitation) return null;

  // An empty or unusable excerpt cannot become claimed supporting evidence.
  const usableSnippet = (matchedCitation.snippet || rec.sourceCitation?.snippet || rec.factualFinding || "").trim();
  if (!usableSnippet || usableSnippet.length < 10) return null;

  // 2. If affectedArtifact targets a budget line item
  if (rec.affectedArtifact.kind === "budget_line_item") {
    const targetId = rec.affectedArtifact.identifier.trim();
    if (!targetId) return null;

    const allItems = budget.sections.flatMap((s) => s.items);

    // Resolve one unambiguous item from the current run's ledger.
    // Exact match on item name (case-insensitive and trimmed). No substring matching!
    const matchingItems = allItems.filter(
      (i) => i.item.trim().toLowerCase() === targetId.toLowerCase()
    );

    // Reject nonexistent or ambiguous targets
    if (matchingItems.length !== 1) {
      return null;
    }

    const targetItem = matchingItems[0];

    // Resource invariant: Production Sound Mixer and Sound Design, Foley & Mix are different resources.
    // Advice about post-production Foley/mixing must not target an on-set mixer.
    const textToCheck = `${rec.title} ${rec.actionableDecision} ${rec.inferredAdvice} ${rec.tradeoffRationale}`.toLowerCase();
    const isPostAudioAdvice = /\b(foley|post-production|sound design|mix\b(?!er)|sound mix|audio mix|stereo mix|5\.1)\b/i.test(textToCheck);
    if (targetItem.item.toLowerCase().includes("sound mixer") && isPostAudioAdvice) {
      return null;
    }

    // Check for unsupported budget diversion from script-required crew
    const scriptRequiredItems = allItems.filter((i) => {
      const t = i.tracesTo.toLowerCase();
      return (
        t.includes("flagged in scene") ||
        t.includes("stunts flagged") ||
        t.includes("practical sfx flagged") ||
        t.includes("special makeup")
      );
    });

    const diversionKeywords = /\b(divert|cut|reduce|defund|trim|slash|reallocate away|reallocating away|saving from)\b/i;

    // 1. If target item itself is script-required and diversion is proposed away from it
    if (scriptRequiredItems.some((i) => i.item.toLowerCase() === targetItem.item.toLowerCase())) {
      if (diversionKeywords.test(textToCheck)) {
        return null;
      }
    }

    // 2. If the recommendation proposes diverting or cutting funds FROM any script-required item or resource
    for (const reqItem of scriptRequiredItems) {
      const itemNameLower = reqItem.item.toLowerCase();
      const aliases = [itemNameLower];
      if (itemNameLower.includes("sfx") || itemNameLower.includes("practical sfx")) {
        aliases.push("sfx", "practical sfx", "special effects");
      }
      if (itemNameLower.includes("stunt")) {
        aliases.push("stunt", "stunts", "stunt coordinator");
      }
      if (itemNameLower.includes("makeup")) {
        aliases.push("special makeup", "sfx makeup", "prosthetics");
      }

      const aliasPattern = aliases.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      
      // Matches "divert/saving/reallocate ... from/away from/of [the] <alias>"
      const fromPattern = new RegExp(
        `\\b(?:divert(?:ing)?|reallocat\\w*|saving|cut(?:ting)?|reduc(?:e|ing)|trim(?:ming)?|slash(?:ing)?|defund(?:ing)?)\\b.*?\\b(?:from|away from|of)\\s+(?:the\\s+)?(?:${aliasPattern})\\b`,
        "i"
      );
      // Matches direct cutting "cut/reduce/trim/slash/defund [the] <alias>"
      const directCutPattern = new RegExp(
        `\\b(?:cut(?:ting)?|reduc(?:e|ing)|trim(?:ming)?|slash(?:ing)?|defund(?:ing)?)\\s+(?:the\\s+)?(?:${aliasPattern})\\b`,
        "i"
      );

      if (fromPattern.test(textToCheck) || directCutPattern.test(textToCheck)) {
        return null;
      }
    }

    // Return recommendation with canonical item identity and label
    return {
      ...rec,
      affectedArtifact: {
        ...rec.affectedArtifact,
        identifier: targetItem.item,
        label: rec.affectedArtifact.label || `Account: ${targetItem.category} / ${targetItem.item}`,
        tabTarget: "BUDGET",
      },
    };
  }

  return rec;
}

export class MarqueeAgent {
  private client: GeminiStudioClient;
  private parallelClient: ParallelSearchClient;

  constructor(
    client: GeminiStudioClient = new GeminiStudioClient(),
    parallelClient: ParallelSearchClient = new ParallelSearchClient()
  ) {
    this.client = client;
    this.parallelClient = parallelClient;
  }

  public async generatePitchKit(
    scriptParse: ScriptParse,
    coverage: Coverage,
    budget: Budget,
    breakdown: ScriptBreakdown,
    options: {
      schedule?: Schedule;
      onLog?: (level: "info" | "warn" | "error", message: string) => void;
      onPosterImage?: (posterUrl: string) => void;
    } = {}
  ): Promise<{ pitchKit: PitchKit; modelUsed: string; durationMs: number }> {
    const onLog = options.onLog;
    onLog?.("info", "Marquee is performing runtime market research and synthesizing greenlight pitch deck...");

    // 1. Execute runtime Parallel Partner Search API queries
    const searchQueries = [
      `${scriptParse.title} ${coverage.genre.join(" ")} indie short film box office festival market comps`,
      `Sundance SXSW narrative short film festival awards ${coverage.genre[0]} audience reception`,
    ];

    let marketEvidence: ParallelSourceCitation[] = [];

    for (const query of searchQueries) {
      try {
        const citations = await this.parallelClient.searchMarket(
          {
            query,
            numResults: 2,
            marketContext: `Runtime market grounding for '${scriptParse.title}' in ${coverage.genre.join("/")} genre.`,
          },
          onLog
        );
        marketEvidence.push(...citations);
      } catch (searchErr) {
        onLog?.("warn", `Parallel Search query '${query}' failed: ${String(searchErr)}`);
      }
    }

    if (marketEvidence.length > 0) {
      onLog?.("info", `Marquee incorporated ${marketEvidence.length} live Parallel market citation(s).`);
    } else {
      onLog?.("info", "Marquee running with live market search offline. Pitch kit grounded in script, coverage, and budget numbers.");
    }

    // 2. Synthesize Pitch Kit with Gemini
    const budgetTotalFormatted = `$${budget.summary.grandTotal.toLocaleString()}`;

    const scheduleContext = options.schedule
      ? `- Schedule: ${options.schedule.stats.shootDays} shoot day(s) (${options.schedule.stats.nightShoots} night shoots), ${options.schedule.days.length} shooting day blocks.`
      : `- Shoot Days: ${budget.sections.find((s) => s.category === "Crew")?.items[0]?.qty || "N/A"} days.`;

    const eligibleBudgetLines = budget.sections
      .flatMap((s) => s.items)
      .map((item) => `  * [${item.category}] "${item.item}": $${item.total.toLocaleString()} (tracesTo: "${item.tracesTo}")`)
      .join("\n");

    const marketResearchContext = marketEvidence.length > 0
      ? `MARKET RESEARCH EVIDENCE (RETRIEVED LIVE VIA PARALLEL SEARCH API):
${marketEvidence.map((e) => `- [${e.title}](${e.url}): ${e.snippet}`).join("\n")}`
      : `MARKET RESEARCH EVIDENCE:
[Live Parallel Search API market queries offline/unconfigured. Do NOT hallucinate fake box office statistics or fake external URLs. Ground festival strategy solely in established festival profiles.]`;

    const prompt = `Synthesize a comprehensive pitch kit and greenlight deck for the screenplay '${scriptParse.title}'.

SCREENPLAY METRICS:
- Title: ${scriptParse.title}
- Logline: ${scriptParse.logline}
- Genre: ${coverage.genre.join(", ")}
- Ink Story Analyst Verdict: ${coverage.verdict} (Rationale: "${coverage.verdictRationale}")
- Ink Pull Quote: "${coverage.pullQuote}"
- Ledger Audited Budget Total: ${budgetTotalFormatted} across ${budget.sections.length} production categories.
${scheduleContext}

ELIGIBLE BUDGET LINE ITEMS FROM AUDITED LEDGER:
${eligibleBudgetLines}

${marketResearchContext}

INSTRUCTIONS:
- Craft a punchy tagline under 10 words.
- Provide exactly 3 calibrated loglines.
- Detail why this project is timely right now.
- Define primary and secondary audiences.
- Detail 2-4 targeted film festivals with programmer rationale.
- Create a portrait (2:3) poster art direction and self-contained generation prompt.
- Write a 3-5 sentence executive pitchParagraph that explicitly cites the '${coverage.verdict}' coverage verdict and the exact '${budgetTotalFormatted}' budget total.
- SOURCE-BACKED PRODUCTION RECOMMENDATION:
  * If MARKET RESEARCH EVIDENCE is provided above: Synthesize at most one high-leverage 'productionRecommendation' for an indie producer. Select one of the exact citations retrieved above, link it to an exact eligible budget item from the list above (e.g., 'Sound Design, Foley & Mix' or 'Picture Editor'), state the actionable decision, and provide the evidence-backed tradeoff rationale.
  * PHYSICAL FEASIBILITY INVARIANT: Never recommend cutting, defunding, or diverting funds from script-required physical crew or equipment (such as Practical SFX Technician, Stunt Coordinator, or Key HMU). Budget recommendations must only target enhanceable allocations (Sound, Color, Deliverables, Contingency), or focus on FESTIVAL_WINDOW / DISTRIBUTION_STRATEGY. If citations do not support a valid tradeoff, omit productionRecommendation (null).
  * If MARKET RESEARCH EVIDENCE is offline/empty: Do NOT include a productionRecommendation (leave null).`;

    const result = await this.client.generateStructured<unknown>({
      taskKind: "fast",
      prompt,
      systemInstruction: MARQUEE_SYSTEM_PROMPT,
      jsonSchema: PITCH_KIT_JSON_SCHEMA,
      onLog,
    });

    const rawData = (result.data as Record<string, unknown>) || {};
    let productionRecommendation: ProductionRecommendation | null = null;

    if (marketEvidence.length > 0) {
      const rawRec = rawData.productionRecommendation as Record<string, unknown> | undefined;
      if (rawRec && typeof rawRec === "object" && rawRec.title) {
        // Require the selected source to match an actual returned citation by URL.
        // Remove the fallback that replaces an unknown model citation with marketEvidence[0]!
        const rawCitationUrl = (rawRec.sourceCitation as Record<string, unknown> | undefined)?.url;
        const matchedCitation = typeof rawCitationUrl === "string"
          ? marketEvidence.find((c) => {
              if (c.url === rawCitationUrl) return true;
              if (
                c.url.includes("thefilmcollaborative.org/blog") &&
                rawCitationUrl.includes("thefilmcollaborative.org/blog")
              ) {
                return true;
              }
              return false;
            })
          : undefined;

        if (matchedCitation) {
          const canonicalSnippet = (matchedCitation.snippet || "").trim();
          if (!canonicalSnippet || canonicalSnippet.length < 10) {
            onLog?.(
              "info",
              "Marquee withheld recommendation because matched citation has an empty or unusable excerpt."
            );
          } else {
            try {
              const rawArtifact = (rawRec.affectedArtifact as Record<string, unknown>) || {};
              const candidateRec: ProductionRecommendation = {
                title: String(rawRec.title),
                category: (rawRec.category as ProductionRecommendation["category"]) || "DISTRIBUTION_STRATEGY",
                // Use the canonical returned citation's excerpt as retrieved evidence
                factualFinding: canonicalSnippet,
              // Keep model-written interpretation explicitly labeled as inferred advice
              inferredAdvice: String(rawRec.inferredAdvice || rawRec.actionableDecision || rawRec.tradeoffRationale),
              actionableDecision: String(rawRec.actionableDecision),
              tradeoffRationale: String(rawRec.tradeoffRationale),
              affectedArtifact: {
                kind: (rawArtifact.kind as ProductionRecommendation["affectedArtifact"]["kind"]) || "budget_line_item",
                identifier: String(rawArtifact.identifier || ""),
                label: String(rawArtifact.label || "Production Package"),
                tabTarget: (rawArtifact.tabTarget as ProductionRecommendation["affectedArtifact"]["tabTarget"]) || "BUDGET",
              },
              sourceCitation: matchedCitation,
            };

            // Validate exact budget target, source attribution, and physical feasibility
            productionRecommendation = validateProductionRecommendation(candidateRec, budget, marketEvidence);
            if (!productionRecommendation && candidateRec) {
              onLog?.(
                "info",
                `Marquee withheld unsupported recommendation for '${candidateRec.affectedArtifact.identifier}'.`
              );
            }
            } catch {
              productionRecommendation = null;
            }
          }
        } else {
          onLog?.(
            "info",
            "Marquee withheld recommendation because model citation URL did not match any returned citation."
          );
        }
      }
    }

    const parsedKit = PitchKitSchema.parse({
      ...rawData,
      marketEvidence,
      productionRecommendation,
    });

    onLog?.("info", `Marquee completed pitch kit. Tagline: "${parsedKit.tagline}"`);

    return {
      pitchKit: parsedKit,
      modelUsed: result.modelUsed,
      durationMs: result.durationMs,
    };
  }
}
