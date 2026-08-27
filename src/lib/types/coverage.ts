import { z } from "zod";

export const VerdictSchema = z.enum(["PASS", "CONSIDER", "RECOMMEND"]);
export type Verdict = z.infer<typeof VerdictSchema>;

export const ComparableSchema = z.object({
  title: z.string().describe("Title of comparable film/TV project"),
  year: z.number().nullish().describe("Release year"),
  why: z.string().describe("Specific artistic, thematic, or budgetary parallel"),
});
export type Comparable = z.infer<typeof ComparableSchema>;

export const CoverageScoresSchema = z.object({
  premise: z.number().min(1).max(10).describe("Originality, hook strength, and commercial/artistic viability (1-10)"),
  structure: z.number().min(1).max(10).describe("Pacing, narrative turning points, tension build and release (1-10)"),
  character: z.number().min(1).max(10).describe("Distinct voices, clear motivations, compelling arcs (1-10)"),
  dialogue: z.number().min(1).max(10).describe("Subtext, natural rhythm, efficiency, distinct cadence (1-10)"),
  marketability: z.number().min(1).max(10).describe("Festival appeal, target demographic reach, production ROI (1-10)"),
});
export type CoverageScores = z.infer<typeof CoverageScoresSchema>;

export const CoverageSchema = z.object({
  logline: z.string().describe("Sharpened 1-sentence market-ready logline"),
  synopsis: z.string().describe("3-4 paragraph narrative synopsis capturing opening, midpoint turns, and climax"),
  genre: z.array(z.string()).min(1).max(6).describe("Primary and sub-genres"),
  tone: z.string().describe("Tone descriptor, e.g., 'Atmospheric neo-noir with slow-burn dread'"),
  themes: z.array(z.string()).min(1).max(10).describe("Core thematic motifs"),
  comparables: z.array(ComparableSchema).min(1).max(6).describe("1-6 market comparables with rationale"),
  strengths: z.array(z.string()).min(1).max(8).describe("Standout artistic or commercial strengths"),
  concerns: z.array(z.string()).min(1).max(8).describe("Candid constructive production/narrative risks"),
  pacingNotes: z.string().describe("Detailed pacing diagnostic across acts/scenes"),
  scores: CoverageScoresSchema,
  verdict: VerdictSchema.describe("Standard studio reader coverage verdict"),
  verdictRationale: z.string().describe("2-3 executive sentences justifying the PASS/CONSIDER/RECOMMEND verdict"),
  pullQuote: z.string().describe("One memorable line suitable for a pitch one-sheet or festival program"),
});

export type Coverage = z.infer<typeof CoverageSchema>;
