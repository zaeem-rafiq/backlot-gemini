import { z } from "zod";
import { SceneSchema } from "./screenplay";
import { BudgetCategorySchema } from "./budget";

export const SceneChangeTypeSchema = z.enum(["added", "removed", "modified", "unchanged"]);
export type SceneChangeType = z.infer<typeof SceneChangeTypeSchema>;

export const SceneDiffSchema = z.object({
  sceneId: z.number().int().positive(),
  changeType: SceneChangeTypeSchema,
  originalScene: SceneSchema.optional(),
  revisedScene: SceneSchema.optional(),
  changes: z.array(z.string()),
  castAdded: z.array(z.string()),
  castRemoved: z.array(z.string()),
  timeOfDayChanged: z.boolean(),
  locationChanged: z.boolean(),
  pageEighthsDelta: z.number(),
});
export type SceneDiff = z.infer<typeof SceneDiffSchema>;

export const ScriptDiffSchema = z.object({
  scenesDiff: z.array(SceneDiffSchema),
  addedSceneIds: z.array(z.number()),
  removedSceneIds: z.array(z.number()),
  modifiedSceneIds: z.array(z.number()),
  unchangedSceneIds: z.array(z.number()),
  totalPagesDeltaEighths: z.number(),
  castChanges: z.object({
    added: z.array(z.string()),
    removed: z.array(z.string()),
  }),
  locationChanges: z.object({
    added: z.array(z.string()),
    removed: z.array(z.string()),
  }),
});
export type ScriptDiff = z.infer<typeof ScriptDiffSchema>;

export const ScheduleDeltaSchema = z.object({
  originalShootDays: z.number().nonnegative(),
  revisedShootDays: z.number().nonnegative(),
  shootDaysDelta: z.number(),
  originalCompanyMoves: z.number().nonnegative(),
  revisedCompanyMoves: z.number().nonnegative(),
  companyMovesDelta: z.number(),
  originalNightDays: z.number().nonnegative(),
  revisedNightDays: z.number().nonnegative(),
  nightDaysDelta: z.number(),
  impactSummary: z.array(z.string()),
});
export type ScheduleDelta = z.infer<typeof ScheduleDeltaSchema>;

export const LineItemChangeStatusSchema = z.enum([
  "added",
  "removed",
  "increased",
  "decreased",
  "unchanged",
]);
export type LineItemChangeStatus = z.infer<typeof LineItemChangeStatusSchema>;

export const BudgetLineItemDiffSchema = z.object({
  category: BudgetCategorySchema,
  item: z.string(),
  originalTotal: z.number().nonnegative(),
  revisedTotal: z.number().nonnegative(),
  deltaTotal: z.number(),
  tracesTo: z.string(),
  status: LineItemChangeStatusSchema,
});
export type BudgetLineItemDiff = z.infer<typeof BudgetLineItemDiffSchema>;

export const BudgetDeltaSchema = z.object({
  originalGrandTotal: z.number().nonnegative(),
  revisedGrandTotal: z.number().nonnegative(),
  grandTotalDelta: z.number(),
  percentChange: z.number(),
  categoryDeltas: z.record(BudgetCategorySchema, z.number()),
  lineItemDiffs: z.array(BudgetLineItemDiffSchema),
  primaryDrivers: z.array(z.string()),
});
export type BudgetDelta = z.infer<typeof BudgetDeltaSchema>;

export const InvalidationManifestSchema = z.object({
  staleSceneIds: z.array(z.number()),
  staleFrameIds: z.array(z.string()),
  reusableFrameIds: z.array(z.string()),
  reasonBySceneId: z.record(z.string(), z.string()),
});
export type InvalidationManifest = z.infer<typeof InvalidationManifestSchema>;

export const RevisionAnalysisSchema = z.object({
  scriptDiff: ScriptDiffSchema,
  scheduleDelta: ScheduleDeltaSchema,
  budgetDelta: BudgetDeltaSchema,
  invalidationManifest: InvalidationManifestSchema,
  timestamp: z.string(),
});
export type RevisionAnalysis = z.infer<typeof RevisionAnalysisSchema>;
