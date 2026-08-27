import { describe, it, expect } from "vitest";
import { ScriptParse } from "../../types/screenplay";
import { BoardPlan } from "../../types/storyboard";
import { buildSchedule } from "../schedule-engine";
import { buildBudget } from "../budget-engine";
import {
  diffScriptParses,
  calculateScheduleDelta,
  calculateBudgetDelta,
  computeInvalidationManifest,
  analyzeScriptRevision,
  pinUnchangedScenes,
} from "../revision-engine";
import { FREQUENCY_ZERO_PARSED } from "../../../fixtures/frequency-zero";

describe("Script Revision & Invalidation Engine", () => {
  const baseScript: ScriptParse = FREQUENCY_ZERO_PARSED;

  describe("diffScriptParses", () => {
    it("identifies identical scripts as 0 delta with all scenes unchanged", () => {
      const diff = diffScriptParses(baseScript, baseScript);
      expect(diff.scenesDiff.length).toBe(baseScript.scenes.length);
      expect(diff.addedSceneIds).toEqual([]);
      expect(diff.removedSceneIds).toEqual([]);
      expect(diff.modifiedSceneIds).toEqual([]);
      expect(diff.unchangedSceneIds.length).toBe(baseScript.scenes.length);
      expect(diff.totalPagesDeltaEighths).toBe(0);
      expect(diff.castChanges.added).toEqual([]);
      expect(diff.castChanges.removed).toEqual([]);
    });

    it("detects modified scene parameters (location, timeOfDay, cast, pageEighths)", () => {
      const revisedScript: ScriptParse = {
        ...baseScript,
        scenes: baseScript.scenes.map((sc) => {
          if (sc.id === 3) {
            return {
              ...sc,
              location: "TRANSMITTER TOWER BASE",
              timeOfDay: "DAY",
              characters: ["JACK", "DEPUTY REYES"],
              pageEighths: 8, // was 4
            };
          }
          return sc;
        }),
      };

      const diff = diffScriptParses(baseScript, revisedScript);
      expect(diff.modifiedSceneIds).toEqual([3]);
      expect(diff.unchangedSceneIds).not.toContain(3);
      expect(diff.totalPagesDeltaEighths).toBe(4);

      const scene3Diff = diff.scenesDiff.find((d) => d.sceneId === 3);
      expect(scene3Diff).toBeDefined();
      expect(scene3Diff?.changeType).toBe("modified");
      expect(scene3Diff?.locationChanged).toBe(true);
      expect(scene3Diff?.timeOfDayChanged).toBe(true);
      expect(scene3Diff?.castAdded).toContain("DEPUTY REYES");
      expect(scene3Diff?.pageEighthsDelta).toBe(4);
    });

    it("detects added and removed scenes", () => {
      const revisedScript: ScriptParse = {
        ...baseScript,
        scenes: [
          ...baseScript.scenes.filter((sc) => sc.id !== 10), // Remove scene 10
          {
            id: 11,
            slugline: "EXT. HIGHWAY CLINIC - DAY",
            intExt: "EXT",
            location: "HIGHWAY CLINIC",
            timeOfDay: "DAY",
            summary: "Jack receives emergency treatment from Dr. Vance.",
            characters: ["JACK", "DR. VANCE"],
            pageEighths: 6,
          },
        ],
      };

      const diff = diffScriptParses(baseScript, revisedScript);
      expect(diff.removedSceneIds).toContain(10);
      expect(diff.addedSceneIds).toContain(11);
      expect(diff.castChanges.added).toContain("DR. VANCE");
    });
  });

  describe("calculateScheduleDelta", () => {
    it("computes accurate shoot days and company move deltas", () => {
      const origSchedule = buildSchedule(baseScript);

      // Revised script with an extra heavy location
      const heavyScript: ScriptParse = {
        ...baseScript,
        scenes: [
          ...baseScript.scenes,
          {
            id: 11,
            slugline: "INT. WAREHOUSE - DAY",
            intExt: "INT",
            location: "WAREHOUSE 9",
            timeOfDay: "DAY",
            summary: "Heavy investigation scene",
            characters: ["JACK", "MAYA"],
            pageEighths: 36, // 1 full day of pages
          },
        ],
      };

      const revSchedule = buildSchedule(heavyScript);
      const delta = calculateScheduleDelta(origSchedule, revSchedule);

      expect(delta.shootDaysDelta).toBe(revSchedule.stats.shootDays - origSchedule.stats.shootDays);
      expect(delta.originalShootDays).toBe(origSchedule.stats.shootDays);
      expect(delta.revisedShootDays).toBe(revSchedule.stats.shootDays);
      expect(delta.impactSummary.length).toBeGreaterThan(0);
    });
  });

  describe("calculateBudgetDelta", () => {
    it("computes line item variances while preserving tracesTo provenance", () => {
      const origSchedule = buildSchedule(baseScript);
      const origBudget = buildBudget(origSchedule);

      // Add high-cost cast member and additional shoot day
      const modifiedScript: ScriptParse = {
        ...baseScript,
        scenes: [
          ...baseScript.scenes,
          {
            id: 11,
            slugline: "EXT. DESERT CRATER - NIGHT",
            intExt: "EXT",
            location: "DESERT CRATER",
            timeOfDay: "NIGHT",
            summary: "Explosion aftermath with Sheriff and SWAT",
            characters: ["JACK", "SHERIFF", "SWAT COMMANDER"],
            pageEighths: 40,
          },
        ],
      };

      const revSchedule = buildSchedule(modifiedScript);
      const revBudget = buildBudget(revSchedule);

      const budgetDelta = calculateBudgetDelta(origBudget, revBudget);

      expect(budgetDelta.grandTotalDelta).toBe(revBudget.summary.grandTotal - origBudget.summary.grandTotal);
      expect(budgetDelta.percentChange).toBeCloseTo(
        ((revBudget.summary.grandTotal - origBudget.summary.grandTotal) / origBudget.summary.grandTotal) * 100,
        1
      );
      expect(budgetDelta.lineItemDiffs.length).toBeGreaterThan(0);

      // Every line item diff must have a non-empty tracesTo string
      for (const item of budgetDelta.lineItemDiffs) {
        expect(item.tracesTo).toBeTruthy();
        expect(typeof item.tracesTo).toBe("string");
      }
    });
  });

  describe("computeInvalidationManifest", () => {
    it("invalidates frames belonging to modified or removed scenes only", () => {
      const fakeBoardPlan: BoardPlan = {
        visualStyleStatement: "Bleak desert neo-noir",
        aspectRatio: "2.39:1",
        frames: [
          {
            sceneId: 1,
            frameId: "1A",
            shotType: "WS",
            movement: "STATIC",
            lensMm: "35mm",
            description: "Wide of booth",
            blocking: "Jack at mic",
            lighting: "Amber desk lamp",
            imagePrompt: "Amber radio booth",
          },
          {
            sceneId: 2,
            frameId: "2A",
            shotType: "CU",
            movement: "PAN",
            lensMm: "50mm",
            description: "Vacuum tube",
            blocking: "Maya wrenching steel",
            lighting: "Violet glow",
            imagePrompt: "Violet tube glowing",
          },
          {
            sceneId: 3,
            frameId: "3A",
            shotType: "WS",
            movement: "STATIC",
            lensMm: "24mm",
            description: "Tower in wind",
            blocking: "Jack holding radio",
            lighting: "Moonlight",
            imagePrompt: "Radio mast under moonlight",
          },
        ],
      };

      const revisedScript: ScriptParse = {
        ...baseScript,
        scenes: baseScript.scenes.map((sc) => (sc.id === 2 ? { ...sc, pageEighths: 16 } : sc)),
      };

      const diff = diffScriptParses(baseScript, revisedScript);
      const manifest = computeInvalidationManifest(diff, fakeBoardPlan);

      expect(manifest.staleSceneIds).toContain(2);
      expect(manifest.staleFrameIds).toContain("2A");
      expect(manifest.reusableFrameIds).toContain("1A");
      expect(manifest.reusableFrameIds).toContain("3A");
      expect(manifest.reasonBySceneId["2"]).toBeDefined();
    });
  });

  describe("analyzeScriptRevision E2E", () => {
    it("produces complete analysis matching RevisionAnalysis schema", () => {
      const origSchedule = buildSchedule(baseScript);
      const origBudget = buildBudget(origSchedule);

      const revisedScript: ScriptParse = {
        ...baseScript,
        scenes: baseScript.scenes.map((sc) => (sc.id === 1 ? { ...sc, location: "MODIFIED BOOTH" } : sc)),
      };
      const revSchedule = buildSchedule(revisedScript);
      const revBudget = buildBudget(revSchedule);

      const analysis = analyzeScriptRevision(
        baseScript,
        revisedScript,
        origSchedule,
        revSchedule,
        origBudget,
        revBudget
      );

      expect(analysis.scriptDiff.modifiedSceneIds).toEqual([1]);
      expect(analysis.scheduleDelta.originalShootDays).toBeGreaterThan(0);
      expect(analysis.budgetDelta.originalGrandTotal).toBeGreaterThan(0);
      expect(analysis.invalidationManifest.staleSceneIds).toEqual([1]);
      expect(analysis.timestamp).toBeTruthy();
    });
  });

  describe("Deterministic Scene Pinning (Verbatim Untouched Scenes)", () => {
    it("pins all untouched scenes verbatim when 1 line of dialogue in Scene 1 is edited", () => {
      const originalText = `TITLE: TEST SCRIPT
SCENE 1
INT. RADIO BOOTH - NIGHT
Jack sits at the mic.
JACK
Hello world.

SCENE 2
INT. TRANSMITTER - NIGHT
Maya works on wires.
MAYA
It is working.
`;

      const revisedText = `TITLE: TEST SCRIPT
SCENE 1
INT. RADIO BOOTH - NIGHT
Jack sits at the mic.
JACK
Hello world revised line.

SCENE 2
INT. TRANSMITTER - NIGHT
Maya works on wires.
MAYA
It is working.
`;

      const originalParse: ScriptParse = {
        title: "TEST SCRIPT",
        format: "short",
        logline: "Test",
        scenes: [
          {
            id: 1,
            slugline: "INT. RADIO BOOTH - NIGHT",
            intExt: "INT",
            location: "RADIO BOOTH",
            timeOfDay: "NIGHT",
            summary: "Jack at mic",
            characters: ["JACK"],
            pageEighths: 4,
          },
          {
            id: 2,
            slugline: "INT. TRANSMITTER - NIGHT",
            intExt: "INT",
            location: "TRANSMITTER",
            timeOfDay: "NIGHT",
            summary: "Maya works",
            characters: ["MAYA"],
            pageEighths: 6,
          },
        ],
      };

      // Simulated re-analyzed parse where an LLM non-deterministically changed Scene 2's page length
      const noisyLLMParse: ScriptParse = {
        title: "TEST SCRIPT",
        format: "short",
        logline: "Test",
        scenes: [
          {
            id: 1,
            slugline: "INT. RADIO BOOTH - NIGHT",
            intExt: "INT",
            location: "RADIO BOOTH",
            timeOfDay: "NIGHT",
            summary: "Jack speaks revised line",
            characters: ["JACK"],
            pageEighths: 4,
          },
          {
            id: 2,
            slugline: "INT. TRANSMITTER - NIGHT",
            intExt: "INT",
            location: "TRANSMITTER ROOM", // LLM drift!
            timeOfDay: "NIGHT",
            summary: "Maya working on wires",
            characters: ["MAYA"],
            pageEighths: 8, // LLM drift (+2 eighths)!
          },
        ],
      };

      const pinning = pinUnchangedScenes(originalText, revisedText, originalParse, undefined, noisyLLMParse, undefined);

      expect(pinning.pinnedSceneIds).toEqual([2]);
      expect(pinning.editedSceneIds).toEqual([1]);

      // Scene 2 MUST be pinned verbatim to originalParse (pageEighths: 6, location: 'RADIO BOOTH' untouched), ignoring LLM noise
      const pinnedScene2 = pinning.pinnedParse.scenes.find((s) => s.id === 2);
      expect(pinnedScene2?.pageEighths).toBe(6);
      expect(pinnedScene2?.location).toBe("TRANSMITTER");

      // Running diff must show Scene 2 as unchanged with 0 delta
      const diff = diffScriptParses(originalParse, pinning.pinnedParse);
      expect(diff.modifiedSceneIds).toEqual([1]);
      expect(diff.unchangedSceneIds).toEqual([2]);
      expect(diff.totalPagesDeltaEighths).toBe(0);
    });

    it("empirically proves: 1 single dialogue line changed in FREQUENCY ZERO Scene 1 results in ONLY Scene 1 diff with 0 phantom deltas across Scenes 2-10", () => {
      const origScriptText = FREQUENCY_ZERO_PARSED.scenes.map((s) => `SCENE ${s.id}\n${s.slugline}\n${s.summary}`).join("\n\n");
      
      // Revise ONLY Scene 1's dialogue/summary text
      const revisedScriptText = FREQUENCY_ZERO_PARSED.scenes
        .map((s) => {
          if (s.id === 1) {
            return `SCENE 1\n${s.slugline}\nDJ Jack Mercer speaks a modified broadcast opening greeting into the ribbon mic.`;
          }
          return `SCENE ${s.id}\n${s.slugline}\n${s.summary}`;
        })
        .join("\n\n");

      // Simulated noisy LLM parse where untouched scenes 3, 5, 8 had hallucinations
      const noisyLLMParse: ScriptParse = {
        ...FREQUENCY_ZERO_PARSED,
        scenes: FREQUENCY_ZERO_PARSED.scenes.map((s) => {
          if (s.id === 1) {
            return { ...s, summary: "DJ Jack Mercer speaks a modified broadcast opening greeting into the ribbon mic." };
          }
          if (s.id === 3) {
            return { ...s, location: "HALLUCINATED TOWER BASE", pageEighths: 99 }; // LLM drift!
          }
          return s;
        }),
      };

      const origSchedule = buildSchedule(FREQUENCY_ZERO_PARSED);
      const origBudget = buildBudget(origSchedule);

      const pinning = pinUnchangedScenes(origScriptText, revisedScriptText, FREQUENCY_ZERO_PARSED, undefined, noisyLLMParse, undefined);

      // Pinned scenes must include 2, 3, 4, 5, 6, 7, 8, 9, 10
      expect(pinning.pinnedSceneIds).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(pinning.editedSceneIds).toEqual([1]);

      const revSchedule = buildSchedule(pinning.pinnedParse);
      const revBudget = buildBudget(revSchedule);

      const analysis = analyzeScriptRevision(
        FREQUENCY_ZERO_PARSED,
        pinning.pinnedParse,
        origSchedule,
        revSchedule,
        origBudget,
        revBudget
      );

      // Verify diff has ONLY Scene 1 modified
      expect(analysis.scriptDiff.modifiedSceneIds).toEqual([1]);
      expect(analysis.scriptDiff.unchangedSceneIds).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(analysis.scriptDiff.addedSceneIds).toEqual([]);
      expect(analysis.scriptDiff.removedSceneIds).toEqual([]);
      expect(analysis.scriptDiff.totalPagesDeltaEighths).toBe(0);

      // Schedule and budget must show 0 deltas
      expect(analysis.scheduleDelta.shootDaysDelta).toBe(0);
      expect(analysis.scheduleDelta.companyMovesDelta).toBe(0);
      expect(analysis.budgetDelta.grandTotalDelta).toBe(0);
      expect(analysis.budgetDelta.percentChange).toBe(0);
    });
  });
});
