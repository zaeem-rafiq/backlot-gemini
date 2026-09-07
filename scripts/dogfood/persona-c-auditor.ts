import { Schedule } from "../../src/lib/types/schedule";
import { Budget, BudgetLineItem } from "../../src/lib/types/budget";
import { ScriptBreakdown } from "../../src/lib/types/breakdown";
import { ScriptParse } from "../../src/lib/types/screenplay";
import { DEFAULT_INDIE_RATE_CARD } from "../../src/lib/ledger/rate-card";
import sampleRunData from "../../src/fixtures/sample-run.json";

export interface AuditReport {
  mathAudit: {
    lineItemsChecked: number;
    subtotalsChecked: number;
    contingencyChecked: boolean;
    grandTotalChecked: boolean;
    mathDiscrepancies: Array<{ item: string; expected: number; actual: number; diff: number }>;
    passed: boolean;
  };
  provenanceAudit: {
    totalTracesChecked: number;
    unresolvedTraces: Array<{ item: string; tracesTo: string; reason: string }>;
    passed: boolean;
  };
  scheduleRulesAudit: {
    dayBeforeNightPassed: boolean;
    capacityLimitsPassed: boolean;
    companyMoveDeductionsPassed: boolean;
    castMatrixConsistencyPassed: boolean;
    violations: string[];
    passed: boolean;
  };
  blockers: string[];
}

export function auditCompleteProductionPackage(
  scriptParse: ScriptParse,
  breakdown: ScriptBreakdown,
  schedule: Schedule,
  budget: Budget
): AuditReport {
  const rateCard = DEFAULT_INDIE_RATE_CARD;
  const mathDiscrepancies: AuditReport["mathAudit"]["mathDiscrepancies"] = [];
  const unresolvedTraces: AuditReport["provenanceAudit"]["unresolvedTraces"] = [];
  const scheduleViolations: string[] = [];
  const blockers: string[] = [];

  let lineItemsChecked = 0;
  let subtotalsChecked = 0;

  // 1. Math Audit: Recompute every line item independently
  for (const section of budget.sections) {
    let computedSectionSubtotal = 0;

    for (const item of section.items) {
      lineItemsChecked++;
      const expectedTotal = item.qty * item.rate;

      // Special handling for contingency / percentages
      if (item.unit === "percent") {
        // Percent items are calculated against labor base or subtotal before contingency
        if (item.category === "Night Premium") {
          // Night premium rate is percentage of night labor
          computedSectionSubtotal += item.total;
        } else if (item.category === "Contingency") {
          computedSectionSubtotal += item.total;
        }
      } else {
        if (Math.abs(item.total - expectedTotal) > 0.01) {
          mathDiscrepancies.push({
            item: `${item.category} -> ${item.item}`,
            expected: expectedTotal,
            actual: item.total,
            diff: Math.abs(item.total - expectedTotal),
          });
        }
        computedSectionSubtotal += item.total;
      }

      // 2. Provenance Audit: Trace every tracesTo string back to real elements
      const trace = item.tracesTo;
      if (!trace || trace.trim().length === 0) {
        unresolvedTraces.push({
          item: `${item.category} -> ${item.item}`,
          tracesTo: "",
          reason: "Missing tracesTo provenance string entirely.",
        });
      } else {
        // Check if trace cites specific scene IDs (e.g. "scene(s): 2, 8")
        const sceneCitationMatch = trace.match(/scene\(s\):\s*([\d,\s]+)/i);
        if (sceneCitationMatch && sceneCitationMatch[1]) {
          const citedSceneIds = sceneCitationMatch[1]
            .split(",")
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n));

          for (const sId of citedSceneIds) {
            const bd = breakdown.breakdowns.find((b) => b.sceneId === sId);
            if (!bd) {
              unresolvedTraces.push({
                item: `${item.category} -> ${item.item}`,
                tracesTo: trace,
                reason: `Cites Scene ${sId}, but Scene ${sId} does not exist in script breakdown.`,
              });
            } else {
              // Verify the specific element exists in that scene
              if (item.item.includes("Stunt") && bd.stunts.length === 0) {
                unresolvedTraces.push({
                  item: `${item.category} -> ${item.item}`,
                  tracesTo: trace,
                  reason: `Cites Scene ${sId} for stunts, but Scene ${sId} has 0 stunts in breakdown.`,
                });
              }
              if (item.item.includes("SFX") && bd.sfx.length === 0) {
                unresolvedTraces.push({
                  item: `${item.category} -> ${item.item}`,
                  tracesTo: trace,
                  reason: `Cites Scene ${sId} for SFX, but Scene ${sId} has 0 SFX in breakdown.`,
                });
              }
              if (item.item.includes("Hair & Makeup") && bd.makeupHair.length === 0) {
                unresolvedTraces.push({
                  item: `${item.category} -> ${item.item}`,
                  tracesTo: trace,
                  reason: `Cites Scene ${sId} for HMU, but Scene ${sId} has 0 makeupHair in breakdown.`,
                });
              }
              if (item.item.includes("VFX") && bd.vfx.length === 0) {
                unresolvedTraces.push({
                  item: `${item.category} -> ${item.item}`,
                  tracesTo: trace,
                  reason: `Cites Scene ${sId} for VFX, but Scene ${sId} has 0 VFX in breakdown.`,
                });
              }
              if (item.item.includes("Background") && bd.background.length === 0) {
                unresolvedTraces.push({
                  item: `${item.category} -> ${item.item}`,
                  tracesTo: trace,
                  reason: `Cites Scene ${sId} for Background, but Scene ${sId} has 0 background in breakdown.`,
                });
              }
            }
          }
        }
      }
    }

    subtotalsChecked++;
    if (Math.abs(section.subtotal - computedSectionSubtotal) > 0.01) {
      mathDiscrepancies.push({
        item: `SUBTOTAL: ${section.category}`,
        expected: computedSectionSubtotal,
        actual: section.subtotal,
        diff: Math.abs(section.subtotal - computedSectionSubtotal),
      });
    }
  }

  // Check subtotal before contingency
  const expectedSubtotalBeforeContingency =
    budget.summary.crewSubtotal +
    budget.summary.nightPremiumTotal +
    budget.summary.castSubtotal +
    budget.summary.equipmentSubtotal +
    budget.summary.locationsLogisticsSubtotal +
    budget.summary.postSubtotal;

  if (Math.abs(budget.summary.subtotalBeforeContingency - expectedSubtotalBeforeContingency) > 0.01) {
    mathDiscrepancies.push({
      item: "SUMMARY: subtotalBeforeContingency",
      expected: expectedSubtotalBeforeContingency,
      actual: budget.summary.subtotalBeforeContingency,
      diff: Math.abs(budget.summary.subtotalBeforeContingency - expectedSubtotalBeforeContingency),
    });
  }

  const expectedContingency = Math.round(expectedSubtotalBeforeContingency * rateCard.contingencyRate);
  const contingencyChecked = Math.abs(budget.summary.contingencyTotal - expectedContingency) <= 1;

  if (!contingencyChecked) {
    mathDiscrepancies.push({
      item: "SUMMARY: contingencyTotal (10%)",
      expected: expectedContingency,
      actual: budget.summary.contingencyTotal,
      diff: Math.abs(budget.summary.contingencyTotal - expectedContingency),
    });
  }

  const expectedGrandTotal = expectedSubtotalBeforeContingency + expectedContingency;
  const grandTotalChecked = Math.abs(budget.summary.grandTotal - expectedGrandTotal) <= 1;

  if (!grandTotalChecked) {
    mathDiscrepancies.push({
      item: "SUMMARY: grandTotal",
      expected: expectedGrandTotal,
      actual: budget.summary.grandTotal,
      diff: Math.abs(budget.summary.grandTotal - expectedGrandTotal),
    });
  }

  // 3. Schedule Rules Audit
  // Rule A: Day shoots strictly before Night shoots (turnaround invariant)
  let seenNight = false;
  let dayBeforeNightPassed = true;
  for (const day of schedule.days) {
    if (day.shootType === "NIGHT") {
      seenNight = true;
    } else if (seenNight && day.shootType === "DAY") {
      dayBeforeNightPassed = false;
      scheduleViolations.push(`Turnaround Violation: Day ${day.dayNumber} is a DAY shoot scheduled after a NIGHT shoot.`);
    }
  }

  // Rule B: Daily capacity limits (effective eighths <= 36/8 or single oversized scene)
  let capacityLimitsPassed = true;
  for (const day of schedule.days) {
    if (day.effectiveEighths > 36.5 && day.sceneIds.length > 1) {
      capacityLimitsPassed = false;
      scheduleViolations.push(`Capacity Violation: Day ${day.dayNumber} has ${day.effectiveEighths}/8 effective eighths with ${day.sceneIds.length} scenes (exceeds 36/8 cap).`);
    }
  }

  // Rule C: Company move deduction enforcement (moves = locations.length - 1 per day)
  let companyMoveDeductionsPassed = true;
  for (const day of schedule.days) {
    const expectedMoves = Math.max(0, day.locations.length - 1);
    if (day.companyMoves !== expectedMoves) {
      companyMoveDeductionsPassed = false;
      scheduleViolations.push(`Company Move Count Violation: Day ${day.dayNumber} has ${day.locations.length} locations but recorded ${day.companyMoves} moves (expected ${expectedMoves}).`);
    }
  }

  // Rule D: Cast day matrix consistency
  let castMatrixConsistencyPassed = true;
  const computedCastDays: Record<string, number> = {};
  for (const day of schedule.days) {
    for (const cast of day.castNeeded) {
      computedCastDays[cast] = (computedCastDays[cast] || 0) + 1;
    }
  }

  for (const [cast, days] of Object.entries(schedule.stats.castDays)) {
    if (computedCastDays[cast] !== days) {
      castMatrixConsistencyPassed = false;
      scheduleViolations.push(`Cast Matrix Inconsistency: Cast member '${cast}' listed with ${days} day(s) in stats but present in ${computedCastDays[cast] || 0} scheduled day(s).`);
    }
  }

  // Tally Blockers
  if (mathDiscrepancies.length > 0) {
    blockers.push(`${mathDiscrepancies.length} Math Discrepancy(ies) detected in Ledger.`);
  }
  if (unresolvedTraces.length > 0) {
    blockers.push(`${unresolvedTraces.length} Unresolved Provenance Trace(s) detected in Budget.`);
  }
  if (scheduleViolations.length > 0) {
    blockers.push(`${scheduleViolations.length} Schedule Invariant Violation(s) detected.`);
  }

  return {
    mathAudit: {
      lineItemsChecked,
      subtotalsChecked,
      contingencyChecked,
      grandTotalChecked,
      mathDiscrepancies,
      passed: mathDiscrepancies.length === 0,
    },
    provenanceAudit: {
      totalTracesChecked: lineItemsChecked,
      unresolvedTraces,
      passed: unresolvedTraces.length === 0,
    },
    scheduleRulesAudit: {
      dayBeforeNightPassed,
      capacityLimitsPassed,
      companyMoveDeductionsPassed,
      castMatrixConsistencyPassed,
      violations: scheduleViolations,
      passed: scheduleViolations.length === 0,
    },
    blockers,
  };
}

export async function runPersonaCAuditor(): Promise<AuditReport> {
  console.log("\n======================================================");
  console.log("[PERSONA C: THE AUDITOR] Auditing sample run package");
  console.log("======================================================");

  const sample = sampleRunData as unknown as {
    scriptParse: ScriptParse;
    breakdown: ScriptBreakdown;
    schedule: Schedule;
    budget: Budget;
  };

  const report = auditCompleteProductionPackage(
    sample.scriptParse,
    sample.breakdown,
    sample.schedule,
    sample.budget
  );

  console.log(`Math Audit Passed: ${report.mathAudit.passed} (${report.mathAudit.lineItemsChecked} lines checked)`);
  console.log(`Provenance Audit Passed: ${report.provenanceAudit.passed}`);
  console.log(`Schedule Rules Audit Passed: ${report.scheduleRulesAudit.passed}`);
  console.log(`Blockers Count: ${report.blockers.length}`);

  return report;
}

if (process.argv[1]?.endsWith("persona-c-auditor.ts")) {
  runPersonaCAuditor()
    .then((res) => {
      console.log("\n=== ALL PERSONA C AUDIT RESULTS ===");
      console.log(JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error("Persona C Error:", err);
      process.exit(1);
    });
}
