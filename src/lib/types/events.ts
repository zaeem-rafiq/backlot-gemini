import { z } from "zod";
import { ScriptParseSchema } from "./screenplay";
import { CoverageSchema } from "./coverage";
import { ScriptBreakdownSchema } from "./breakdown";
import { ScheduleSchema } from "./schedule";
import { BudgetSchema } from "./budget";
import { BoardPlanSchema } from "./storyboard";
import { PitchKitSchema } from "./pitch";
import { RevisionAnalysisSchema } from "./revision";

export const AgentIdSchema = z.enum(["director", "ink", "slate", "ledger", "easel", "marquee"]);
export type AgentId = z.infer<typeof AgentIdSchema>;

export const AgentStatusStateSchema = z.enum(["idle", "working", "done", "degraded", "error"]);
export type AgentStatusState = z.infer<typeof AgentStatusStateSchema>;

export const AgentStatusEventSchema = z.object({
  type: z.literal("agent_status"),
  agent: AgentIdSchema,
  status: AgentStatusStateSchema,
  message: z.string().optional(),
});
export type AgentStatusEvent = z.infer<typeof AgentStatusEventSchema>;

export const AgentLogEventSchema = z.object({
  type: z.literal("agent_log"),
  agent: AgentIdSchema,
  level: z.enum(["info", "warn", "error"]),
  message: z.string(),
  timestamp: z.string(),
});
export type AgentLogEvent = z.infer<typeof AgentLogEventSchema>;

export const ArtifactKindSchema = z.enum([
  "scriptParse",
  "coverage",
  "breakdown",
  "schedule",
  "budget",
  "boardPlan",
  "pitchKit",
  "revision",
]);
export type ArtifactKind = z.infer<typeof ArtifactKindSchema>;

export const ArtifactEventSchema = z.object({
  type: z.literal("artifact"),
  kind: ArtifactKindSchema,
  data: z.union([
    ScriptParseSchema,
    CoverageSchema,
    ScriptBreakdownSchema,
    ScheduleSchema,
    BudgetSchema,
    BoardPlanSchema,
    PitchKitSchema,
    RevisionAnalysisSchema,
  ]),
});
export type ArtifactEvent = z.infer<typeof ArtifactEventSchema>;

export const FrameImageEventSchema = z.object({
  type: z.literal("frame_image"),
  frameId: z.string(),
  imageUrl: z.string(),
});
export type FrameImageEvent = z.infer<typeof FrameImageEventSchema>;

export const PosterImageEventSchema = z.object({
  type: z.literal("poster_image"),
  posterUrl: z.string(),
});
export type PosterImageEvent = z.infer<typeof PosterImageEventSchema>;

export const DoneEventSchema = z.object({
  type: z.literal("done"),
  runId: z.string(),
  durationMs: z.number(),
});
export type DoneEvent = z.infer<typeof DoneEventSchema>;

export const ErrorEventSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
  agent: AgentIdSchema.optional(),
  fatal: z.boolean().default(false),
});
export type ErrorEvent = z.infer<typeof ErrorEventSchema>;

export const StreamEventSchema = z.discriminatedUnion("type", [
  AgentStatusEventSchema,
  AgentLogEventSchema,
  ArtifactEventSchema,
  FrameImageEventSchema,
  PosterImageEventSchema,
  DoneEventSchema,
  ErrorEventSchema,
]);
export type StreamEvent = z.infer<typeof StreamEventSchema>;

export const RunStateSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  title: z.string(),
  screenplayText: z.string(),
  status: z.enum(["idle", "running", "complete", "error"]),
  imagesEnabled: z.boolean().default(false),
  modelsUsed: z.array(z.string()).default([]),
  scriptParse: ScriptParseSchema.optional(),
  coverage: CoverageSchema.optional(),
  breakdown: ScriptBreakdownSchema.optional(),
  schedule: ScheduleSchema.optional(),
  budget: BudgetSchema.optional(),
  boardPlan: BoardPlanSchema.optional(),
  pitchKit: PitchKitSchema.optional(),
  revision: RevisionAnalysisSchema.optional(),
  error: z.string().optional(),
});
export type RunState = z.infer<typeof RunStateSchema>;
