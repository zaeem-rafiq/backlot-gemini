import { describe, it, expect } from "vitest";
import {
  calculateSceneEffectiveEighths,
  getSceneShootType,
  buildSchedule,
} from "../schedule-engine";
import { ScriptParse } from "../../types/screenplay";
import { ScriptBreakdown } from "../../types/breakdown";
import { FREQUENCY_ZERO_PARSED } from "../../../fixtures/frequency-zero";

describe("Deterministic Schedule Engine", () => {
  describe("Effective Eighths Calculation", () => {
    it("applies 3/8 page floor to sub-3-eighth scenes before multiplier", () => {
      // 1 eighth scene with complexity 1 -> floored to 3 -> 3 * 1.0 = 3.0
      expect(calculateSceneEffectiveEighths(1, 1)).toBe(3.0);
      // 2 eighth scene with complexity 3 -> floored to 3 -> 3 * 1.4 = 4.2
      expect(calculateSceneEffectiveEighths(2, 3)).toBe(4.2);
      // 2 eighth scene with complexity 5 -> floored to 3 -> 3 * 2.6 = 7.8
      expect(calculateSceneEffectiveEighths(2, 5)).toBe(7.8);
    });

    it("applies complexity multipliers to standard and larger scenes", () => {
      // 8 eighths at complexity 1 -> 8.0
      expect(calculateSceneEffectiveEighths(8, 1)).toBe(8.0);
      // 10 eighths at complexity 3 -> 10 * 1.4 = 14.0
      expect(calculateSceneEffectiveEighths(10, 3)).toBe(14.0);
      // 10 eighths at complexity 4 -> 10 * 1.9 = 19.0
      expect(calculateSceneEffectiveEighths(10, 4)).toBe(19.0);
      // 10 eighths at complexity 5 -> 10 * 2.6 = 26.0
      expect(calculateSceneEffectiveEighths(10, 5)).toBe(26.0);
    });
  });

  describe("Shoot Type Classification", () => {
    it("classifies NIGHT as night shoot, and DAY/DAWN/DUSK as day shoots", () => {
      expect(getSceneShootType("NIGHT")).toBe("NIGHT");
      expect(getSceneShootType("DAY")).toBe("DAY");
      expect(getSceneShootType("DAWN")).toBe("DAY");
      expect(getSceneShootType("DUSK")).toBe("DAY");
    });
  });

  describe("Day and Night Ordering & Turnaround", () => {
    it("schedules all DAY shoots prior to NIGHT shoots", () => {
      const testScript: ScriptParse = {
        title: "Ordering Test",
        format: "short",
        logline: "Testing turnaround protection.",
        scenes: [
          {
            id: 1,
            slugline: "INT. MOTEL - NIGHT",
            intExt: "INT",
            location: "MOTEL",
            timeOfDay: "NIGHT",
            summary: "Night scene 1",
            characters: ["SAM"],
            pageEighths: 8,
          },
          {
            id: 2,
            slugline: "EXT. DINER - DAY",
            intExt: "EXT",
            location: "DINER",
            timeOfDay: "DAY",
            summary: "Day scene 1",
            characters: ["SAM"],
            pageEighths: 8,
          },
        ],
      };

      const schedule = buildSchedule(testScript);
      expect(schedule.days.length).toBe(2);
      expect(schedule.days[0].shootType).toBe("DAY");
      expect(schedule.days[0].sceneIds).toEqual([2]);
      expect(schedule.days[1].shootType).toBe("NIGHT");
      expect(schedule.days[1].sceneIds).toEqual([1]);
    });
  });

  describe("Company Moves and Capacity Deduction", () => {
    it("deducts 6/8 capacity when moving locations within the same shoot day", () => {
      const testScript: ScriptParse = {
        title: "Company Move Test",
        format: "short",
        logline: "Testing location move penalty.",
        scenes: [
          {
            id: 1,
            slugline: "INT. DINER - DAY",
            intExt: "INT",
            location: "DINER",
            timeOfDay: "DAY",
            summary: "Scene 1",
            characters: ["SAM"],
            pageEighths: 12,
          },
          {
            id: 2,
            slugline: "EXT. PARKING LOT - DAY",
            intExt: "EXT",
            location: "PARKING LOT",
            timeOfDay: "DAY",
            summary: "Scene 2",
            characters: ["SAM"],
            pageEighths: 10,
          },
        ],
      };

      const schedule = buildSchedule(testScript);
      expect(schedule.days.length).toBe(1);
      const day1 = schedule.days[0];
      expect(day1.companyMoves).toBe(1);
      // 12 eighths (scene 1) + 6 eighths (move) + 10 eighths (scene 2) = 28 effective eighths
      expect(day1.effectiveEighths).toBe(28);
      expect(day1.totalEighths).toBe(22);
      expect(day1.locations).toEqual(["DINER", "PARKING LOT"]);
    });

    it("splits into next day when combined scene plus move exceeds base 36 eighths", () => {
      const testScript: ScriptParse = {
        title: "Overflow Move Test",
        format: "short",
        logline: "Testing day overflow.",
        scenes: [
          {
            id: 1,
            slugline: "INT. WAREHOUSE - DAY",
            intExt: "INT",
            location: "WAREHOUSE",
            timeOfDay: "DAY",
            summary: "Scene 1",
            characters: ["SAM"],
            pageEighths: 24, // 24 effective
          },
          {
            id: 2,
            slugline: "EXT. DOCKS - DAY",
            intExt: "EXT",
            location: "DOCKS",
            timeOfDay: "DAY",
            summary: "Scene 2",
            characters: ["SAM"],
            pageEighths: 10, // 24 + 6 + 10 = 40 > 36
          },
        ],
      };

      const schedule = buildSchedule(testScript);
      expect(schedule.days.length).toBe(2);
      expect(schedule.days[0].sceneIds).toEqual([1]);
      expect(schedule.days[1].sceneIds).toEqual([2]);
    });
  });

  describe("Full Flagship Screenplay Schedule", () => {
    it("generates a valid, multi-day schedule with golden hour and cast metrics for FREQUENCY ZERO", () => {
      const breakdown: ScriptBreakdown = {
        breakdowns: [
          {
            sceneId: 1,
            cast: ["JACK", "MAYA"],
            background: [],
            props: ["ACETATE RECORD", "MICROPHONE"],
            setDressing: ["VU METERS"],
            wardrobe: [],
            makeupHair: [],
            vehicles: [],
            sfx: [],
            vfx: [],
            stunts: [],
            animals: [],
            sound: ["HIGH FREQUENCY WHINE"],
            specialEquipment: [],
            complexity: 2,
            complexityReason: "Studio dialogue scene with sound cues",
          },
          {
            sceneId: 2,
            cast: ["JACK", "MAYA"],
            background: [],
            props: ["FIRE EXTINGUISHER"],
            setDressing: ["TRANSMITTER CAGE"],
            wardrobe: [],
            makeupHair: [],
            vehicles: [],
            sfx: ["SPARKS", "SMOKE PLUME"],
            vfx: [],
            stunts: [],
            animals: [],
            sound: ["HUM"],
            specialEquipment: [],
            complexity: 3,
            complexityReason: "Practical sparking and smoke effects on electrical set",
          },
          {
            sceneId: 8,
            cast: ["JACK"],
            background: [],
            props: ["FLARE"],
            setDressing: [],
            wardrobe: ["WET JACKET"],
            makeupHair: ["FOREHEAD GASH BLOOD"],
            vehicles: ["EIGHTEEN WHEELER"],
            sfx: ["RAIN", "SKIDDING SOUNDS"],
            vfx: [],
            stunts: ["GUARDRAIL DIVE / FALL"],
            animals: [],
            sound: ["THUNDER"],
            specialEquipment: ["RAIN MACHINE", "CAR RIG"],
            complexity: 5,
            complexityReason: "Night exterior rain, moving vehicle, stunt fall, and practical SFX",
          },
        ],
      };

      const schedule = buildSchedule(FREQUENCY_ZERO_PARSED, breakdown);

      expect(schedule.days.length).toBeGreaterThan(1);
      expect(schedule.stats.shootDays).toBe(schedule.days.length);
      expect(schedule.stats.nightShoots).toBeGreaterThan(0);
      expect(schedule.stats.castDays["JACK"]).toBe(schedule.stats.shootDays);
      expect(schedule.stats.castDays["MAYA"]).toBeGreaterThan(0);
      expect(schedule.assumptions.length).toBeGreaterThan(0);

      // Verify golden hour note appears on relevant days
      const allNotes = schedule.days.flatMap((d) => d.notes);
      expect(allNotes.some((n) => n.includes("Golden Hour"))).toBe(true);
      expect(allNotes.some((n) => n.includes("Stunt Coordinator"))).toBe(true);
    });
  });
});
