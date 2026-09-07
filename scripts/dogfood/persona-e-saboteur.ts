import { DirectorOrchestrator } from "../../src/lib/agents/director";
import { InkAgent } from "../../src/lib/agents/ink";
import { SlateAgent } from "../../src/lib/agents/slate";
import { buildSchedule } from "../../src/lib/ledger/schedule-engine";
import { buildBudget } from "../../src/lib/ledger/budget-engine";

export interface SaboteurTestResult {
  testId: string;
  testName: string;
  inputDescription: string;
  handledGracefully: boolean;
  httpOrExceptionMessage?: string;
  durationMs: number;
  findings: Array<{
    id: string;
    severity: "BLOCKER" | "MAJOR" | "MINOR" | "POLISH";
    title: string;
    description: string;
    evidence: string;
  }>;
}

export async function runPersonAESaboteur(): Promise<SaboteurTestResult[]> {
  console.log("\n======================================================");
  console.log("[PERSONA E: THE SABOTEUR] Running Hostile Input Battery");
  console.log("======================================================");

  const results: SaboteurTestResult[] = [];

  // TEST 1: Contradictory Screenplay (Slugline: Desert Noon, Action: Midnight underwater cavern; Dead character speaks in next scene)
  console.log("\n[SABOTEUR TEST 1] Contradictory screenplay...");
  const contradictoryScript = `TITLE: PARADOX PROTOCOL
FORMAT: SHORT
LOGLINE: A paradoxical temporal anomaly causes conflicting physical realities across adjacent scenes.

SCENE 1
EXT. SAHARA DESERT - NOON
Blinding sunlight beats down on golden sand dunes at 120 degrees Fahrenheit.

COMMANDER STONE (50s) takes a sip from his canteen. Suddenly, a subterranean explosion vaporizes him completely into thin air. Stone is DEAD.

SCENE 2
INT. SUBMERGED ICE CAVE - MIDNIGHT
Pitch black. Below freezing. Water drips from icicles onto frozen bedrock.

COMMANDER STONE walks in casually, wiping dust off his sunglasses, whistling a tune.

STONE
Hot day out there, isn't it?
`;

  const t0 = Date.now();
  try {
    const director = new DirectorOrchestrator();
    const runState = await director.executeRun(contradictoryScript, {
      enableImages: false,
      onEvent: () => {},
    });
    const duration = Date.now() - t0;
    console.log(`[TEST 1] Handled contradictory screenplay in ${duration}ms. Parsed ${runState.scriptParse?.scenes.length} scenes.`);
    results.push({
      testId: "SAB-01-CONTRADICTION",
      testName: "Contradictory Screenplay Reality",
      inputDescription: "Desert Noon vs Ice Cave Midnight, dead character resurfaces",
      handledGracefully: Boolean(runState.scriptParse && runState.budget),
      durationMs: duration,
      findings: [],
    });
  } catch (err: any) {
    results.push({
      testId: "SAB-01-CONTRADICTION",
      testName: "Contradictory Screenplay Reality",
      inputDescription: "Desert Noon vs Ice Cave Midnight, dead character resurfaces",
      handledGracefully: false,
      httpOrExceptionMessage: String(err),
      durationMs: Date.now() - t0,
      findings: [
        {
          id: "FIND-SAB-01-ERR",
          severity: "MAJOR",
          title: "Contradictory Script Failed Pipeline",
          description: `Pipeline crashed on contradictory screenplay: ${String(err)}`,
          evidence: String(err),
        },
      ],
    });
  }

  // TEST 2: 10,000-word massive single scene
  console.log("\n[SABOTEUR TEST 2] 10,000-word single scene boundary test...");
  const paragraph = "Marcus inspects the ancient rusted machinery, tracing each copper gear with meticulous care as grease stains his worn canvas gloves. ";
  const massiveBody = paragraph.repeat(400); // ~5,000 words / dense text
  const massiveSceneScript = `TITLE: THE LONG MONOLOGUE
FORMAT: SHORT
LOGLINE: An exhaustive single-scene character study inside an abandoned turbine station.

SCENE 1
INT. DECOMMISSIONED TURBINE STATION - NIGHT
${massiveBody}

MARCUS
(whispering to the empty room)
The pressure is holding.
`;

  const t1 = Date.now();
  try {
    const ink = new InkAgent();
    const parseRes = await ink.parseScript(massiveSceneScript);
    const duration = Date.now() - t1;
    console.log(`[TEST 2] Handled massive single scene in ${duration}ms. Page eighths calculated: ${parseRes.scriptParse.scenes[0]?.pageEighths}/8.`);
    results.push({
      testId: "SAB-02-MASSIVE-SCENE",
      testName: "Dense 5,000+ Word Single Scene",
      inputDescription: "Single massive scene testing token window and page-eighth scaling",
      handledGracefully: parseRes.scriptParse.scenes.length === 1 && parseRes.scriptParse.scenes[0].pageEighths > 20,
      durationMs: duration,
      findings: [],
    });
  } catch (err: any) {
    results.push({
      testId: "SAB-02-MASSIVE-SCENE",
      testName: "Dense 5,000+ Word Single Scene",
      inputDescription: "Single massive scene testing token window",
      handledGracefully: false,
      httpOrExceptionMessage: String(err),
      durationMs: Date.now() - t1,
      findings: [
        {
          id: "FIND-SAB-02-ERR",
          severity: "MAJOR",
          title: "Massive Scene Token Limit Crash",
          description: `Massive scene failed parser: ${String(err)}`,
          evidence: String(err),
        },
      ],
    });
  }

  // TEST 3: 60 one-eighth scenes (Tests schedule setup floor and bin-packing at high scene counts)
  console.log("\n[SABOTEUR TEST 3] 60 micro-scenes (1/8th page each)...");
  const scenes60: string[] = [];
  for (let i = 1; i <= 60; i++) {
    scenes60.push(`SCENE ${i}
INT. LOCATION ${((i % 5) + 1)} - ${i % 2 === 0 ? "DAY" : "NIGHT"}
Quick flash cut ${i}. Character glances at watch.
`);
  }
  const microScenesScript = `TITLE: MONTAGE 60
FORMAT: SHORT
LOGLINE: A hyper-fast 60-scene montage testing schedule setup floors.

${scenes60.join("\n")}
`;

  const t2 = Date.now();
  try {
    // Generate parse mock with 60 scenes to test schedule engine directly
    const mockParse = {
      title: "MONTAGE 60",
      format: "short" as const,
      logline: "60-scene montage",
      scenes: Array.from({ length: 60 }, (_, idx) => ({
        id: idx + 1,
        slugline: `INT. LOCATION ${(idx % 5) + 1} - ${idx % 2 === 0 ? "DAY" : "NIGHT"}`,
        intExt: "INT" as const,
        location: `LOCATION ${(idx % 5) + 1}`,
        timeOfDay: idx % 2 === 0 ? ("DAY" as const) : ("NIGHT" as const),
        summary: `Micro scene ${idx + 1}`,
        characters: ["LEO"],
        pageEighths: 1, // 1/8 page
      })),
    };

    const schedule = buildSchedule(mockParse);
    const budget = buildBudget(schedule);
    const duration = Date.now() - t2;

    // Check setup floor: Each scene must receive >= 3/8 page floor in effective eighths
    const totalEffective = schedule.stats.totalEffectiveEighths;
    const minExpectedEffective = 60 * 3; // 180 eighths minimum

    console.log(`[TEST 3] 60 micro-scenes scheduled into ${schedule.stats.shootDays} shoot days (${schedule.stats.nightShoots} night), Total Effective: ${totalEffective}/8 (Min Expected: ${minExpectedEffective}/8).`);

    results.push({
      testId: "SAB-03-60-SCENES",
      testName: "60 Micro-Scenes Schedule Bin-Packing",
      inputDescription: "60 scenes of 1/8 page each testing setup floors and day-before-night turnaround",
      handledGracefully: totalEffective >= minExpectedEffective && schedule.stats.shootDays >= 5,
      durationMs: duration,
      findings: [],
    });
  } catch (err: any) {
    results.push({
      testId: "SAB-03-60-SCENES",
      testName: "60 Micro-Scenes Schedule Bin-Packing",
      inputDescription: "60 micro-scenes",
      handledGracefully: false,
      httpOrExceptionMessage: String(err),
      durationMs: Date.now() - t2,
      findings: [
        {
          id: "FIND-SAB-03-ERR",
          severity: "BLOCKER",
          title: "Schedule Engine Failed on 60 Micro-Scenes",
          description: `Schedule engine threw error on 60 micro-scenes: ${String(err)}`,
          evidence: String(err),
        },
      ],
    });
  }

  // TEST 4: Duplicate scene numbers
  console.log("\n[SABOTEUR TEST 4] Duplicate scene numbers...");
  const duplicateScenesScript = `TITLE: DUPLICATE NUMBERS
FORMAT: SHORT
LOGLINE: A screenplay with non-sequential duplicate scene numbers.

SCENE 1
INT. KITCHEN - DAY
Clara pours coffee.

SCENE 1
INT. KITCHEN - DAY
Clara drops the coffee mug. It shatters.

SCENE 2
EXT. ALLEY - NIGHT
Julian runs into the shadows.

SCENE 2
EXT. ALLEY - NIGHT
Julian jumps over the fence.
`;

  const t3 = Date.now();
  try {
    const ink = new InkAgent();
    const parseRes = await ink.parseScript(duplicateScenesScript);
    const duration = Date.now() - t3;
    console.log(`[TEST 4] Handled duplicate scene numbers in ${duration}ms. Unique IDs assigned: ${parseRes.scriptParse.scenes.map((s) => s.id).join(", ")}`);

    results.push({
      testId: "SAB-04-DUPLICATE-SCENES",
      testName: "Duplicate Scene Numbers Resolution",
      inputDescription: "Screenplay text containing multiple Scene 1s and Scene 2s",
      handledGracefully: parseRes.scriptParse.scenes.length >= 2,
      durationMs: duration,
      findings: [],
    });
  } catch (err: any) {
    results.push({
      testId: "SAB-04-DUPLICATE-SCENES",
      testName: "Duplicate Scene Numbers Resolution",
      inputDescription: "Duplicate scene numbers",
      handledGracefully: false,
      httpOrExceptionMessage: String(err),
      durationMs: Date.now() - t3,
      findings: [
        {
          id: "FIND-SAB-04-ERR",
          severity: "MAJOR",
          title: "Duplicate Scene Numbers Failed Parser",
          description: `Duplicate scene numbers crashed parser: ${String(err)}`,
          evidence: String(err),
        },
      ],
    });
  }

  // TEST 5: Lowercase sluglines (`int. kitchen - day`)
  console.log("\n[SABOTEUR TEST 5] Lowercase sluglines...");
  const lowercaseSluglinesScript = `TITLE: LOWERCASE SCRIPT
FORMAT: SHORT
LOGLINE: Screenplay written with lowercase sluglines.

scene 1
int. basement storage - day
Dust settles over old cardboard boxes.

scene 2
ext. gravel driveway - night
A car idles in the dark with its headlights off.
`;

  const t4 = Date.now();
  try {
    const ink = new InkAgent();
    const parseRes = await ink.parseScript(lowercaseSluglinesScript);
    const duration = Date.now() - t4;
    console.log(`[TEST 5] Handled lowercase sluglines in ${duration}ms. Parsed ${parseRes.scriptParse.scenes.length} scenes.`);

    results.push({
      testId: "SAB-05-LOWERCASE-SLUGLINES",
      testName: "Lowercase Sluglines Parsing",
      inputDescription: "Screenplay text using 'int. basement - day' instead of UPPERCASE",
      handledGracefully: parseRes.scriptParse.scenes.length === 2 && parseRes.scriptParse.scenes[0].intExt === "INT",
      durationMs: duration,
      findings: [],
    });
  } catch (err: any) {
    results.push({
      testId: "SAB-05-LOWERCASE-SLUGLINES",
      testName: "Lowercase Sluglines Parsing",
      inputDescription: "Lowercase sluglines",
      handledGracefully: false,
      httpOrExceptionMessage: String(err),
      durationMs: Date.now() - t4,
      findings: [
        {
          id: "FIND-SAB-05-ERR",
          severity: "MAJOR",
          title: "Lowercase Sluglines Failed Parser",
          description: `Lowercase sluglines crashed parser: ${String(err)}`,
          evidence: String(err),
        },
      ],
    });
  }

  return results;
}

if (process.argv[1]?.endsWith("persona-e-saboteur.ts")) {
  runPersonAESaboteur()
    .then((res) => {
      console.log("\n=== ALL PERSONA E RESULTS ===");
      console.log(JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error("Persona E Error:", err);
      process.exit(1);
    });
}
