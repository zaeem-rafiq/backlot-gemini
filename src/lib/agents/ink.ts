import { GeminiStudioClient } from "../ai/gemini-client";
import { ScriptParse, ScriptParseSchema } from "../types/screenplay";
import { Coverage, CoverageSchema } from "../types/coverage";

export const INK_SYSTEM_PROMPT = `You are INK, a veteran Hollywood Studio Story Analyst and Literary Reader.
Your role is to perform rigorous screenplay analysis, calibrated scoring, and executive coverage.

You adhere to the highest industry standards:
1. Scene parsing must capture exact sluglines, clean INT/EXT/INT_EXT designators, canonical location names (for location clustering), precise page lengths in eighths of a page, and character lists in UPPERCASE.
2. Coverage must feature calibrated 1-10 scores across Premise, Structure, Character, Dialogue, and Marketability.
3. Industry verdicts must strictly be PASS, CONSIDER, or RECOMMEND with 2-3 sentences of incisive studio reader rationale.
4. Output must be strictly valid JSON matching the provided schema.`;

const SCRIPT_PARSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    format: { type: "string", enum: ["short", "feature"] },
    logline: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          slugline: { type: "string" },
          intExt: { type: "string", enum: ["INT", "EXT", "INT_EXT"] },
          location: { type: "string" },
          timeOfDay: { type: "string", enum: ["DAY", "NIGHT", "DAWN", "DUSK"] },
          summary: { type: "string" },
          characters: { type: "array", items: { type: "string" } },
          pageEighths: { type: "integer" },
        },
        required: ["id", "slugline", "intExt", "location", "timeOfDay", "summary", "characters", "pageEighths"],
      },
    },
  },
  required: ["title", "format", "logline", "scenes"],
};

const COVERAGE_JSON_SCHEMA = {
  type: "object",
  properties: {
    logline: { type: "string" },
    synopsis: { type: "string" },
    genre: { type: "array", items: { type: "string" } },
    tone: { type: "string" },
    themes: { type: "array", items: { type: "string" } },
    comparables: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          year: { type: "integer" },
          why: { type: "string" },
        },
        required: ["title", "why"],
      },
    },
    strengths: { type: "array", items: { type: "string" } },
    concerns: { type: "array", items: { type: "string" } },
    pacingNotes: { type: "string" },
    scores: {
      type: "object",
      properties: {
        premise: { type: "integer" },
        structure: { type: "integer" },
        character: { type: "integer" },
        dialogue: { type: "integer" },
        marketability: { type: "integer" },
      },
      required: ["premise", "structure", "character", "dialogue", "marketability"],
    },
    verdict: { type: "string", enum: ["PASS", "CONSIDER", "RECOMMEND"] },
    verdictRationale: { type: "string" },
    pullQuote: { type: "string" },
  },
  required: [
    "logline",
    "synopsis",
    "genre",
    "tone",
    "themes",
    "comparables",
    "strengths",
    "concerns",
    "pacingNotes",
    "scores",
    "verdict",
    "verdictRationale",
    "pullQuote",
  ],
};

export class InkAgent {
  private client: GeminiStudioClient;

  constructor(client: GeminiStudioClient = new GeminiStudioClient()) {
    this.client = client;
  }

  public async parseScript(
    screenplayText: string,
    onLog?: (level: "info" | "warn" | "error", message: string) => void
  ): Promise<{ scriptParse: ScriptParse; modelUsed: string; durationMs: number }> {
    onLog?.("info", "Ink is parsing script structure, scene sluglines, locations, and page eighths...");

    const prompt = `Parse the following screenplay text into structured scenes and metadata.
Ensure every scene is identified in sequential order with its exact slugline, canonical location name, time of day (DAY, NIGHT, DAWN, DUSK), summary, uppercase characters list, and estimated page eighths.

SCREENPLAY TEXT:
${screenplayText}`;

    const result = await this.client.generateStructured<unknown>({
      taskKind: "reasoning",
      prompt,
      systemInstruction: INK_SYSTEM_PROMPT,
      jsonSchema: SCRIPT_PARSE_JSON_SCHEMA,
      onLog,
    });

    const parsed = ScriptParseSchema.parse(result.data);
    onLog?.("info", `Ink parsed ${parsed.scenes.length} scene(s) for '${parsed.title}'.`);

    return {
      scriptParse: parsed,
      modelUsed: result.modelUsed,
      durationMs: result.durationMs,
    };
  }

  public async generateCoverage(
    scriptParse: ScriptParse,
    screenplayText: string,
    onLog?: (level: "info" | "warn" | "error", message: string) => void
  ): Promise<{ coverage: Coverage; modelUsed: string; durationMs: number }> {
    onLog?.("info", "Ink is analyzing premise, pacing, character arcs, and calibrating studio coverage scores...");

    const prompt = `Perform executive studio coverage on the screenplay titled "${scriptParse.title}".
Analyze its synopsis, genre, themes, market comparables, key narrative strengths, production concerns, 1-10 dimension scores, studio verdict (PASS/CONSIDER/RECOMMEND), reader rationale, and memorable marketing pull quote.

TITLE: ${scriptParse.title}
LOGLINE: ${scriptParse.logline}
SCENES SUMMARY:
${scriptParse.scenes.map((s) => `Scene ${s.id} (${s.slugline}, ${s.pageEighths}/8 pages): ${s.summary} [Cast: ${s.characters.join(", ")}]`).join("\n")}

FULL SCREENPLAY TEXT:
${screenplayText}`;

    const result = await this.client.generateStructured<unknown>({
      taskKind: "reasoning",
      prompt,
      systemInstruction: INK_SYSTEM_PROMPT,
      jsonSchema: COVERAGE_JSON_SCHEMA,
      onLog,
    });

    const validated = CoverageSchema.parse(result.data);
    onLog?.("info", `Ink completed coverage with verdict: ${validated.verdict}. Pull quote: "${validated.pullQuote}"`);

    return {
      coverage: validated,
      modelUsed: result.modelUsed,
      durationMs: result.durationMs,
    };
  }
}
