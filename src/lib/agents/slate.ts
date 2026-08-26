import { GeminiStudioClient } from "../ai/gemini-client";
import { ScriptParse } from "../types/screenplay";
import { ScriptBreakdown, ScriptBreakdownSchema } from "../types/breakdown";

export const SLATE_SYSTEM_PROMPT = `You are SLATE, a veteran DGA 1st Assistant Director (1st AD) and Production Breakdown Specialist.
Your role is to perform rigorous 13-element physical pre-production breakdowns on every scene of a screenplay.

For every scene, extract:
1. Cast (speaking roles)
2. Background (extras/atmosphere)
3. Props (items handled by actors)
4. Set Dressing (location atmosphere items)
5. Wardrobe (special costumes/period sourcing)
6. Makeup & Hair (special HMU, blood, sweat, aging)
7. Vehicles (picture cars, trucks, bikes)
8. SFX (practical physical effects: rain rigs, sparks, smoke, explosions, squibs)
9. VFX (post visual effects, green screens, CGI elements)
10. Stunts (falls, combat, wirework, precision driving)
11. Animals (live animals requiring wranglers)
12. Sound (critical practical sound recording cues, wild tracks)
13. Special Equipment (cranes, car mounts, hazers, rain machines)
14. Complexity (1=simple dialogue, 2=standard multi-person, 3=moderate effects/dressing, 4=heavy night/vehicles/stunts, 5=high-risk stunts/VFX/extreme logistics) with complexityReason.

Output must strictly match the JSON schema.`;

const SCRIPT_BREAKDOWN_JSON_SCHEMA = {
  type: "object",
  properties: {
    breakdowns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sceneId: { type: "integer" },
          cast: { type: "array", items: { type: "string" } },
          background: { type: "array", items: { type: "string" } },
          props: { type: "array", items: { type: "string" } },
          setDressing: { type: "array", items: { type: "string" } },
          wardrobe: { type: "array", items: { type: "string" } },
          makeupHair: { type: "array", items: { type: "string" } },
          vehicles: { type: "array", items: { type: "string" } },
          sfx: { type: "array", items: { type: "string" } },
          vfx: { type: "array", items: { type: "string" } },
          stunts: { type: "array", items: { type: "string" } },
          animals: { type: "array", items: { type: "string" } },
          sound: { type: "array", items: { type: "string" } },
          specialEquipment: { type: "array", items: { type: "string" } },
          complexity: { type: "integer", minimum: 1, maximum: 5 },
          complexityReason: { type: "string" },
        },
        required: [
          "sceneId",
          "cast",
          "background",
          "props",
          "setDressing",
          "wardrobe",
          "makeupHair",
          "vehicles",
          "sfx",
          "vfx",
          "stunts",
          "animals",
          "sound",
          "specialEquipment",
          "complexity",
          "complexityReason",
        ],
      },
    },
  },
  required: ["breakdowns"],
};

export class SlateAgent {
  private client: GeminiStudioClient;

  constructor(client: GeminiStudioClient = new GeminiStudioClient()) {
    this.client = client;
  }

  public async breakdownScript(
    scriptParse: ScriptParse,
    screenplayText: string,
    onLog?: (level: "info" | "warn" | "error", message: string) => void
  ): Promise<{ scriptBreakdown: ScriptBreakdown; modelUsed: string; durationMs: number }> {
    onLog?.("info", `Slate is analyzing physical production elements across ${scriptParse.scenes.length} scene(s)...`);

    const prompt = `Conduct a comprehensive 13-element 1st AD production breakdown for all ${scriptParse.scenes.length} scenes in '${scriptParse.title}'.
Accurately identify cast, background extras, action props, set dressing, specialized wardrobe, special HMU, picture vehicles, practical SFX, post VFX, stunts, live animals, sound cues, and special grip/camera equipment. Rate complexity 1-5 with an explanation.

SCENES OVERVIEW:
${scriptParse.scenes.map((s) => `Scene ${s.id}: ${s.slugline} [${s.timeOfDay}] - ${s.summary}`).join("\n")}

FULL SCREENPLAY TEXT:
${screenplayText}`;

    const result = await this.client.generateStructured<unknown>({
      taskKind: "reasoning",
      prompt,
      systemInstruction: SLATE_SYSTEM_PROMPT,
      jsonSchema: SCRIPT_BREAKDOWN_JSON_SCHEMA,
      onLog,
    });

    const validated = ScriptBreakdownSchema.parse(result.data);
    onLog?.("info", `Slate completed breakdown for ${validated.breakdowns.length} scene(s).`);

    return {
      scriptBreakdown: validated,
      modelUsed: result.modelUsed,
      durationMs: result.durationMs,
    };
  }
}
