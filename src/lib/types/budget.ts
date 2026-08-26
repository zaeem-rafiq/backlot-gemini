import { z } from "zod";

export const BudgetUnitSchema = z.enum(["day", "flat", "percent", "per-person-day", "per-shot"]);
export type BudgetUnit = z.infer<typeof BudgetUnitSchema>;

export const BudgetCategorySchema = z.enum([
  "Crew",
  "Night Premium",
  "Cast",
  "Equipment",
  "Locations & Logistics",
  "Post Production",
  "Contingency",
]);
export type BudgetCategory = z.infer<typeof BudgetCategorySchema>;

export const BudgetLineItemSchema = z.object({
  category: BudgetCategorySchema,
  item: z.string().describe("Role or resource description, e.g., 'Director of Photography'"),
  unit: BudgetUnitSchema,
  qty: z.number().nonnegative(),
  rate: z.number().nonnegative(),
  total: z.number().nonnegative(),
  tracesTo: z.string().min(1).describe("Provenance explanation citing specific schedule or breakdown elements"),
});

export type BudgetLineItem = z.infer<typeof BudgetLineItemSchema>;

export const BudgetSectionSchema = z.object({
  category: BudgetCategorySchema,
  subtotal: z.number().nonnegative(),
  items: z.array(BudgetLineItemSchema),
});

export type BudgetSection = z.infer<typeof BudgetSectionSchema>;

export const BudgetSummarySchema = z.object({
  crewSubtotal: z.number().nonnegative(),
  nightPremiumTotal: z.number().nonnegative(),
  castSubtotal: z.number().nonnegative(),
  equipmentSubtotal: z.number().nonnegative(),
  locationsLogisticsSubtotal: z.number().nonnegative(),
  postSubtotal: z.number().nonnegative(),
  subtotalBeforeContingency: z.number().nonnegative(),
  contingencyTotal: z.number().nonnegative(),
  grandTotal: z.number().nonnegative(),
});

export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

export const BudgetSchema = z.object({
  sections: z.array(BudgetSectionSchema),
  summary: BudgetSummarySchema,
  rateCardName: z.string(),
  currency: z.literal("USD"),
});

export type Budget = z.infer<typeof BudgetSchema>;
