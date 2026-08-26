import { describe, it, expect } from "vitest";
import { buildBudget } from "../budget-engine";
import { buildSchedule } from "../schedule-engine";
import { ScriptBreakdown } from "../../types/breakdown";
import { FREQUENCY_ZERO_PARSED } from "../../../fixtures/frequency-zero";
import { DEFAULT_INDIE_RATE_CARD } from "../rate-card";

describe("Deterministic Budget Engine", () => {
  const sampleBreakdown: ScriptBreakdown = {
    breakdowns: [
      {
        sceneId: 1,
        cast: ["JACK", "MAYA"],
        background: [],
        props: ["MICROPHONE"],
        setDressing: [],
        wardrobe: [],
        makeupHair: [],
        vehicles: [],
        sfx: [],
        vfx: [],
        stunts: [],
        animals: [],
        sound: [],
        specialEquipment: [],
        complexity: 2,
        complexityReason: "Standard studio dialogue",
      },
      {
        sceneId: 2,
        cast: ["JACK", "MAYA"],
        background: [],
        props: ["FIRE EXTINGUISHER"],
        setDressing: ["TRANSMITTER RACK"],
        wardrobe: [],
        makeupHair: [],
        vehicles: [],
        sfx: ["SPARKING TRANSFORMER", "SMOKE"],
        vfx: [],
        stunts: [],
        animals: [],
        sound: [],
        specialEquipment: [],
        complexity: 3,
        complexityReason: "Practical sparking and smoke",
      },
      {
        sceneId: 6,
        cast: ["JACK"],
        background: ["2 HIGHWAY WORKERS"],
        props: ["BINOCULARS"],
        setDressing: [],
        wardrobe: [],
        makeupHair: [],
        vehicles: ["1978 CHEVY BLAZER"],
        sfx: [],
        vfx: [],
        stunts: [],
        animals: [],
        sound: [],
        specialEquipment: [],
        complexity: 2,
        complexityReason: "Exterior road dialogue with background",
      },
      {
        sceneId: 8,
        cast: ["JACK"],
        background: [],
        props: ["FLARE"],
        setDressing: [],
        wardrobe: [],
        makeupHair: ["FOREHEAD GASH BLOOD"],
        vehicles: ["SEMI TRUCK"],
        sfx: ["RAIN EFFECTS"],
        vfx: ["COMPOSITED CANYON BACKGROUND"],
        stunts: ["GUARDRAIL DIVE FALL"],
        animals: [],
        sound: [],
        specialEquipment: ["RAIN RIG"],
        complexity: 5,
        complexityReason: "Night rain stunts and VFX",
      },
    ],
  };

  const schedule = buildSchedule(FREQUENCY_ZERO_PARSED, sampleBreakdown);
  const budget = buildBudget(schedule, sampleBreakdown, DEFAULT_INDIE_RATE_CARD);

  describe("Provenance and Auditability Invariants", () => {
    it("guarantees 100% of line items carry non-empty tracesTo provenance strings", () => {
      let lineItemCount = 0;
      for (const section of budget.sections) {
        for (const item of section.items) {
          lineItemCount++;
          expect(item.tracesTo).toBeDefined();
          expect(typeof item.tracesTo).toBe("string");
          expect(item.tracesTo.trim().length).toBeGreaterThan(5);
        }
      }
      expect(lineItemCount).toBeGreaterThan(15);
    });
  });

  describe("Conditional Crew Roles", () => {
    it("books Stunt Coordinator only when stunts exist and traces to specific scene", () => {
      const crewSection = budget.sections.find((s) => s.category === "Crew")!;
      const stuntItem = crewSection.items.find((i) => i.item === "Stunt Coordinator");
      expect(stuntItem).toBeDefined();
      expect(stuntItem!.tracesTo).toContain("scene(s): 8");
      expect(stuntItem!.rate).toBe(DEFAULT_INDIE_RATE_CARD.crewDaily.stuntCoordinator);
    });

    it("books Practical SFX Tech only when SFX exists and traces to specific scenes", () => {
      const crewSection = budget.sections.find((s) => s.category === "Crew")!;
      const sfxItem = crewSection.items.find((i) => i.item === "Practical SFX Technician");
      expect(sfxItem).toBeDefined();
      expect(sfxItem!.tracesTo).toContain("scene(s): 2, 8");
      expect(sfxItem!.rate).toBe(DEFAULT_INDIE_RATE_CARD.crewDaily.sfxTech);
    });

    it("does NOT book Animal Wrangler when no animals are in the breakdown", () => {
      const crewSection = budget.sections.find((s) => s.category === "Crew")!;
      const animalItem = crewSection.items.find((i) => i.item === "Animal Wrangler");
      expect(animalItem).toBeUndefined();
    });
  });

  describe("Night Premium Arithmetic", () => {
    it("calculates 15% crew premium on night shoot days", () => {
      expect(schedule.stats.nightShoots).toBeGreaterThan(0);
      const nightSection = budget.sections.find((s) => s.category === "Night Premium");
      expect(nightSection).toBeDefined();
      expect(budget.summary.nightPremiumTotal).toBeGreaterThan(0);
      expect(nightSection!.items[0].tracesTo).toContain("15% night turnaround premium");
    });
  });

  describe("Cast Arithmetic", () => {
    it("calculates speaking cast based on exact scheduled cast days", () => {
      const castSection = budget.sections.find((s) => s.category === "Cast")!;
      const jackItem = castSection.items.find((i) => i.item === "Cast: JACK")!;
      expect(jackItem).toBeDefined();
      expect(jackItem.qty).toBe(schedule.stats.castDays["JACK"]);
      expect(jackItem.total).toBe(jackItem.qty * DEFAULT_INDIE_RATE_CARD.castDaily.speakingPerformer);
    });

    it("calculates background extras from breakdown", () => {
      const castSection = budget.sections.find((s) => s.category === "Cast")!;
      const bgItem = castSection.items.find((i) => i.item === "Background Performers")!;
      expect(bgItem).toBeDefined();
      expect(bgItem.qty).toBe(1); // 1 background entry in scene 6
      expect(bgItem.tracesTo).toContain("scene(s): 6");
    });
  });

  describe("Post Production and VFX", () => {
    it("calculates VFX compositing per flagged shot", () => {
      const postSection = budget.sections.find((s) => s.category === "Post Production")!;
      const vfxItem = postSection.items.find((i) => i.item === "Visual Effects (VFX) Compositing")!;
      expect(vfxItem).toBeDefined();
      expect(vfxItem.qty).toBe(1); // 1 VFX shot in scene 8
      expect(vfxItem.total).toBe(DEFAULT_INDIE_RATE_CARD.postProduction.vfxPerShot);
      expect(vfxItem.tracesTo).toContain("scene(s): 8");
    });
  });

  describe("Contingency and Grand Total Sums", () => {
    it("adds 10% contingency and matches grand total exact sum", () => {
      const summary = budget.summary;
      const expectedSubtotal =
        summary.crewSubtotal +
        summary.nightPremiumTotal +
        summary.castSubtotal +
        summary.equipmentSubtotal +
        summary.locationsLogisticsSubtotal +
        summary.postSubtotal;

      expect(summary.subtotalBeforeContingency).toBe(expectedSubtotal);
      expect(summary.contingencyTotal).toBe(Math.round(expectedSubtotal * 0.1));
      expect(summary.grandTotal).toBe(expectedSubtotal + summary.contingencyTotal);
    });
  });
});
