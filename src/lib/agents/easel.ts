import { GeminiStudioClient } from "../ai/gemini-client";
import { ScriptParse } from "../types/screenplay";
import { ScriptBreakdown } from "../types/breakdown";
import { BoardPlan, BoardPlanSchema, Frame } from "../types/storyboard";

export const EASEL_SYSTEM_PROMPT = `You are EASEL, a veteran Feature Cinematographer (ASC) and Key Storyboard Artist.
Your role is to design visual storytelling plans, shot lists, camera blocking, focal lengths, lighting setups, and keyframe prompt descriptions.

For every key visual beat:
1. Assign a precise shotType (EWS, WS, MS, MCU, CU, ECU, OTS, POV, TWO_SHOT, INSERT).
2. Assign purposeful camera movement (STATIC, PAN, TILT, DOLLY, TRACK, HANDHELD, STEADICAM, CRANE, PUSH_IN).
3. Specify cinematic focal lengths (e.g., '35mm anamorphic', '50mm prime', '85mm portrait').
4. Specify lighting contrast, color temperature, and atmospheric practicals.
5. Detail actor staging and eyeline blocking.
6. Provide a self-contained, photorealistic visual image generation prompt describing the cinematic frame without screenplay jargon.

Output must strictly conform to the JSON schema.`;

const BOARD_PLAN_JSON_SCHEMA = {
  type: "object",
  properties: {
    visualStyleStatement: { type: "string" },
    aspectRatio: { type: "string" },
    frames: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sceneId: { type: "integer" },
          frameId: { type: "string" },
          shotType: {
            type: "string",
            enum: ["EWS", "WS", "MS", "MCU", "CU", "ECU", "OTS", "POV", "TWO_SHOT", "INSERT"],
          },
          movement: {
            type: "string",
            enum: ["STATIC", "PAN", "TILT", "DOLLY", "TRACK", "HANDHELD", "STEADICAM", "CRANE", "PUSH_IN"],
          },
          lensMm: { type: "string" },
          description: { type: "string" },
          blocking: { type: "string" },
          lighting: { type: "string" },
          imagePrompt: { type: "string" },
          imageUrl: { type: "string" },
        },
        required: [
          "sceneId",
          "frameId",
          "shotType",
          "movement",
          "lensMm",
          "description",
          "blocking",
          "lighting",
          "imagePrompt",
        ],
      },
    },
  },
  required: ["visualStyleStatement", "aspectRatio", "frames"],
};

export class EaselAgent {
  private client: GeminiStudioClient;

  constructor(client: GeminiStudioClient = new GeminiStudioClient()) {
    this.client = client;
  }

  public async generateBoardPlan(
    scriptParse: ScriptParse,
    breakdown: ScriptBreakdown,
    options: {
      enableImages?: boolean;
      onLog?: (level: "info" | "warn" | "error", message: string) => void;
      onFrameImage?: (frameId: string, imageUrl: string) => void;
    } = {}
  ): Promise<{ boardPlan: BoardPlan; modelUsed: string; durationMs: number }> {
    const onLog = options.onLog;
    onLog?.("info", "Easel is designing visual composition, camera movement, and storyboard keyframes...");

    const prompt = `Design a comprehensive cinematic storyboard plan for '${scriptParse.title}'.
Establish a unified visual style statement (color palette, anamorphic texture, aspect ratio '2.39:1') and generate 4 to 8 key storyboard frames capturing opening mood, central rising action, key stunt/SFX beats, and climax.

SCENES OVERVIEW:
${scriptParse.scenes.map((s) => `Scene ${s.id} [${s.slugline}, ${s.timeOfDay}]: ${s.summary}`).join("\n")}

PHYSICAL BREAKDOWN HIGHLIGHTS:
${breakdown.breakdowns.map((b) => `Scene ${b.sceneId} (Complexity ${b.complexity}): SFX=[${b.sfx.join(",")}], Stunts=[${b.stunts.join(",")}], Equip=[${b.specialEquipment.join(",")}]`).join("\n")}`;

    const result = await this.client.generateStructured<unknown>({
      taskKind: "fast",
      prompt,
      systemInstruction: EASEL_SYSTEM_PROMPT,
      jsonSchema: BOARD_PLAN_JSON_SCHEMA,
      onLog,
    });

    const parsedPlan = BoardPlanSchema.parse(result.data);
    onLog?.("info", `Easel generated ${parsedPlan.frames.length} storyboard frames in style: "${parsedPlan.visualStyleStatement}"`);

    // If image generation is enabled, attempt rendering via Gemini image chain
    if (options.enableImages) {
      onLog?.("info", "Image rendering enabled. Requesting Gemini image model generation for storyboard panels...");
      for (const frame of parsedPlan.frames) {
        try {
          const imageResult = await this.renderFrameImage(frame, onLog);
          if (imageResult) {
            frame.imageUrl = imageResult;
            options.onFrameImage?.(frame.frameId, imageResult);
          }
        } catch (imgErr) {
          onLog?.(
            "warn",
            `Frame ${frame.frameId} image generation skipped (free-tier quota or error): ${String(imgErr)}. Degraded to previz card.`
          );
        }
      }
    } else {
      onLog?.("info", "Easel running in Previz-First mode. Rich cinematographer cards generated with full shot specs.");
    }

    return {
      boardPlan: parsedPlan,
      modelUsed: result.modelUsed,
      durationMs: result.durationMs,
    };
  }

  public async renderFrameImage(
    frame: Frame,
    onLog?: (level: "info" | "warn" | "error", message: string) => void
  ): Promise<string | undefined> {
    onLog?.("info", `Rendering visual frame ${frame.frameId} via Gemini Enterprise Agent Platform image chain...`);
    try {
      const result = await this.client.generateImage(frame.imagePrompt, { onLog });
      return result.imageUrl;
    } catch (err) {
      onLog?.("warn", `Frame ${frame.frameId} image generation skipped: ${String(err)}. Degraded to previz card.`);
      return undefined;
    }
  }
}
