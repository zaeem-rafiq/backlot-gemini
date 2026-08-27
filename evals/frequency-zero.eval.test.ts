import { describe, it, expect, beforeAll } from "vitest";
import { InkAgent } from "../src/lib/agents/ink";
import { SlateAgent } from "../src/lib/agents/slate";
import { FREQUENCY_ZERO_SCRIPT } from "../src/fixtures/frequency-zero";
import { ScriptBreakdown } from "../src/lib/types/breakdown";
import { Coverage } from "../src/lib/types/coverage";
import { ScriptParse } from "../src/lib/types/screenplay";

/**
 * Model Evaluation Suite for FREQUENCY ZERO
 * Tests domain judgment assertions against live Google Gemini model outputs.
 * Kept separate from deterministic unit tests to protect fast, zero-quota CI runs.
 */
describe("FREQUENCY ZERO — Domain Judgment Evals", () => {
  let parsedScript: ScriptParse;
  let breakdown: ScriptBreakdown;
  let coverage: Coverage;

  beforeAll(async () => {
    const ink = new InkAgent();
    const slate = new SlateAgent();

    const parseRes = await ink.parseScript(FREQUENCY_ZERO_SCRIPT);
    parsedScript = parseRes.scriptParse;

    const [covRes, bdRes] = await Promise.all([
      ink.generateCoverage(parsedScript, FREQUENCY_ZERO_SCRIPT),
      slate.breakdownScript(parsedScript, FREQUENCY_ZERO_SCRIPT),
    ]);

    coverage = covRes.coverage;
    breakdown = bdRes.scriptBreakdown;
  }, 120000);

  it("evaluates Slate correctly flags the physical stunt in Scene 8", () => {
    const scene8 = breakdown.breakdowns.find((b) => b.sceneId === 8);
    expect(scene8).toBeDefined();
    expect(scene8!.stunts.length).toBeGreaterThan(0);
    expect(
      scene8!.stunts.some(
        (s) =>
          s.toLowerCase().includes("dive") ||
          s.toLowerCase().includes("fall") ||
          s.toLowerCase().includes("guardrail") ||
          s.toLowerCase().includes("jump") ||
          s.toLowerCase().includes("slide") ||
          s.toLowerCase().includes("stunt")
      )
    ).toBe(true);
  });

  it("evaluates Slate flags practical SFX in Scene 2 and/or Scene 8", () => {
    const sfxScenes = breakdown.breakdowns.filter((b) => b.sfx.length > 0);
    expect(sfxScenes.length).toBeGreaterThanOrEqual(1);
    const scene2Or8 = breakdown.breakdowns.filter((b) => b.sceneId === 2 || b.sceneId === 8);
    const hasSfx = scene2Or8.some((b) =>
      b.sfx.some(
        (s) =>
          s.toLowerCase().includes("spark") ||
          s.toLowerCase().includes("smoke") ||
          s.toLowerCase().includes("rain") ||
          s.toLowerCase().includes("weather") ||
          s.toLowerCase().includes("water") ||
          s.toLowerCase().includes("storm") ||
          s.toLowerCase().includes("fire")
      )
    );
    expect(hasSfx).toBe(true);
  });

  it("evaluates Slate flags special HMU requirement in Scene 8", () => {
    const scene8 = breakdown.breakdowns.find((b) => b.sceneId === 8);
    expect(scene8).toBeDefined();
    expect(scene8!.makeupHair.length).toBeGreaterThan(0);
    expect(
      scene8!.makeupHair.some(
        (m) =>
          m.toLowerCase().includes("gash") ||
          m.toLowerCase().includes("blood") ||
          m.toLowerCase().includes("wound") ||
          m.toLowerCase().includes("cut") ||
          m.toLowerCase().includes("sweat") ||
          m.toLowerCase().includes("wet") ||
          m.toLowerCase().includes("injury") ||
          m.toLowerCase().includes("bruise")
      )
    ).toBe(true);
  });

  it("evaluates complexity hierarchy: Scene 8 (night storm stunt) > Scene 1 (booth dialogue)", () => {
    const scene1 = breakdown.breakdowns.find((b) => b.sceneId === 1)!;
    const scene8 = breakdown.breakdowns.find((b) => b.sceneId === 8)!;

    expect(scene8).toBeDefined();
    expect(scene1).toBeDefined();
    expect(scene8.complexity).toBeGreaterThanOrEqual(3);
    expect(scene1.complexity).toBeLessThanOrEqual(3);
    expect(scene8.complexity).toBeGreaterThan(scene1.complexity);
  });

  it("evaluates Ink coverage verdict and calibrated scores", () => {
    expect(["RECOMMEND", "CONSIDER"]).toContain(coverage.verdict);
    expect(coverage.scores.premise).toBeGreaterThanOrEqual(7);
    expect(coverage.scores.structure).toBeGreaterThanOrEqual(7);
    expect(coverage.verdictRationale.length).toBeGreaterThan(20);
    expect(coverage.pullQuote.length).toBeGreaterThan(10);
  });
});
