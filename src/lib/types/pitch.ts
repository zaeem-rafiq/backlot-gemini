import { z } from "zod";

export const ParallelSourceCitationSchema = z.object({
  title: z.string().describe("Headline or title of retrieved market source"),
  url: z.string().url().describe("Live verifiable URL to source"),
  snippet: z.string().describe("Direct relevant excerpt supporting comparable or festival strategy"),
  query: z.string().describe("Search query that yielded this finding"),
  publishedDate: z.string().optional(),
  relevance: z.string().describe("How this market data grounds the pitch"),
});

export type ParallelSourceCitation = z.infer<typeof ParallelSourceCitationSchema>;

export const FestivalTargetSchema = z.object({
  name: z.string().describe("Official festival name, e.g., 'Sundance Film Festival (Shorts)'"),
  tier: z.enum(["Tier 1 / Oscar Qualifying", "Genre Specialist", "Regional Premiere", "Market Showcase"]),
  why: z.string().describe("Curatorial alignment and programmer interest rationale"),
});

export type FestivalTarget = z.infer<typeof FestivalTargetSchema>;

export const PosterConceptSchema = z.object({
  description: z.string().describe("Art direction and composition of one-sheet key art"),
  imagePrompt: z.string().describe("Self-contained vertical 2:3 key art generation prompt"),
  posterUrl: z.string().optional().describe("Rendered poster key art URL"),
});

export type PosterConcept = z.infer<typeof PosterConceptSchema>;

export const PitchKitSchema = z.object({
  tagline: z.string().describe("Punchy market hook under 10 words"),
  loglines: z.array(z.string()).length(3).describe("Exactly 3 calibrated loglines, sharpest first"),
  whyNow: z.string().describe("Cultural, genre, or technological timing rationale"),
  audience: z.object({
    primary: z.string().describe("Primary demographic and psychographic audience"),
    secondary: z.string().describe("Adjacent expansion audience"),
  }),
  festivalStrategy: z.array(FestivalTargetSchema).min(2).max(4),
  posterConcept: PosterConceptSchema,
  pitchParagraph: z.string().describe("3-5 sentence executive pitch paragraph explicitly citing coverage verdict and exact budget total"),
  marketEvidence: z.array(ParallelSourceCitationSchema).default([]).describe("Live market citations retrieved via Parallel Search API"),
});

export type PitchKit = z.infer<typeof PitchKitSchema>;
