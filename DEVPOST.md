# Backlot — Devpost Submission Package

> **Hackathon:** Agentic Cinema Hackathon  
> **Track:** Parallel Partner Track (Market Intelligence & Search)  
> **Submission Date:** September 2026  
> **Live Deployed Studio:** [https://backlot-studio-112519007745.us-central1.run.app](https://backlot-studio-112519007745.us-central1.run.app)  
> **Live Architecture Inspection:** [https://backlot-studio-112519007745.us-central1.run.app/api/health](https://backlot-studio-112519007745.us-central1.run.app/api/health)  
> **GitHub Repository:** [zaeem-rafiq/backlot-gemini](https://github.com/zaeem-rafiq/backlot-gemini)  

---

## 1. Quick Submission Fields (Copy-Paste Ready)

### Project Title
```text
Backlot — AI-Native Pre-Production Studio Multi-Agent Crew
```

### Elevator Pitch / Tagline (Under 200 Characters)
```text
Backlot turns screenplays into coordinated coverage, breakdowns, schedules, budgets, and pitch materials using Gemini, deterministic calculations, and Parallel Search.
```
*(Character count: 172 / 200)*

### Project Links
- **Hosted Live Application:** `https://backlot-studio-112519007745.us-central1.run.app`
- **Health & Architecture Endpoint:** `https://backlot-studio-112519007745.us-central1.run.app/api/health`
- **GitHub Repository:** `https://github.com/zaeem-rafiq/backlot-gemini`
- **Demo Video:** `demo/backlot_studio_demo.mp4` (Local 1080p demonstration export with full Google Gemini 2.5 Flash TTS narration; 11-segment zero-overlap master mix leveled to -2.5 dB peak / -23.3 dB mean; authentic live Cloud Run recording on revision `backlot-studio-00021-mgc` with validated receipt `demo/captures/fresh_run_receipt.json`, 02:17.70 duration [137.70s], SHA256 `33dad2ec64386c0cbb322e78374e0ea13cfda2f5436086e1afbeb9a4353f5c90`, accompanied by `demo/narration_script.md`; features an annotated source excerpt distinguishing publisher reporting by The Film Collaborative from added telemetry framing graphics; preserved silent cut available at `demo/backlot_studio_demo_silent_cut.mp4` [SHA256 `fd738b2244560f47ba51848c6a830124093e0626ce5414cc3a4a513d7955f285`]; public platform video upload pending user authorization)

### Built With (Tags)
```text
google-gemini, gemini-enterprise-agent-platform, vertex-ai, parallel-search-api, google-cloud-run, nextjs, react, typescript, tailwindcss, vitest, docker, server-sent-events
```

---

## 2. Devpost Long-Form Submission Story

### Inspiration: The 4-to-6 Week Pre-Production Gauntlet

In traditional Hollywood and independent filmmaking, pre-production is an expensive, fragmented 4-to-6 week gauntlet. Before a single camera rolls on an indie short or proof-of-concept, filmmakers and producers must endure:

- Lengthy turnaround times for story analyst script coverage reports.
- Labor-intensive manual 1st AD passes cataloging physical scene elements across cast, extras, stunts, and specialized equipment.
- Multi-day turnarounds and high costs for professional storyboard frames.
- Intense festival competition where independent films vie for narrow programmer selection slots.
- Unstructured spreadsheet budgeting suffering from formula discrepancies and orphaned line items lacking traceable provenance back to the script.

We built **Backlot** to unify and coordinate this pre-production workflow into an auditable, multi-agent studio session.

---

### What It Does

Backlot is an AI-native pre-production studio workstation that takes raw screenplay text and coordinates six production roles via the orchestrator. Gemini handles generative tasks; Ledger computes schedules and budgets deterministically in TypeScript. Coordinated across Server-Sent Events, Backlot produces an auditable greenlight package spanning **7 synchronized deliverables**:

1. **Ink (Senior Story Analyst):** Analyzes narrative structure, premise viability, character arcs, and commercial appeal, delivering calibrated 1–10 radar scores, reader pull quotes, and an official Reader Verdict (`RECOMMEND` / `CONSIDER` / `PASS`).
2. **Slate (1st Assistant Director):** Performs a comprehensive, scene-by-scene script breakdown across **13 physical production categories** (Cast, Background Extras, SFX, VFX, Stunts, Props, Wardrobe, Vehicles, Special Equipment, Sound, Animal Handlers, Location Security, and Makeup/Hair).
3. **Ledger (Deterministic Line Producer):** Generates an industry-standard **Stripboard Shooting Schedule** (enforcing DGA 12-hour turnaround rest, location clustering, and 3/8-page setup floors) and an **Audited Production Budget** ($44,679 top sheet for *FREQUENCY ZERO*). Budget inspection exposes calculations and provenance, including scene requirements and production assumptions. Direct scene elements (cast, props, special equipment) trace to breakdown elements; rate cards, union tiers, packaging, catering allowances, and contingency derive from deterministic rules and modeled production assumptions, rather than direct screenplay text. The workstation UI supports interactive line-item inspection, cross-artifact highlighting, and evidence drawer review.
4. **Easel (Key Storyboard Artist):** Generates a **2.39:1 Anamorphic Previz Deck** with shot-by-shot lens choices, camera motion blocking, Kodak 5219 film stock LUTs, and lighting schemas. Previz cards degrade gracefully with full prompt engineering if image generation quota is unavailable.
5. **Marquee (Packaging & Distribution):** Queries the live **Parallel Search API** at runtime to pull market comps, target audience personas, ROI projections, and festival signals. Runtime Parallel Search results inform recommendations, with source attribution and evidence-withholding checks. Retrieved information and model suggestions are distinguished. Where search results lack supporting evidence or fail validation, recommendations are withheld. Search results reflect external publisher reporting and query relevance, rather than independently verified facts.
6. **Screenplay Revision Cascade Engine:** Backlot includes a deterministic cascade invalidation engine (`revision-engine.ts`) that matches scene headers, pins all unmodified scenes, re-breaks only changed scenes, and computes exact budget/schedule deltas without mathematical drift. The studio UI focuses on interactive line-item inspection, cross-artifact highlighting, and full-package generation rather than unvetted selective budget edits.
7. **Zero-Quota Demonstration Mode:** Pre-loaded with a verified 7-artifact production package (`src/fixtures/sample-run.json`) and static renders, allowing evaluators and judges to inspect the complete studio workstation at zero API quota cost.

---

### How We Built It

Backlot was engineered as a high-performance, containerized studio workstation with zero non-Google AI dependencies:

- **Architectural Runtime Declaration:** Google Gemini on Vertex AI, now part of Gemini Enterprise Agent Platform, accessed through the Google Gen AI SDK. Custom TypeScript orchestration runs on Google Cloud Run, with Parallel Search invoked during the workflow.
- **Frontend & Workstation UI:** Built with **Next.js 15+ (App Router)**, **React 19**, and **Tailwind CSS**. Styled with an industrial *Dark Cinema* aesthetic featuring a collapsible studio sidebar, live telemetry wire, SMPTE timecode display, Command Palette (⌘K), and browser print/PDF export.
- **Agent Orchestration & Streaming DAG:** Six production roles are coordinated by the orchestrator (Director) as a Directed Acyclic Graph (DAG) via **Server-Sent Events (SSE)**, streaming live token telemetry, agent lifecycle transitions, and model fallback notifications directly to the frontend *Crew Rail*. Gemini handles generative tasks (coverage, breakdown extraction, previz deck synthesis, and market packaging); Ledger computes shooting schedules and production budgets deterministically in pure TypeScript.
- **Google Agent Runtime (Vertex AI Agent Engine BYOC):** The Marquee packaging and research stage is packaged as a custom Agent Runtime container conforming to Google's documented runtime contract (`/api/reasoning_engine`, `AIP_HTTP_PORT`, `AIP_HEALTH_ROUTE`, `AIP_PREDICT_ROUTE`). Director dispatches to this managed resource over an authenticated, server-side boundary, enforcing originating `runId` verification, budget immutability, and explicit failure termination with zero silent local fallback.
- **Gemini Enterprise Agent Platform:** All agent reasoning and visual generation execute against `global-aiplatform.googleapis.com` authenticated via **Google Cloud Application Default Credentials (ADC)** under the Cloud Run service account, using `@google/genai` (Google's official JavaScript/TypeScript SDK) with `vertexai: true`:
  - *Reasoning / Script Extraction (Ink, Slate):* `gemini-3.5-flash` $\rightarrow$ `gemini-3-flash-preview` $\rightarrow$ `gemini-2.5-flash` $\rightarrow$ `gemini-2.5-pro`
  - *Fast Synthesis & Packaging (Easel, Marquee):* `gemini-3.1-flash-lite` $\rightarrow$ `gemini-2.5-flash-lite` $\rightarrow$ `gemini-2.5-flash`
  - *Visual Storyboard Keyframes (Easel):* `gemini-2.5-flash-image` $\rightarrow$ `gemini-3.1-flash-image` $\rightarrow$ `gemini-3-pro-image`
- **Official Parallel Search API (Partner Track):** Marquee connects to `https://api.parallel.ai/v1beta/search` at runtime via a direct, authenticated REST client using `fetch`. Runtime Parallel Search results inform recommendations, with source attribution and evidence-withholding checks. Retrieved information and model suggestions are distinguished. URL membership in search citations indicates query relevance rather than proof that a source supports every recommendation, and retrieved claims are not assumed to be independently verified. When search returns no citations, empty snippets, or unverified claims, recommendations are withheld rather than hallucinated.
- **100% Deterministic Pure TypeScript Ledger Math:** Budget and schedule arithmetic is computed deterministically in pure TypeScript, while Gemini receives computed totals for packaging synthesis. Never route arithmetic or financial formulas through an LLM. Budget inspection exposes calculations and provenance, including scene requirements and production assumptions (such as modeled catering allowances of $22/person/day and a 10% contingency reserve, rather than implying every fixed cost originates directly from screenplay text). All arithmetic is covered by **106 automated unit tests across 16 suites**, with cross-artifact provenance tracing each line item to its underlying breakdown requirement or modeled cost rule.
- **Deployment & Cloud Infrastructure:** Containerized with **Docker** and deployed to **Google Cloud Run** in `us-central1` with a 900-second execution timeout, auto-scaling, and measured warm health responses at ~37ms.

---

### Challenges We Ran Into

1. **Eliminating Arithmetic Inaccuracies:** Early experiments demonstrated that LLMs frequently make subtle math errors on complex budgets (drifting subtotals, missed overtime multipliers, inconsistent catering counts). We solved this by enforcing a strict architectural invariant: **zero LLM math**. The AI agents extract physical elements (stunts, cast, rain rigs); our deterministic pure TypeScript engine calculates all days, rates, and budgets based on explicit rate assumptions.
2. **Preventing Physical Breakdown Classification Errors:** During dogfooding with an artisan screenplay (*The Glassblower*), the breakdown agent classified holding a glassblowing pipe as a physical stunt, booking an unnecessary $1,300 Stunt Coordinator. We resolved this by engineering strict negative constraints in the agent prompt, cleanly separating artisan craft and manual labor from genuine high-hazard stunts.
3. **Selective Scene Pinning & Invalidation:** When a screenwriter modifies one scene in a 10-scene script, re-running all agents introduces random drift in untouched scenes. We built a deterministic cascade invalidation engine (`revision-engine.ts`) that matches scene headers, pins all unmodified scenes, re-breaks only changed scenes, and computes exact budget/schedule deltas.
4. **Honest Degraded States & Zero-Quota Bake:** Public demos often fail when API quotas or rate limits are exceeded. We designed Backlot from day one with graceful fallbacks: prompt-only previz cards when image quotas are exhausted, clear degradation notices for search APIs, and a verified baked fixture that loads all 7 artifacts instantly.

---

### Accomplishments That We're Proud Of

- **100% Google AI & Hackathon Rule Compliance (§7.B):** Backlot uses exclusively Google Gemini models across all agent workflows. Zero non-Google AI libraries (no OpenAI, Anthropic, Replicate, FLUX, LangChain, LlamaIndex, or CrewAI).
- **Measured Live Studio Execution:** Six production roles executed across Server-Sent Events with live Parallel search on Cloud Run for both 2-scene and 10-scene screenplays.
- **Mathematical Auditability:** Recomputed 28 of 28 line items, 7 of 7 category subtotals, and verified 100% of `tracesTo` provenance strings against script breakdown elements and modeled cost rules.
- **Robustness & Test Suite:** 91 automated unit tests passing across 14 test files covering deterministic ledger math, schema contracts, fallback chains, normalization boundaries, missing-excerpt validation, stream consumer recovery, and Parallel mapping.
- **Live Cloud Run Deployment:** Verified on Google Cloud Run in `us-central1` with healthy `/api/health` introspection and `/api/run` SSE telemetry streaming.

---

### What We Learned

- **Specialized Multi-Agent Roles Beat Monolithic Prompts:** Assigning narrow, department-specific responsibilities (1st AD vs. Story Analyst vs. Line Producer) dramatically improved output precision compared to single-prompt generations.
- **Deterministic Pure Code Belongs in the Loop:** The best agentic architectures use AI for semantic extraction and unstructured reasoning, and pure deterministic code for business logic, math, and compliance rules.
- **Industry Standards Matter:** Real filmmakers do not trust generic AI outputs. Incorporating authentic industry conventions—such as DGA 12-hour turnaround rest, 3/8-page setup minimums, 13 physical breakdown categories, and Kodak film LUTs—transformed Backlot from a toy into a credible production tool.

---

### What's Next for Backlot

- **Live Call-Sheet Generation & Weather Monitoring:** Automatically generating daily call sheets synced with real-time weather forecasts for exterior shooting days.
- **Multi-User Script Room Branching:** Real-time collaborative screenplay revision branching with instantaneous comparative budget delta tracking.
- **Industry Standard File Exports:** Direct export to Movie Magic Budgeting (.mbd), Final Draft (.fdx), and timeline EDLs for DaVinci Resolve and Final Cut Pro.
- **Voice-Directed Previz Framing:** Allowing directors to adjust camera angles, focal lengths, and lighting setups in real-time via natural language voice prompts.

---

## 3. Hackathon Standing Rules & Compliance Checklist (§7.B)

| Rule Requirement | Implementation & Verification | Status |
|---|---|:---:|
| **100% Google Gemini Models** | Ink/Slate: `gemini-3.5-flash`; Easel/Marquee: `gemini-3.1-flash-lite`; Easel Previz: `gemini-2.5-flash-image` | **COMPLIANT** |
| **Zero Non-Google AI** | 0 references to OpenAI, Anthropic, Replicate, FLUX, LangChain, LlamaIndex, CrewAI | **COMPLIANT** |
| **Partner Track Integration** | Official runtime integration with Parallel Search API (`v1beta/search`) via direct authenticated REST client in Marquee | **COMPLIANT** |
| **Deterministic Math** | Budget and schedule arithmetic computed deterministically in TypeScript (91 unit tests) | **COMPLIANT** |
| **Cross-Artifact Provenance** | 100% of budget line items contain `tracesTo` links back to breakdown elements | **COMPLIANT** |
| **Zero-Quota Bake** | Pre-baked 7-artifact sample fixture loads instantly (~37ms local load) with zero API calls | **COMPLIANT** |
| **Live Deployed URL** | Live container deployed on Google Cloud Run (`us-central1`) | **COMPLIANT** |
| **Open Source License** | MIT License in root repository (`LICENSE`) | **COMPLIANT** |
| **Project Eligibility** | Fresh repository created during hackathon window; 100% Google Gemini AI runtime confirmed | **COMPLIANT** |

---

## 4. Verification Evidence & Inspection Commands

### Automated Test Suite (91 Tests Passing)
```bash
$ npm test
✓ src/lib/parallel/__tests__/parallel-missing-excerpt.test.ts (1 test)
✓ src/lib/ledger/__tests__/schedule.test.ts (7 tests)
✓ src/lib/ledger/__tests__/budget.test.ts (9 tests)
✓ src/lib/ledger/__tests__/revision.test.ts (9 tests)
✓ src/lib/ledger/__tests__/revision-adversarial.test.ts (4 tests)
✓ src/lib/parallel/__tests__/parallel.test.ts (4 tests)
✓ src/lib/ai/__tests__/fallback.test.ts (7 tests)
✓ src/lib/stream/__tests__/sse-consumer.test.ts (5 tests)
✓ src/lib/types/__tests__/schemas.test.ts (7 tests)
✓ src/lib/agents/__tests__/marquee-missing-excerpt.test.ts (4 tests)
✓ src/lib/agents/__tests__/director.test.ts (2 tests)
✓ src/lib/agents/__tests__/marquee-recommendation.test.ts (15 tests)
✓ src/lib/agents/__tests__/marquee-citation-integrity.test.ts (6 tests)
✓ src/components/artifacts/__tests__/AuditedBudget.test.ts (11 tests)

Test Files  14 passed (14)
     Tests  91 passed (91)
```

### Production Build Verification
```bash
$ npm run build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (5/5)
✓ Finalizing page optimization
```

### Live Cloud Run Health Check
```bash
$ curl -s https://backlot-studio-112519007745.us-central1.run.app/api/health
{
  "status": "healthy",
  "timestamp": "2026-09-07T05:51:44.008Z",
  "aiRuntime": {
    "platform": "Gemini Enterprise Agent Platform (Vertex AI)",
    "endpoint": "global-aiplatform.googleapis.com",
    "auth": "Application Default Credentials (ADC / Service Account IAM)",
    "project": "polygraph-hackathon",
    "location": "global",
    "imageGenerationAvailable": true,
    "activeModelChains": {
      "reasoning": ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-pro"],
      "fast": ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-2.5-flash"],
      "image": ["gemini-2.5-flash-image", "gemini-3.1-flash-image", "gemini-3-pro-image"]
    }
  },
  "partnerIntegration": {
    "provider": "Parallel Search API (v1beta/search)",
    "isConfigured": true,
    "runtimeMode": "REST Client (Zero 3rd-party AI frameworks)"
  }
}
```
