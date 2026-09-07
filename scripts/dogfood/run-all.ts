import { runPersonaAScreenwriter } from "./persona-a-screenwriter";
import { runPersonaBProducer } from "./persona-b-producer";
import { runPersonaCAuditor } from "./persona-c-auditor";
import { runPersonaDJudge } from "./persona-d-judge";
import { runPersonAESaboteur } from "./persona-e-saboteur";

export async function runFullDogfoodSuite() {
  console.log("================================================================================");
  console.log("BACKLOT STUDIO — COMPREHENSIVE 48-HOUR DOGFOODING SUITE");
  console.log("Target Hosted URL: https://backlot-studio-112519007745.us-central1.run.app");
  console.log("Timestamp:", new Date().toISOString());
  console.log("================================================================================\n");

  const startTime = Date.now();

  // Run Persona D: The Judge (Latency, Sample verification, Concurrency)
  console.log(">>> EXECUTING PERSONA D: THE JUDGE <<<");
  const judgeReport = await runPersonaDJudge();

  // Run Persona C: The Auditor (Ledger math, Provenance tracing, Schedule invariants)
  console.log("\n>>> EXECUTING PERSONA C: THE AUDITOR <<<");
  const auditorReport = await runPersonaCAuditor();

  // Run Persona A: The Screenwriter (5 distinct original screenplays, coverage, breakdown accuracy, conditional crew)
  console.log("\n>>> EXECUTING PERSONA A: THE SCREENWRITER <<<");
  const screenwriterReport = await runPersonaAScreenwriter();

  // Run Persona B: The Producer (Multi-step revision loop, pinning, deltas, invalidation)
  console.log("\n>>> EXECUTING PERSONA B: THE PRODUCER <<<");
  const producerReport = await runPersonaBProducer();

  // Run Persona E: The Saboteur (Hostile battery, contradictions, massive scenes, micro-scenes, duplicate numbers, lowercase sluglines)
  console.log("\n>>> EXECUTING PERSONA E: THE SABOTEUR <<<");
  const saboteurReport = await runPersonAESaboteur();

  const totalDurationMs = Date.now() - startTime;

  console.log("\n================================================================================");
  console.log("DOGFOOD SUITE EXECUTION SUMMARY");
  console.log(`Total Execution Time: ${(totalDurationMs / 1000).toFixed(1)}s`);
  console.log("Persona D (Judge): Health HTTP " + judgeReport.hostedEndpointHealth.status + ", Sample matches=" + (judgeReport.sampleEndpointVerification.discrepancies.length === 0));
  console.log("Persona C (Auditor): Math passed=" + auditorReport.mathAudit.passed + ", Provenance passed=" + auditorReport.provenanceAudit.passed + ", Blockers=" + auditorReport.blockers.length);
  console.log("Persona A (Screenwriter): 5 scripts parsed, findings=" + Object.values(screenwriterReport).reduce((acc, s) => acc + s.findings.length, 0));
  console.log("Persona B (Producer): 5 revision steps, findings=" + producerReport.reduce((acc, s) => acc + s.findings.length, 0));
  console.log("Persona E (Saboteur): 5 hostile batteries, findings=" + saboteurReport.reduce((acc, s) => acc + s.findings.length, 0));
  console.log("================================================================================\n");

  return {
    judgeReport,
    auditorReport,
    screenwriterReport,
    producerReport,
    saboteurReport,
    totalDurationMs,
  };
}

if (process.argv[1]?.endsWith("run-all.ts")) {
  runFullDogfoodSuite()
    .then((summary) => {
      console.log("Dogfood run complete. Generating findings...");
    })
    .catch((err) => {
      console.error("Full Dogfood Suite Failed:", err);
      process.exit(1);
    });
}
