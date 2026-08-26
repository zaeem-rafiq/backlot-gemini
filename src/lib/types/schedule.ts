import { z } from "zod";

export const ShootTypeSchema = z.enum(["DAY", "NIGHT"]);
export type ShootType = z.infer<typeof ShootTypeSchema>;

export const ShootingDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  shootType: ShootTypeSchema,
  sceneIds: z.array(z.number().int().positive()),
  locations: z.array(z.string()),
  totalEighths: z.number(),
  effectiveEighths: z.number(),
  castNeeded: z.array(z.string()),
  notes: z.array(z.string()),
  companyMoves: z.number().int().nonnegative(),
});

export type ShootingDay = z.infer<typeof ShootingDaySchema>;

export const ScheduleStatsSchema = z.object({
  shootDays: z.number().int().nonnegative(),
  nightShoots: z.number().int().nonnegative(),
  companyMoves: z.number().int().nonnegative(),
  totalPageEighths: z.number().nonnegative(),
  totalEffectiveEighths: z.number().nonnegative(),
  castDays: z.record(z.string(), z.number().int().nonnegative()),
});

export type ScheduleStats = z.infer<typeof ScheduleStatsSchema>;

export const ScheduleSchema = z.object({
  days: z.array(ShootingDaySchema),
  stats: ScheduleStatsSchema,
  assumptions: z.array(z.string()),
});

export type Schedule = z.infer<typeof ScheduleSchema>;
