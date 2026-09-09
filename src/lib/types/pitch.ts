import { z } from "zod";

export const ParallelSourceCitationSchema = z.object({
  title: z.string().describe("Headline or title of retrieved market source"),
  url: z.string().min(1).describe("Live verifiable URL to source"),
  snippet: z.string().describe("Direct relevant excerpt supporting comparable or festival strategy"),
  query: z.string().describe("Search query that yielded this finding"),
  publishedDate: z.string().nullish(),
  relevance: z.string().describe("How this market data grounds the pitch"),
  rawTitle: z.string().nullish().describe("Raw provider-returned title metadata preserved separately"),
  publisher: z.string().nullish().describe("Derived publisher or host organization name"),
  isArchive: z.boolean().nullish().describe("Whether this URL is an archive, tag, or topic feed rather than a single verified article"),
  isHistorical: z.boolean().nullish().describe("Whether the source material represents historical or archival precedent"),
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
  posterUrl: z.string().nullish().describe("Rendered poster key art URL"),
});

export type PosterConcept = z.infer<typeof PosterConceptSchema>;

export const AffectedArtifactSchema = z.object({
  kind: z.enum(["scene", "schedule_day", "budget_line_item", "coverage_risk"]).describe("Category of affected production artifact"),
  identifier: z.string().describe("Exact identifier or reference: e.g., 'Shoot Day 1', 'Scene 8', 'Line Item 24: Sound Design & Foley'"),
  label: z.string().describe("Human-readable label for cross-referencing"),
  tabTarget: z.enum(["COVERAGE", "BREAKDOWN", "SCHEDULE", "BUDGET"]).describe("Tab where this artifact is primarily located"),
});

export type AffectedArtifact = z.infer<typeof AffectedArtifactSchema>;

export const ProductionRecommendationSchema = z.object({
  title: z.string().describe("Executive title of the production recommendation"),
  category: z.enum([
    "FESTIVAL_WINDOW",
    "BUDGET_ALLOCATION",
    "SCHEDULE_PACING",
    "DISTRIBUTION_STRATEGY",
  ]).describe("Strategic operational category"),
  factualFinding: z.string().describe("Factual market benchmark or distribution precedent directly established by the source"),
  inferredAdvice: z.string().describe("Strategic recommendation inferred by Backlot Studio for this specific production"),
  actionableDecision: z.string().describe("Concrete producer action informed by evidence"),
  tradeoffRationale: z.string().describe("Why this decision optimizes the production package"),
  affectedArtifact: AffectedArtifactSchema,
  sourceCitation: ParallelSourceCitationSchema.describe("The specific Parallel search citation that supports this decision"),
});

export type ProductionRecommendation = z.infer<typeof ProductionRecommendationSchema>;

export const PitchKitSchema = z.object({
  tagline: z.string().describe("Punchy market hook under 10 words"),
  loglines: z.array(z.string()).min(2).max(5).describe("Calibrated loglines, sharpest first"),
  whyNow: z.string().describe("Cultural, genre, or technological timing rationale"),
  audience: z.object({
    primary: z.string().describe("Primary demographic and psychographic audience"),
    secondary: z.string().describe("Adjacent expansion audience"),
  }),
  festivalStrategy: z.array(FestivalTargetSchema).min(1).max(8),
  posterConcept: PosterConceptSchema,
  pitchParagraph: z.string().describe("3-5 sentence executive pitch paragraph explicitly citing coverage verdict and exact budget total"),
  marketEvidence: z.array(ParallelSourceCitationSchema).default([]).describe("Live market citations retrieved via Parallel Search API"),
  productionRecommendation: ProductionRecommendationSchema.nullish().describe("Source-backed producer decision grounded in real Parallel search evidence and referencing current run artifacts"),
});

export type PitchKit = z.infer<typeof PitchKitSchema>;

