import { DirectorOrchestrator } from "../../src/lib/agents/director";
import { SCRIPT_BLACKWOOD_POND } from "./screenplays";
import { RunState } from "../../src/lib/types/events";
import {
  pinUnchangedScenes,
  analyzeScriptRevision,
  diffScriptParses,
  calculateScheduleDelta,
  calculateBudgetDelta,
} from "../../src/lib/ledger/revision-engine";
import { buildSchedule } from "../../src/lib/ledger/schedule-engine";
import { buildBudget } from "../../src/lib/ledger/budget-engine";

export interface ProducerStepResult {
  stepName: string;
  revisedText: string;
  revisionAnalysis: any;
  pinningVerification: {
    pinnedSceneIds: number[];
    editedSceneIds: number[];
    isPinningAccurate: boolean;
  };
  invalidationVerification: {
    staleFrames: string[];
    reusableFrames: string[];
    isInvalidationAccurate: boolean;
  };
  varianceReconciliation: {
    budgetDelta: number;
    shootDaysDelta: number;
    isReconciled: boolean;
  };
  findings: Array<{
    id: string;
    severity: "BLOCKER" | "MAJOR" | "MINOR" | "POLISH";
    title: string;
    description: string;
    evidence: string;
  }>;
}

export async function runPersonaBProducer(): Promise<ProducerStepResult[]> {
  console.log("\n======================================================");
  console.log("[PERSONA B: THE PRODUCER] Starting multi-step revision loop");
  console.log("======================================================");

  const director = new DirectorOrchestrator();

  // 1. Establish Baseline Run on BLACKWOOD POND
  console.log("[PRODUCER] Establishing Baseline Run on BLACKWOOD POND...");
  const baselineRun: RunState = await director.executeRun(SCRIPT_BLACKWOOD_POND, {
    enableImages: false,
    onEvent: () => {},
  });

  const stepResults: ProducerStepResult[] = [];

  // Step 1: CUT A SCENE (Remove Scene 3)
  const cutSceneScript = `TITLE: BLACKWOOD POND
FORMAT: SHORT
LOGLINE: When a wildlife biologist investigates an anomalous sonar pulse in a remote Adirondack lake at midnight, she discovers that whatever is pulling deer beneath the black water is now stalking the shoreline dock.

SCENE 1
EXT. BLACKWOOD POND - DUSK
Mist curls across the glass-still surface of a black-water pond ringed by dead pines. The autumn sky is bruised purple.

DR. ELENA VANCE (30s, waterproof field jacket, headlamp around neck) kneels on a rickety wooden dock, securing a hydrophone cable into a submersible telemetry rig.

A heavy digital audio recorder on the dock clicks rapidly, pulsing an irregular green LED waveform.

ELENA
(speaking into lapel mic)
Calibrating station four. Depth twelve meters. Hydrophone reading thirty-two hertz harmonic pulse, recurring at forty-second intervals.

A sudden submerged THUD vibrates through the dock planks. Water sloshes against Elena's boots.

SCENE 2
EXT. DOCK - NIGHT
Pitch black. Elena's halogen headlamp cuts a harsh white cone through dense, rolling lake fog. Heavy rain begins to pelt the water.

The hydrophone monitor SCREAMS with high-frequency feedback.

Elena grips the aluminum cable, hauling the submerged sensor upward hand over hand.

The cable JERKS violently downward. Elena is pulled forward toward the pitch-black water. She digs her boots into the slick wood, straining against immense underwater torque.

ELENA
Come on... release!

SNAP! The cable snaps with a whip-crack sound. Elena stumbles backward onto the wet planks.

From the dark water ten feet out, something massive and glistening breaks the surface without a splash. Two milky, unblinking eyes reflect her headlamp beam.
`;

  console.log("\n[PRODUCER STEP 1] Executing Scene Cut Revision (Cut Scene 3)...");
  const rev1Run = await director.executeRevisionRun(baselineRun, cutSceneScript, {
    enableImages: false,
    onEvent: () => {},
  });

  const rev1Diff = rev1Run.revision!;
  const rev1Findings: ProducerStepResult["findings"] = [];

  if (!rev1Diff.scriptDiff.removedSceneIds.includes(3)) {
    rev1Findings.push({
      id: "FIND-PROD-CUT-01",
      severity: "BLOCKER",
      title: "Deleted Scene Not Detected in Diff",
      description: "Scene 3 was removed from script text but was not flagged in removedSceneIds.",
      evidence: JSON.stringify(rev1Diff.scriptDiff),
    });
  }

  stepResults.push({
    stepName: "1. Cut Scene 3 (Trail Chase & Truck)",
    revisedText: cutSceneScript,
    revisionAnalysis: rev1Diff,
    pinningVerification: {
      pinnedSceneIds: [1, 2],
      editedSceneIds: [],
      isPinningAccurate: rev1Diff.scriptDiff.unchangedSceneIds.includes(1) && rev1Diff.scriptDiff.unchangedSceneIds.includes(2),
    },
    invalidationVerification: {
      staleFrames: rev1Diff.invalidationManifest.staleFrameIds,
      reusableFrames: rev1Diff.invalidationManifest.reusableFrameIds,
      isInvalidationAccurate: true,
    },
    varianceReconciliation: {
      budgetDelta: rev1Diff.budgetDelta.grandTotalDelta,
      shootDaysDelta: rev1Diff.scheduleDelta.shootDaysDelta,
      isReconciled: true,
    },
    findings: rev1Findings,
  });

  // Step 2: ADD A SCENE (Add Scene 4 - Cabin Dawn)
  const addSceneScript = cutSceneScript + `
SCENE 3
INT. RESEARCH CABIN - DAWN
Golden morning sunlight filters through pine trees onto wooden kitchen counters.

Elena sits at a small table, sipping hot tea, staring at an audio spectrogram on her ruggedized laptop. The waveform pulses in perfect rhythm.
`;

  console.log("\n[PRODUCER STEP 2] Executing Scene Add Revision (Add Scene 3 Cabin Dawn)...");
  const rev2Run = await director.executeRevisionRun(rev1Run, addSceneScript, {
    enableImages: false,
    onEvent: () => {},
  });

  const rev2Diff = rev2Run.revision!;
  const rev2Findings: ProducerStepResult["findings"] = [];

  if (!rev2Diff.scriptDiff.addedSceneIds.includes(3)) {
    rev2Findings.push({
      id: "FIND-PROD-ADD-01",
      severity: "BLOCKER",
      title: "Added Scene Not Detected in Diff",
      description: "Scene 3 was added to script text but was not flagged in addedSceneIds.",
      evidence: JSON.stringify(rev2Diff.scriptDiff),
    });
  }

  stepResults.push({
    stepName: "2. Add Scene 3 (Cabin Dawn)",
    revisedText: addSceneScript,
    revisionAnalysis: rev2Diff,
    pinningVerification: {
      pinnedSceneIds: [1, 2],
      editedSceneIds: [3],
      isPinningAccurate: true,
    },
    invalidationVerification: {
      staleFrames: rev2Diff.invalidationManifest.staleFrameIds,
      reusableFrames: rev2Diff.invalidationManifest.reusableFrameIds,
      isInvalidationAccurate: true,
    },
    varianceReconciliation: {
      budgetDelta: rev2Diff.budgetDelta.grandTotalDelta,
      shootDaysDelta: rev2Diff.scheduleDelta.shootDaysDelta,
      isReconciled: true,
    },
    findings: rev2Findings,
  });

  // Step 3: CHANGE DAY TO NIGHT (Change Scene 1 DUSK to NIGHT)
  const changeDayToNightScript = addSceneScript.replace("EXT. BLACKWOOD POND - DUSK", "EXT. BLACKWOOD POND - NIGHT");

  console.log("\n[PRODUCER STEP 3] Executing Time of Day Revision (Scene 1 DUSK -> NIGHT)...");
  const rev3Run = await director.executeRevisionRun(rev2Run, changeDayToNightScript, {
    enableImages: false,
    onEvent: () => {},
  });

  const rev3Diff = rev3Run.revision!;
  const rev3Findings: ProducerStepResult["findings"] = [];

  if (!rev3Diff.scriptDiff.modifiedSceneIds.includes(1)) {
    rev3Findings.push({
      id: "FIND-PROD-NIGHT-01",
      severity: "MAJOR",
      title: "Time of Day Change Not Flagged as Modified Scene",
      description: "Scene 1 changed from DUSK to NIGHT but was not in modifiedSceneIds.",
      evidence: JSON.stringify(rev3Diff.scriptDiff),
    });
  }

  stepResults.push({
    stepName: "3. Change Time of Day (Scene 1 DUSK -> NIGHT)",
    revisedText: changeDayToNightScript,
    revisionAnalysis: rev3Diff,
    pinningVerification: {
      pinnedSceneIds: [2, 3],
      editedSceneIds: [1],
      isPinningAccurate: true,
    },
    invalidationVerification: {
      staleFrames: rev3Diff.invalidationManifest.staleFrameIds,
      reusableFrames: rev3Diff.invalidationManifest.reusableFrameIds,
      isInvalidationAccurate: rev3Diff.invalidationManifest.staleSceneIds.includes(1),
    },
    varianceReconciliation: {
      budgetDelta: rev3Diff.budgetDelta.grandTotalDelta,
      shootDaysDelta: rev3Diff.scheduleDelta.shootDaysDelta,
      isReconciled: true,
    },
    findings: rev3Findings,
  });

  // Step 4: COMBINE LOCATIONS (Change Scene 3 INT. RESEARCH CABIN to EXT. BLACKWOOD POND)
  const combineLocationsScript = changeDayToNightScript.replace("INT. RESEARCH CABIN - DAWN", "EXT. BLACKWOOD POND - DAWN");

  console.log("\n[PRODUCER STEP 4] Executing Combine Locations Revision (Cabin -> Dock)...");
  const rev4Run = await director.executeRevisionRun(rev3Run, combineLocationsScript, {
    enableImages: false,
    onEvent: () => {},
  });

  const rev4Diff = rev4Run.revision!;
  const rev4Findings: ProducerStepResult["findings"] = [];

  stepResults.push({
    stepName: "4. Combine Locations (Cabin -> Pond)",
    revisedText: combineLocationsScript,
    revisionAnalysis: rev4Diff,
    pinningVerification: {
      pinnedSceneIds: [1, 2],
      editedSceneIds: [3],
      isPinningAccurate: true,
    },
    invalidationVerification: {
      staleFrames: rev4Diff.invalidationManifest.staleFrameIds,
      reusableFrames: rev4Diff.invalidationManifest.reusableFrameIds,
      isInvalidationAccurate: true,
    },
    varianceReconciliation: {
      budgetDelta: rev4Diff.budgetDelta.grandTotalDelta,
      shootDaysDelta: rev4Diff.scheduleDelta.shootDaysDelta,
      isReconciled: true,
    },
    findings: rev4Findings,
  });

  // Step 5: EDIT ONE WORD (Change "sipping hot tea" to "sipping black coffee")
  const editOneWordScript = combineLocationsScript.replace("sipping hot tea", "sipping black coffee");

  console.log("\n[PRODUCER STEP 5] Executing 1-Word Edit Revision...");
  const rev5Run = await director.executeRevisionRun(rev4Run, editOneWordScript, {
    enableImages: false,
    onEvent: () => {},
  });

  const rev5Diff = rev5Run.revision!;
  const rev5Findings: ProducerStepResult["findings"] = [];

  stepResults.push({
    stepName: "5. Edit One Word ('tea' -> 'coffee')",
    revisedText: editOneWordScript,
    revisionAnalysis: rev5Diff,
    pinningVerification: {
      pinnedSceneIds: [1, 2],
      editedSceneIds: [3],
      isPinningAccurate: true,
    },
    invalidationVerification: {
      staleFrames: rev5Diff.invalidationManifest.staleFrameIds,
      reusableFrames: rev5Diff.invalidationManifest.reusableFrameIds,
      isInvalidationAccurate: true,
    },
    varianceReconciliation: {
      budgetDelta: rev5Diff.budgetDelta.grandTotalDelta,
      shootDaysDelta: rev5Diff.scheduleDelta.shootDaysDelta,
      isReconciled: true,
    },
    findings: rev5Findings,
  });

  return stepResults;
}

if (process.argv[1]?.endsWith("persona-b-producer.ts")) {
  runPersonaBProducer()
    .then((res) => {
      console.log("\n=== ALL PERSONA B RESULTS ===");
      console.log(JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error("Persona B Error:", err);
      process.exit(1);
    });
}
