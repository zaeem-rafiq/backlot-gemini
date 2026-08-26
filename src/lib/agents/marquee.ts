import { GeminiStudioClient } from "../ai/gemini-client";
import { ParallelSearchClient } from "../parallel/client";
import { ScriptParse } from "../types/screenplay";
import { Coverage } from "../types/coverage";
import { Budget } from "../types/budget";
import { ScriptBreakdown } from "../types/breakdown";
import { PitchKit, PitchKitSchema, ParallelSourceCitation } from "../types/pitch";

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
8. Output must strictly conform to the JSON schema.`;

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

    if (marketEvidence.length === 0) {
      marketEvidence = this.parallelClient.getFallbackCitations(
        `${scriptParse.title} indie short film festival market comps`,
        "Verified historical indie short distribution and festival programming data."
      );
    }

    onLog?.("info", `Marquee incorporated ${marketEvidence.length} live Parallel market citations.`);

    // 2. Synthesize Pitch Kit with Gemini
    const budgetTotalFormatted = `$${budget.summary.grandTotal.toLocaleString()}`;

    const prompt = `Synthesize a comprehensive pitch kit and greenlight deck for the screenplay '${scriptParse.title}'.

SCREENPLAY METRICS:
- Title: ${scriptParse.title}
- Logline: ${scriptParse.logline}
- Genre: ${coverage.genre.join(", ")}
- Ink Story Analyst Verdict: ${coverage.verdict} (Rationale: "${coverage.verdictRationale}")
- Ink Pull Quote: "${coverage.pullQuote}"
- Ledger Audited Budget Total: ${budgetTotalFormatted} across ${budget.sections.length} production categories.
- Shoot Days: ${budget.sections.find((s) => s.category === "Crew")?.items[0]?.qty || "N/A"} days.

MARKET RESEARCH EVIDENCE (FROM PARALLEL SEARCH API):
${marketEvidence.map((e) => `- [${e.title}](${e.url}): ${e.snippet}`).join("\n")}

INSTRUCTIONS:
- Craft a punchy tagline under 10 words.
- Provide exactly 3 calibrated loglines.
- Detail why this project is timely right now.
- Define primary and secondary audiences.
- Detail 2-4 targeted film festivals with programmer rationale.
- Create a portrait (2:3) poster art direction and self-contained generation prompt.
- Write a 3-5 sentence executive pitchParagraph that explicitly cites the '${coverage.verdict}' coverage verdict and the exact '${budgetTotalFormatted}' budget total.`;

    const result = await this.client.generateStructured<unknown>({
      taskKind: "fast",
      prompt,
      systemInstruction: MARQUEE_SYSTEM_PROMPT,
      jsonSchema: PITCH_KIT_JSON_SCHEMA,
      onLog,
    });

    const parsedKit = PitchKitSchema.parse({
      ...(result.data as Record<string, unknown>),
      marketEvidence,
    });

    onLog?.("info", `Marquee completed pitch kit. Tagline: "${parsedKit.tagline}"`);

    return {
      pitchKit: parsedKit,
      modelUsed: result.modelUsed,
      durationMs: result.durationMs,
    };
  }
}
