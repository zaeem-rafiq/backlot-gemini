import { z } from "zod";

export const IntExtSchema = z.enum(["INT", "EXT", "INT_EXT"]);
export type IntExt = z.infer<typeof IntExtSchema>;

export const TimeOfDaySchema = z.enum(["DAY", "NIGHT", "DAWN", "DUSK"]);
export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;

export const SceneSchema = z.object({
  id: z.number().int().positive().describe("1-based sequential scene index matching script order"),
  slugline: z.string().describe("Standard scene heading, e.g., 'INT. BROADCAST BOOTH - NIGHT'"),
  intExt: IntExtSchema.describe("Interior, Exterior, or Int/Ext hybrid"),
  location: z.string().describe("Normalized canonical location name used for schedule clustering, e.g., 'BROADCAST BOOTH'"),
  timeOfDay: TimeOfDaySchema.describe("Time of day bucket: DAY, NIGHT, DAWN, or DUSK"),
  summary: z.string().describe("Concise 1-2 sentence dramatic and visual action summary"),
  characters: z.array(z.string()).describe("List of speaking or prominent characters in UPPERCASE"),
  pageEighths: z.number().int().min(1).describe("Scene length measured in industry-standard eighths of a page (e.g., 4 = 1/2 page)"),
});

export type Scene = z.infer<typeof SceneSchema>;

export const ScriptFormatSchema = z.enum(["short", "feature"]);
export type ScriptFormat = z.infer<typeof ScriptFormatSchema>;

export const ScriptParseSchema = z.object({
  title: z.string().describe("Working or registered title of the screenplay"),
  format: ScriptFormatSchema.describe("Project format: short or feature"),
  logline: z.string().describe("One-sentence narrative hook"),
  scenes: z.array(SceneSchema).min(1).describe("Chronological ordered list of parsed scenes"),
});

export type ScriptParse = z.infer<typeof ScriptParseSchema>;
