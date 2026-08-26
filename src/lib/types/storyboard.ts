import { z } from "zod";

export const ShotTypeSchema = z.enum([
  "EWS", // Extreme Wide Shot
  "WS",  // Wide Shot
  "MS",  // Medium Shot
  "MCU", // Medium Close-Up
  "CU",  // Close-Up
  "ECU", // Extreme Close-Up
  "OTS", // Over-The-Shoulder
  "POV", // Point of View
  "TWO_SHOT",
  "INSERT",
]);
export type ShotType = z.infer<typeof ShotTypeSchema>;

export const CameraMovementSchema = z.enum([
  "STATIC",
  "PAN",
  "TILT",
  "DOLLY",
  "TRACK",
  "HANDHELD",
  "STEADICAM",
  "CRANE",
  "PUSH_IN",
]);
export type CameraMovement = z.infer<typeof CameraMovementSchema>;

export const FrameSchema = z.object({
  sceneId: z.number().int().positive(),
  frameId: z.string().describe("Scene number + letter, e.g. '1A', '1B', '4A'"),
  shotType: ShotTypeSchema,
  movement: CameraMovementSchema,
  lensMm: z.string().describe("Focal length, e.g., '35mm anamorphic', '50mm prime', '85mm'"),
  description: z.string().describe("Present-tense visual action description"),
  blocking: z.string().describe("Actor staging, eyelines, and character movement"),
  lighting: z.string().describe("Lighting setup, color temperature, practicals, atmosphere"),
  imagePrompt: z.string().describe("Self-contained photorealistic visual generation prompt (no screenplay jargon)"),
  imageUrl: z.string().optional().describe("Rendered image URL or base64 data URI when image generation is enabled"),
});

export type Frame = z.infer<typeof FrameSchema>;

export const BoardPlanSchema = z.object({
  visualStyleStatement: z.string().describe("Overarching cinematographer statement governing color palette, contrast, and grain"),
  aspectRatio: z.string().default("2.39:1").describe("Cinematic aspect ratio, e.g., '2.39:1', '1.85:1', '16:9'"),
  frames: z.array(FrameSchema).min(1),
});

export type BoardPlan = z.infer<typeof BoardPlanSchema>;
