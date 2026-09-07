import { DirectorOrchestrator } from "../../src/lib/agents/director";
import {
  SCRIPT_THE_APPRAISAL,
  SCRIPT_BLACKWOOD_POND,
  SCRIPT_THE_LOST_ERRAND,
  SCRIPT_THE_GLASSBLOWER,
  SCRIPT_RED_LINE_METRO,
} from "./screenplays";
import { RunState } from "../../src/lib/types/events";

export interface PersonaAEvalResult {
  scriptKey: string;
  title: string;
  durationMs: number;
  modelsUsed: string[];
  coverageEvaluation: {
    verdict: string;
    verdictRationale: string;
    pullQuote: string;
    scores: Record<string, number>;
    comparables: Array<{ title: string; year?: number | null; why: string }>;
    isSpecific: boolean;
    critique: string;
  };
  breakdownEvaluation: {
    sceneCount: number;
    hallucinatedElements: string[];
    missedElements: string[];
    accuracyNotes: string[];
  };
  storyboardEvaluation: {
    frameCount: number;
    visualStyleStatement: string;
    aspectRatio: string;
    cinematographicSense: boolean;
    sampleShots: Array<{ frameId: string; shotType: string; lensMm: string; movement: string; lighting: string }>;
  };
  budgetScheduleEvaluation: {
    shootDays: number;
    nightShoots: number;
    grandTotal: number;
    conditionalCrewBooked: string[];
    conditionalCrewAccurate: boolean;
    notes: string[];
  };
  findings: Array<{
    id: string;
    severity: "BLOCKER" | "MAJOR" | "MINOR" | "POLISH";
    title: string;
    description: string;
    evidence: string;
  }>;
}

export async function runPersonaAScreenwriter(): Promise<Record<string, PersonaAEvalResult>> {
  const scripts: Record<string, { name: string; text: string; expectedNoStunts?: boolean; expectedNight?: boolean }> = {
    appraisal: { name: "THE APPRAISAL", text: SCRIPT_THE_APPRAISAL, expectedNoStunts: true },
    blackwood: { name: "BLACKWOOD POND", text: SCRIPT_BLACKWOOD_POND, expectedNight: true },
    lost_errand: { name: "THE LOST ERRAND", text: SCRIPT_THE_LOST_ERRAND },
    glassblower: { name: "THE GLASSBLOWER", text: SCRIPT_THE_GLASSBLOWER, expectedNoStunts: true },
    red_line: { name: "RED LINE METRO", text: SCRIPT_RED_LINE_METRO, expectedNight: true },
  };

  const results: Record<string, PersonaAEvalResult> = {};

  for (const [key, scriptInfo] of Object.entries(scripts)) {
    console.log(`\n======================================================`);
    console.log(`[PERSONA A: THE SCREENWRITER] Running script: ${scriptInfo.name}`);
    console.log(`======================================================`);

    const director = new DirectorOrchestrator();
    const eventLogs: string[] = [];

    const runState: RunState = await director.executeRun(scriptInfo.text, {
      enableImages: false, // Zero-quota routine run cap per cost controls
      onEvent: (event) => {
        if (event.type === "agent_log") {
          eventLogs.push(`[${event.agent.toUpperCase()}][${event.level}] ${event.message}`);
        }
      },
    });

    // 1. Evaluate Coverage
    const coverage = runState.coverage!;
    const parse = runState.scriptParse!;
    const breakdown = runState.breakdown!;
    const schedule = runState.schedule!;
    const budget = runState.budget!;
    const board = runState.boardPlan!;

    const findings: PersonaAEvalResult["findings"] = [];

    // Evaluate coverage specificity
    const isSpecific =
      coverage.logline.toLowerCase().includes(parse.title.toLowerCase().split(" ")[0]) ||
      coverage.synopsis.length > 50;
    
    // Check comparables
    const comparablesValid = coverage.comparables.every((c) => c.title && c.why && c.why.length > 10);
    if (!comparablesValid) {
      findings.push({
        id: `FIND-${key.toUpperCase()}-COMP-01`,
        severity: "MINOR",
        title: "Comparables lack rich grounding",
        description: "One or more comparables returned without complete explanation.",
        evidence: JSON.stringify(coverage.comparables),
      });
    }

    // 2. Evaluate 13-Element Breakdown
    const hallucinatedElements: string[] = [];
    const missedElements: string[] = [];
    const accuracyNotes: string[] = [];

    if (scriptInfo.expectedNoStunts) {
      const anyStunts = breakdown.breakdowns.filter((b) => b.stunts.length > 0);
      if (anyStunts.length > 0) {
        const msg = `Drama/Visual script '${scriptInfo.name}' hallucinated stunts in scene(s): ${anyStunts.map((s) => s.sceneId).join(", ")}: ${JSON.stringify(anyStunts.map((s) => s.stunts))}`;
        hallucinatedElements.push(msg);
        findings.push({
          id: `FIND-${key.toUpperCase()}-STUNT-HALLUCINATION`,
          severity: "MAJOR",
          title: "Hallucinated Stunts in Zero-Action Script",
          description: `Slate booked stunts in a script with zero action or stunt beats.`,
          evidence: msg,
        });
      }
    }

    // 3. Evaluate Storyboard
    const sampleShots = board.frames.map((f) => ({
      frameId: f.frameId,
      shotType: f.shotType,
      lensMm: f.lensMm,
      movement: f.movement,
      lighting: f.lighting,
    }));

    // 4. Evaluate Budget & Conditional Crew
    const crewSection = budget.sections.find((s) => s.category === "Crew")!;
    const conditionalCrewItems = crewSection.items.filter((i) =>
      ["Stunt Coordinator", "Practical SFX Technician", "Animal Wrangler", "Key Hair & Makeup Artist"].includes(i.item)
    );
    const conditionalCrewBooked = conditionalCrewItems.map((i) => `${i.item} (${i.qty} day(s))`);

    let conditionalCrewAccurate = true;
    if (scriptInfo.expectedNoStunts && conditionalCrewItems.some((i) => i.item === "Stunt Coordinator")) {
      conditionalCrewAccurate = false;
      findings.push({
        id: `FIND-${key.toUpperCase()}-CREW-ERR`,
        severity: "MAJOR",
        title: "Unjustified Stunt Coordinator Booked in Budget",
        description: "Budget ledger includes Stunt Coordinator line item for a script with no stunt elements.",
        evidence: JSON.stringify(conditionalCrewItems),
      });
    }

    results[key] = {
      scriptKey: key,
      title: parse.title,
      durationMs: 0,
      modelsUsed: runState.modelsUsed || [],
      coverageEvaluation: {
        verdict: coverage.verdict,
        verdictRationale: coverage.verdictRationale,
        pullQuote: coverage.pullQuote,
        scores: coverage.scores,
        comparables: coverage.comparables,
        isSpecific,
        critique: `${coverage.verdict} (${coverage.scores.premise}/10 Premise, ${coverage.scores.character}/10 Character) — "${coverage.pullQuote}"`,
      },
      breakdownEvaluation: {
        sceneCount: breakdown.breakdowns.length,
        hallucinatedElements,
        missedElements,
        accuracyNotes,
      },
      storyboardEvaluation: {
        frameCount: board.frames.length,
        visualStyleStatement: board.visualStyleStatement,
        aspectRatio: board.aspectRatio,
        cinematographicSense: board.frames.length >= 4,
        sampleShots,
      },
      budgetScheduleEvaluation: {
        shootDays: schedule.stats.shootDays,
        nightShoots: schedule.stats.nightShoots,
        grandTotal: budget.summary.grandTotal,
        conditionalCrewBooked,
        conditionalCrewAccurate,
        notes: [
          `Scheduled across ${schedule.stats.shootDays} day(s) (${schedule.stats.nightShoots} night), Grand Total: $${budget.summary.grandTotal.toLocaleString()}`,
        ],
      },
      findings,
    };

    console.log(`[PERSONA A] Complete for ${scriptInfo.name}: Verdict=${coverage.verdict}, ShootDays=${schedule.stats.shootDays}, Budget=$${budget.summary.grandTotal.toLocaleString()}, Findings=${findings.length}`);
  }

  return results;
}

if (process.argv[1]?.endsWith("persona-a-screenwriter.ts")) {
  runPersonaAScreenwriter()
    .then((res) => {
      console.log("\n=== ALL PERSONA A RESULTS ===");
      console.log(JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error("Persona A Error:", err);
      process.exit(1);
    });
}
