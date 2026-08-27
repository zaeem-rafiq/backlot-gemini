import { describe, it, expect } from "vitest";
import { ScriptParse } from "../../types/screenplay";
import { buildSchedule } from "../schedule-engine";
import { buildBudget } from "../budget-engine";
import {
  diffScriptParses,
  calculateScheduleDelta,
  calculateBudgetDelta,
  analyzeScriptRevision,
} from "../revision-engine";
import { FREQUENCY_ZERO_PARSED } from "../../../fixtures/frequency-zero";

describe("Adversarial Revision Stress Tests", () => {
  const baseScript: ScriptParse = FREQUENCY_ZERO_PARSED;

  it("handles complete inversion of scene sequence without crashing", () => {
    const reversedScript: ScriptParse = {
      ...baseScript,
      scenes: [...baseScript.scenes].reverse().map((s, idx) => ({
        ...s,
        id: idx + 1,
      })),
    };

    const origSchedule = buildSchedule(baseScript);
    const revSchedule = buildSchedule(reversedScript);
    const origBudget = buildBudget(origSchedule);
    const revBudget = buildBudget(revSchedule);

    const analysis = analyzeScriptRevision(
      baseScript,
      reversedScript,
      origSchedule,
      revSchedule,
      origBudget,
      revBudget
    );

    expect(analysis.scheduleDelta.revisedShootDays).toBeGreaterThan(0);
    expect(analysis.budgetDelta.revisedGrandTotal).toBeGreaterThan(0);
    expect(Number.isFinite(analysis.budgetDelta.grandTotalDelta)).toBe(true);
    expect(Number.isFinite(analysis.budgetDelta.percentChange)).toBe(true);
  });

  it("handles extreme micro-scene fragmentation (1 scene split into 6 micro-scenes)", () => {
    // 1 scene of 12 eighths split into 6 scenes of 2 eighths each at different locations
    const fragmentedScript: ScriptParse = {
      ...baseScript,
      scenes: [
        {
          id: 1,
          slugline: "INT. BOOTH 1 - DAY",
          intExt: "INT",
          location: "BOOTH 1",
          timeOfDay: "DAY",
          summary: "Part 1",
          characters: ["JACK"],
          pageEighths: 2,
        },
        {
          id: 2,
          slugline: "EXT. TOWER 1 - DAY",
          intExt: "EXT",
          location: "TOWER 1",
          timeOfDay: "DAY",
          summary: "Part 2",
          characters: ["JACK"],
          pageEighths: 2,
        },
        {
          id: 3,
          slugline: "INT. TRUCK 1 - DAY",
          intExt: "INT",
          location: "TRUCK 1",
          timeOfDay: "DAY",
          summary: "Part 3",
          characters: ["JACK"],
          pageEighths: 2,
        },
        {
          id: 4,
          slugline: "EXT. HIGHWAY 1 - DAY",
          intExt: "EXT",
          location: "HIGHWAY 1",
          timeOfDay: "DAY",
          summary: "Part 4",
          characters: ["JACK"],
          pageEighths: 2,
        },
        {
          id: 5,
          slugline: "INT. DINER 1 - DAY",
          intExt: "INT",
          location: "DINER 1",
          timeOfDay: "DAY",
          summary: "Part 5",
          characters: ["JACK"],
          pageEighths: 2,
        },
        {
          id: 6,
          slugline: "EXT. CANYON 1 - DAY",
          intExt: "EXT",
          location: "CANYON 1",
          timeOfDay: "DAY",
          summary: "Part 6",
          characters: ["JACK"],
          pageEighths: 2,
        },
      ],
    };

    const origSchedule = buildSchedule(baseScript);
    const revSchedule = buildSchedule(fragmentedScript);
    const origBudget = buildBudget(origSchedule);
    const revBudget = buildBudget(revSchedule);

    const delta = calculateScheduleDelta(origSchedule, revSchedule);
    const budgetDelta = calculateBudgetDelta(origBudget, revBudget);

    expect(delta.revisedCompanyMoves).toBeGreaterThan(0);
    expect(budgetDelta.revisedGrandTotal).toBeGreaterThan(0);
  });

  it("handles 100% Day-to-Night flip and measures night premium surge", () => {
    const allNightScript: ScriptParse = {
      ...baseScript,
      scenes: baseScript.scenes.map((s) => ({
        ...s,
        timeOfDay: "NIGHT",
      })),
    };

    const origSchedule = buildSchedule(baseScript);
    const revSchedule = buildSchedule(allNightScript);
    const origBudget = buildBudget(origSchedule);
    const revBudget = buildBudget(revSchedule);

    const budgetDelta = calculateBudgetDelta(origBudget, revBudget);
    const schedDelta = calculateScheduleDelta(origSchedule, revSchedule);

    // Night days must increase or stay high
    expect(schedDelta.revisedNightDays).toBe(revSchedule.stats.shootDays);
    // Night premium in budget must be equal or higher
    expect(revBudget.summary.nightPremiumTotal).toBeGreaterThanOrEqual(origBudget.summary.nightPremiumTotal);
  });

  it("handles massive cast explosion (adding 10 new characters)", () => {
    const massiveCastScript: ScriptParse = {
      ...baseScript,
      scenes: baseScript.scenes.map((s, idx) => ({
        ...s,
        characters: [...s.characters, `EXTRATOOL_${idx}_A`, `EXTRATOOL_${idx}_B`],
      })),
    };

    const origSchedule = buildSchedule(baseScript);
    const revSchedule = buildSchedule(massiveCastScript);
    const origBudget = buildBudget(origSchedule);
    const revBudget = buildBudget(revSchedule);

    const budgetDelta = calculateBudgetDelta(origBudget, revBudget);
    expect(budgetDelta.categoryDeltas["Cast"]).toBeGreaterThan(0);
    expect(budgetDelta.primaryDrivers.some((d) => d.toLowerCase().includes("cast"))).toBe(true);
  });
});
