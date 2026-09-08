---
title: Calibrate Production Recommendation Provenance and Feasibility
date: 2026-09-07
status: implementation-ready
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
execution: code
---

# Calibrate Production Recommendation Provenance and Feasibility

## Goal Capsule
Eliminate the recommendation/provenance mismatch in Backlot Studio by ensuring the Audited Budget provenance drawer dynamically displays the selected item's own run recommendation (or cleanly withholds market comps if none match), preventing unsupported budget diversions from script-required physical crew, accurately partitioning domain eval and run receipts, and releasing the verified candidate to Google Cloud Run.

## Problem Statement
1. **Application Defect in Provenance Drawer:** `AuditedBudget.tsx` hardcoded the copy `"Grounded in retrieved Parallel Search comps. Backlot Studio infers maintaining this audio design allocation to preserve festival acquisition value."` whenever any line item matching `recommendedItemName` was selected. When a live run targeted `Practical SFX Technician` ($450, required by physical SFX in scenes 1 and 2), the drawer displayed this contradictory audio copy instead of the actual recommendation and evidence.
2. **Unsupported Budget Diversions:** Festival comps and market research citations do not justify cutting or diverting budget away from physical crew required by screenplay breakdown (e.g., Practical SFX Tech, Stunt Coordinator). Marquee lacked explicit guardrails prohibiting LLM-generated budget diversions from script-required personnel.
3. **Receipt & Eval Conflation:** The 5 domain evals in `evals/frequency-zero.eval.test.ts` only evaluate Slate (stunts, SFX, HMU, scene complexity) and Ink (coverage scores/verdict), not Ledger or Revision or Marquee. Previous records also conflated API run `run_1788828626968` and browser run `run_1788828735594`.

## Scope Boundaries
- **In Scope:**
  - `src/components/artifacts/AuditedBudget.tsx`: Dynamic recommendation rendering, removal of hardcoded audio text, strict withholding of market comp section for non-matching items.
  - `src/app/page.tsx`: Pass full `productionRecommendation` object to `AuditedBudget`.
  - `src/lib/agents/marquee.ts`: Explicit physical feasibility invariants in system prompt and prompt; programmatic guard withholding or narrowing unsupported diversions from script-required crew.
  - Verification & Regression tests: Focused tests for dynamic drawer rendering, recommendation validation, and receipt separation.
  - Build & deployment to Cloud Run `backlot-studio` on `polygraph-hackathon` in `us-central1`.
  - Live acceptance verification on desktop and mobile viewports.
- **Out of Scope:**
  - Any change to deterministic budget or schedule arithmetic.
  - Non-Google AI models or third-party agent frameworks (strictly prohibited).
  - Video submission or publication.

## Implementation Units

### U1: Dynamic Recommendation Rendering in AuditedBudget Drawer
- **Files:** `src/components/artifacts/AuditedBudget.tsx`, `src/app/page.tsx`
- **Approach:**
  - Update `AuditedBudgetProps` to accept `productionRecommendation?: ProductionRecommendation | null`.
  - Remove line 206's hardcoded audio copy.
  - In `#line-item-audit-drawer`:
    - Determine if `selectedTraceItem` matches `productionRecommendation?.affectedArtifact` (where `kind === "budget_line_item"`).
    - If matched: Render structured Market Comp Reference with `productionRecommendation.factualFinding` (Retrieved Fact), `productionRecommendation.inferredAdvice` (Inferred Studio Advice), `actionableDecision`, and source citation link.
    - If not matched: Withhold the Market Comp Reference entirely, showing only the Script Breakdown Origin (`tracesTo`) and deterministic math.
  - In `src/app/page.tsx`: Pass `productionRecommendation={runState?.pitchKit?.productionRecommendation ?? null}` to `<AuditedBudget />`.

### U2: Physical Feasibility & Diversion Guard in Marquee
- **Files:** `src/lib/agents/marquee.ts`
- **Approach:**
  - Add explicit instructions to `MARQUEE_SYSTEM_PROMPT` and prompt: festival and market comps must never be used to cut, defund, or divert budget from crew or equipment required by physical screenplay breakdown (`tracesTo` containing `flagged in scene(s)`).
  - In `MarqueeAgent.generatePitchKit`:
    - If the generated recommendation targets a budget item whose `tracesTo` marks it as script-required and the recommendation proposes cutting or diverting its budget: withhold the recommendation (`productionRecommendation = null`) or narrow to supported festival/post-production actions if grounded in the retrieved citation.
    - If market research is offline or empty, cleanly leave `productionRecommendation = null`.

### U3: Unit & Regression Checks
- **Files:** `src/components/artifacts/__tests__/AuditedBudget.test.tsx` or `src/lib/agents/__tests__/marquee-recommendation.test.ts`
- **Approach:**
  - Verify that selecting a non-audio target does not display audio advice.
  - Verify that selecting an item matching a recommendation displays that recommendation's actual factual finding and inferred advice.
  - Verify that selecting an unrelated item withholds market comp advice.
  - Verify that unsupported diversions from script-required crew are withheld.
  - Run full test suite (`npm test`) and production build (`npm run build`).

### U4: Cloud Run Deployment & Live Hosted Verification
- **Targets:**
  - Service: `backlot-studio`
  - Project: `polygraph-hackathon`
  - Region: `us-central1`
  - Rollback target: `backlot-studio-00013-fnk`
- **Approach:**
  - Commit verified changes to `origin/main`.
  - Build and deploy new candidate revision.
  - Test live run via browser/API on desktop and mobile.
  - Capture unique run ID and visual verification receipts.

### U5: Resume Demo & Accurately Report Status
- Document accurate receipts, distinguishing unit tests, 5 domain evals, API run `run_1788828626968`, browser run `run_1788828735594`, and new release run ID.
- Check and report exact video preparation status.
