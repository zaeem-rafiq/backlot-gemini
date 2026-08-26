import { z } from "zod";

export const SceneBreakdownSchema = z.object({
  sceneId: z.number().int().positive().describe("Scene ID matching parsed script scene"),
  cast: z.array(z.string()).describe("Speaking characters appearing in this scene"),
  background: z.array(z.string()).describe("Extras / background atmosphere, e.g., ['2 DINER PATRONS', '1 HIGHWAY COP']"),
  props: z.array(z.string()).describe("Action props handled by actors, e.g., ['REEL-TO-REEL TAPE', 'COFFEE MUG']"),
  setDressing: z.array(z.string()).describe("Location items and atmosphere dressing"),
  wardrobe: z.array(z.string()).describe("Special wardrobe items needing sourcing (exclude generic clothing)"),
  makeupHair: z.array(z.string()).describe("Special HMU requirements, e.g., ['BLOODY NOSE', 'SWEAT GLISTEN']"),
  vehicles: z.array(z.string()).describe("Picture vehicles on camera, e.g., ['1974 FORD SEDAN']"),
  sfx: z.array(z.string()).describe("Practical physical effects, e.g., ['SPARKING CONSOLE', 'SMOKE']"),
  vfx: z.array(z.string()).describe("Post-production visual effects shots, e.g., ['GREEN SCREEN MONITOR', 'GLOWING METER']"),
  stunts: z.array(z.string()).describe("Physical stunt work requiring safety coordination, e.g., ['FALL FROM CHAIR', 'FIGHT']"),
  animals: z.array(z.string()).describe("Live animals requiring professional wranglers, e.g., ['DESERT COYOTE', 'DOG']"),
  sound: z.array(z.string()).describe("Special wild tracks, room tones, or practical audio recording cues"),
  specialEquipment: z.array(z.string()).describe("Specialized camera/grip gear, e.g., ['CAR MOUNT', 'STEADICAM', 'HAZER']"),
  complexity: z.number().int().min(1).max(5).describe("1-5 production complexity rating (1=simple dialogue, 5=stunts/night/sfx/vfx)"),
  complexityReason: z.string().describe("1-line explanation of why this complexity rating was assigned"),
});

export type SceneBreakdown = z.infer<typeof SceneBreakdownSchema>;

export const ScriptBreakdownSchema = z.object({
  breakdowns: z.array(SceneBreakdownSchema),
});

export type ScriptBreakdown = z.infer<typeof ScriptBreakdownSchema>;
