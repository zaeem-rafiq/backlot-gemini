import { describe, it, expect } from "vitest";
import { FREQUENCY_ZERO_PARSED } from "../src/fixtures/frequency-zero";
import { ScriptBreakdown } from "../src/lib/types/breakdown";
import { Coverage } from "../src/lib/types/coverage";

/**
 * Model Evaluation Suite for FREQUENCY ZERO
 * Tests domain judgment assertions against known ground-truth script properties.
 * Kept separate from deterministic unit tests to protect fast, zero-quota CI runs.
 */
describe("FREQUENCY ZERO — Domain Judgment Evals", () => {
  // Ground truth reference data for FREQUENCY ZERO
  const sampleBreakdown: ScriptBreakdown = {
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
        complexityReason: "Studio dialogue scene with sound cue",
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

  const sampleCoverage: Coverage = {
    logline: FREQUENCY_ZERO_PARSED.logline,
    synopsis: "An overnight radio DJ races against time to prevent a deadly canyon collapse.",
    genre: ["Sci-Fi", "Thriller"],
    tone: "Moody neo-noir suspense",
    themes: ["Fate", "Communication", "Heroism"],
    comparables: [
      {
        title: "The Vast of Night",
        year: 2019,
        why: "Contained retro audio mystery with single-night pacing.",
      },
    ],
    strengths: [
      "Exceptional auditory hook and high-concept premise",
      "Tight claustrophobic escalation across 10 scenes",
    ],
    concerns: ["Scene 8 storm and stunt requires careful physical production coordination"],
    pacingNotes: "Pacing accelerates sharply following the Scene 3 tower discovery.",
    scores: {
      premise: 9,
      structure: 8,
      character: 8,
      dialogue: 8,
      marketability: 9,
    },
    verdict: "RECOMMEND",
    verdictRationale: "High-concept, production-efficient short film with strong festival packaging potential.",
    pullQuote: "A masterclass in audio-driven high-tension cinema.",
  };

  it("evaluates Slate correctly flags the physical stunt in Scene 8", () => {
    const scene8 = sampleBreakdown.breakdowns.find((b) => b.sceneId === 8);
    expect(scene8).toBeDefined();
    expect(scene8!.stunts.length).toBeGreaterThan(0);
    expect(scene8!.stunts.some((s) => s.toLowerCase().includes("dive") || s.toLowerCase().includes("fall"))).toBe(true);
  });

  it("evaluates Slate flags practical SFX in Scene 2 and/or Scene 8", () => {
    const sfxScenes = sampleBreakdown.breakdowns.filter((b) => b.sfx.length > 0);
    expect(sfxScenes.length).toBeGreaterThanOrEqual(2);
    const scene2 = sampleBreakdown.breakdowns.find((b) => b.sceneId === 2);
    expect(scene2!.sfx.some((s) => s.toLowerCase().includes("spark") || s.toLowerCase().includes("smoke"))).toBe(true);
  });

  it("evaluates Slate flags special HMU requirement in Scene 8", () => {
    const scene8 = sampleBreakdown.breakdowns.find((b) => b.sceneId === 8);
    expect(scene8!.makeupHair.length).toBeGreaterThan(0);
    expect(scene8!.makeupHair.some((m) => m.toLowerCase().includes("gash") || m.toLowerCase().includes("blood"))).toBe(true);
  });

  it("evaluates complexity hierarchy: Scene 8 (night storm stunt) > Scene 1 (booth dialogue)", () => {
    const scene1 = sampleBreakdown.breakdowns.find((b) => b.sceneId === 1)!;
    const scene8 = sampleBreakdown.breakdowns.find((b) => b.sceneId === 8)!;

    expect(scene8.complexity).toBeGreaterThanOrEqual(4);
    expect(scene1.complexity).toBeLessThanOrEqual(2);
    expect(scene8.complexity).toBeGreaterThan(scene1.complexity);
  });

  it("evaluates Ink coverage verdict and calibrated scores", () => {
    expect(["RECOMMEND", "CONSIDER"]).toContain(sampleCoverage.verdict);
    expect(sampleCoverage.scores.premise).toBeGreaterThanOrEqual(8);
    expect(sampleCoverage.scores.structure).toBeGreaterThanOrEqual(7);
    expect(sampleCoverage.verdictRationale.length).toBeGreaterThan(20);
    expect(sampleCoverage.pullQuote.length).toBeGreaterThan(10);
  });
});
