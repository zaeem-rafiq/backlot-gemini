# Dogfooding Findings & Defect Log

**Product:** Backlot — Multi-Agent Pre-Production Studio  
**Log Window:** 2026-08-27 through 2026-08-29  
**Evaluation Standard:** Customer-Obsessed Filmmaker Dogfooding (Personas A–E)  
**Hosted Deployment Under Test:** `https://backlot-studio-112519007745.us-central1.run.app`  

---

## Executive Digest (Day 1 — Aug 27, 2026)

| Severity | Total Discovered | Fixed & Tested | Open / Triage |
| :--- | :---: | :---: | :---: |
| **BLOCKER** | 1 | 1 | 0 |
| **MAJOR** | 1 | 1 | 0 |
| **MINOR** | 1 | 1 | 0 |
| **POLISH** | 1 | 1 | 0 |
| **TOTAL** | **4** | **4** | **0** |

### Triage & Decision Summary for Zaeem:
1. **BLOCKER (Fixed):** `FIND-LEDGER-SAMPLE-MATH-DISCREPANCY` — Sample fixture (`sample-run.json`) had internal subtotal arithmetic drift ($5,194 vs $5,538 on Locations, $3,675 vs $3,425 on Post) and differed from live pure code `buildBudget`. Rebuilt fixture budget directly from deterministic `buildBudget(schedule, breakdown)`. Math audit now passes 100% (28/28 line items, 7/7 subtotals, 0 discrepancies).
2. **MAJOR (Fixed):** `FIND-SLATE-ARTISAN-STUNT-HALLUCINATION` — Slate classified artisan craftwork in `THE GLASSBLOWER` (holding a blowpipe, rotating hot glass) as physical stunts, causing Ledger to book an unnecessary $1,300 Stunt Coordinator. Added explicit negative prompt constraints in `SLATE_SYSTEM_PROMPT`.
3. **MINOR (Fixed):** `FIND-ROUTER-REVISION-PASSTHROUGH` — `POST /api/run` did not route `{ isRevision: true, originalRun }` to `DirectorOrchestrator.executeRevisionRun`. Wired route dispatch to support streaming revision pipelines.
4. **POLISH (Fixed):** `FIND-COMMAND-PALETTE-REVISION-TAB` — Command Palette (⌘K) omitted the "Revision Diff" deliverable tab when revision data was present. Added dynamic command option.

---

## Persona Evaluation Scorecard

| Persona | Surface Evaluated | Status | Primary Observation |
| :--- | :--- | :---: | :--- |
| **A. The Screenwriter** | 5 Original Scripts (`Appraisal`, `Blackwood`, `Lost Errand`, `Glassblower`, `Red Line`) | **PASS** | Coverage prose is deeply specific (calibrated 1-10 scores, real historical comparables *The Vast of Night*, *The Father*, *Run Lola Run*, *Paterson*). Identified & resolved glassblower craft stunt classification. |
| **B. The Producer** | 5-Step Revision Loop (Cut, Add, Day->Night, Combine Locs, 1-Word Edit) | **PASS** | Scene Pinning held 100% across all steps with zero re-hallucination on untouched scenes. Invalidation manifest correctly flagged stale frames (`BW_05_PURSUIT`, `BW_06_CLIMAX`). |
| **C. The Auditor** | Mathematical & Provenance Reconciliation | **PASS** | Recomputed all 28 line items, 7 category subtotals, night premium % formulas, catering person-day counts ($22/person/day), 10% contingency, and grand totals. Checked all `tracesTo` strings back to breakdown elements. |
| **D. The Judge** | Cloud Run Latency, Concurrency, Page Weight | **PASS** | Health endpoint responded in 271ms on cold check. `/api/sample` payload delivered in 127ms. 3 concurrent requests completed in 66ms, 131ms, 114ms with zero crosstalk. Base64 sample weight = 40.3 KB. |
| **E. The Saboteur** | Hostile Battery (Contradictions, 5k words, 60 micro-scenes, Dup IDs, Lowercase) | **PASS** | Handled all hostile conditions gracefully without crashing. 60 micro-scenes correctly triggered 3/8 page setup floor (216 effective eighths across 8 shoot days). |

---

## Detailed Findings & Defects

### FIND-01 [BLOCKER] — Sample Run Fixture Budget Subtotal Arithmetic Inconsistency
- **Severity:** BLOCKER
- **Persona:** Persona C (The Auditor)
- **User Experience:** An auditor opening the sample production package (`FREQUENCY ZERO`) and re-calculating the budget line items by hand finds that the `Locations & Logistics` and `Post Production` section subtotals did not equal the sum of their constituent line items:
  - `Locations & Logistics` line items: Permits ($3,200) + Catering ($968) + Transit ($720) + Insurance ($650) = **$5,538**. Subtotal was typed as **$5,194** (diff: -$344).
  - `Post Production` line items: Editor ($1,500) + Color ($600) + Sound ($650) + Score ($400) + VFX ($275) = **$3,425**. Subtotal was typed as **$3,675** (diff: +$250).
- **Repro Steps:**
  1. Inspect `src/fixtures/sample-run.json`.
  2. Sum line items in `sections[4]` and `sections[5]`.
  3. Compare against `sections[4].subtotal` and `sections[5].subtotal`.
- **Evidence:**
  ```json
  // Before fix in sample-run.json:
  "category": "Locations & Logistics", "subtotal": 5194 // Items sum to 5538
  "category": "Post Production", "subtotal": 3675      // Items sum to 3425
  ```
- **Root Cause:** Legacy static sample fixture contained preliminary numbers that were not generated through the pure deterministic `buildBudget` function.
- **Fix & Remediation:** Re-generated `sample-run.json`'s `budget` object directly using `buildBudget(schedule, breakdown)` to ensure 100% mathematical integrity and provenance synchronization.
- **Status:** **FIXED & VERIFIED**

---

### FIND-02 [MAJOR] — Slate Hallucinated Stunt Booking for Artisan Glassblowing Craft
- **Severity:** MAJOR
- **Persona:** Persona A (The Screenwriter)
- **User Experience:** When submitting a peaceful, dialogue-free visual screenplay about an artisan craftsman shaping glass in a workshop (`THE GLASSBLOWER`), Slate extracted "Precision hot glass handling stunt safety", "Stunt double for precision hot glass", and "Safe handling and drop stunt" as stunts across all 4 scenes. This triggered Ledger to book a **Stunt Coordinator for 2 days ($1,300)** in the production budget for a short film with zero physical stunts.
- **Repro Steps:**
  1. Submit `THE GLASSBLOWER` screenplay into `DirectorOrchestrator`.
  2. Check `breakdown.breakdowns[0..3].stunts`.
  3. Check `budget.sections["Crew"]` for `Stunt Coordinator`.
- **Evidence:**
  ```json
  "stunts": [
    "Precision hot glass handling stunt safety",
    "Stunt double for precision hot glass sculpting and live fire usage"
  ]
  // Resulting in:
  "item": "Stunt Coordinator", "qty": 2, "rate": 650, "total": 1300
  ```
- **Root Cause:** `SLATE_SYSTEM_PROMPT` lacked explicit negative guidance distinguishing genuine high-risk physical action (falls, combat, wirework, precision driving, water rescue) from ordinary character manual labor, artisan craftwork, or holding hot tools/props.
- **Fix & Remediation:** Updated `SLATE_SYSTEM_PROMPT` in `src/lib/agents/slate.ts` with strict negative rules forbidding stunt tags on artisan craftwork and manual tasks.
- **Status:** **FIXED & VERIFIED**

---

### FIND-03 [MINOR] — HTTP API Route `/api/run` Ignored In-Flight Revision Option
- **Severity:** MINOR
- **Persona:** Persona B (The Producer)
- **User Experience:** When a frontend client or API caller posts a revision payload (`{ screenplayText: "...", isRevision: true, originalRun: {...} }`), `src/app/api/run/route.ts` executed a standard run from scratch rather than executing `director.executeRevisionRun`. This caused the revision diff, scene pinning, and invalidation manifests to be bypassed over the HTTP API.
- **Repro Steps:**
  1. Send `POST /api/run` with `{ isRevision: true, originalRun: {...}, screenplayText: "..." }`.
  2. Observe SSE stream emitting only standard artifacts without `revision` analysis.
- **Evidence:**
  ```typescript
  // src/app/api/run/route.ts (before):
  await director.executeRun(screenplayText, { enableImages, ... });
  ```
- **Fix & Remediation:** Updated `src/app/api/run/route.ts` to inspect `body.isRevision` and `body.originalRun`, routing to `director.executeRevisionRun` when present.
- **Status:** **FIXED & VERIFIED**

---

### FIND-04 [POLISH] — Command Palette (⌘K) Missing Revision Diff Tab Jump
- **Severity:** POLISH
- **Persona:** Persona D (The Judge)
- **User Experience:** When viewing a production package that contains revision analysis data (`runState.revision`), opening the Command Deck via ⌘K showed commands for Coverage, Breakdown, Schedule, Budget, Storyboard, and Pitch Kit, but omitted a quick jump to the "Revision Diff" tab.
- **Repro Steps:**
  1. Open Backlot Studio with revision data active.
  2. Press ⌘K to open the Command Palette.
  3. Search "Revision".
- **Evidence:** Command list did not include `tab-revision`.
- **Fix & Remediation:** Added dynamic `tab-revision` item in `CommandPalette.tsx` conditional on `runState?.revision`.
- **Status:** **FIXED & VERIFIED**

---

## Real Evidence Telemetry & Benchmark Logs

### Benchmark 1: Cloud Run Live Response Times (`us-central1`)
- **GET `/api/health`**: 271ms (HTTP 200)
- **GET `/api/sample`**: 127ms (HTTP 200, 41.2 KB payload)
- **Concurrent 3-Stream Burst**: 66ms, 131ms, 114ms (100% isolated, 0 errors)

### Benchmark 2: Pipeline Execution Durations on Vertex AI (`gemini-3.5-flash` + `gemini-3.1-flash-lite`)
- **`THE APPRAISAL`** (2 scenes, 1 day, $10,902 budget): 14.8s total
- **`BLACKWOOD POND`** (3 scenes, 2 days, $20,346 budget): 18.2s total
- **`THE LOST ERRAND`** (4 scenes, 2 days, $23,057 budget): 19.5s total
- **`THE GLASSBLOWER`** (4 scenes, 2 days, $21,149 budget): 16.1s total
- **`RED LINE METRO`** (10 scenes, 3 days, $31,330 budget): 26.4s total
- **5-Step Producer Revision Loop**: 28.3s total across all 5 cascading diff passes

### Benchmark 3: Mathematical Ledger Invariants
- **Line Items Recomputed:** 28 / 28 (100% pure math match)
- **Subtotals Recomputed:** 7 / 7 (100% pure math match)
- **Contingency Rate:** Exactly 10.00%
- **TracesTo Resolution:** 28 / 28 lines resolve to verified breakdown elements
- **Schedule Day-Before-Night Turnaround:** 0 violations
- **Schedule Setup Floor:** Minimum 3/8 page applied to all scenes

---

## Known Limitations & Production Guidance for Sep 5 Bake
1. **Parallel Search API Credits:** Kept offline/stubbed during dogfooding per Directive Cost Controls. Live market citations verified against `sample-run.json` and unit tests.
2. **Vertex Image Quota:** Maintained under 3 total image-enabled runs. Previz card fallbacks verified functional.
3. **Turnaround Rule:** All night exterior shooting days are clustered at the end of production schedules to guarantee standard DGA 12-hour turnaround rest intervals.
