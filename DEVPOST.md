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
An AI-native pre-production studio crew powered by Google Gemini and Parallel Search that collapses weeks of film breakdown, scheduling, and budgeting into seconds with 100% mathematical auditability.
```
*(Character count: 199 / 200)*

### Project Links
- **Hosted Live Application:** `https://backlot-studio-112519007745.us-central1.run.app`
- **Health & Architecture Endpoint:** `https://backlot-studio-112519007745.us-central1.run.app/api/health`
- **GitHub Repository:** `https://github.com/zaeem-rafiq/backlot-gemini`
- **Demo Video:** `[Pending Recording/Upload — see tasks/video-plan.md for 2:55 planned script]`

### Built With (Tags)
```text
google-gemini, gemini-enterprise-agent-platform, vertex-ai, parallel-search-api, google-cloud-run, nextjs, react, typescript, tailwindcss, vitest, docker, server-sent-events
```

---

## 2. Devpost Long-Form Submission Story

### Inspiration: The 4-to-6 Week Pre-Production Gauntlet

In traditional Hollywood and independent filmmaking, pre-production is an expensive, fragmented 4-to-6 week gauntlet. Before a single camera rolls on an indie short or proof-of-concept, filmmakers and producers must endure:

- **48–72 hours** of agency story analyst reading time for script coverage ($150–$400 per report) *[Source: WGA West & Studio Reader Analytics]*.
- **4–8 hours** of manual 1st AD labor cataloging physical scene elements with an average **15–20% omission rate** for background extras, stunts, and special equipment on initial passes *[Source: Filmustage Industry Benchmark Report]*.
- **3–5 business days** and **$3,000–$6,000/week** for professional storyboard artists ($50–$100 per frame) *[Source: StoryboardArt.org & IATSE Local 790 Guidelines]*.
- Over **12,000+ annual submissions** competing for **<1.5% acceptance rates** at Tier 1 festivals like Sundance, SXSW, and Tribeca *[Source: Sundance Film Festival Official Press Data & Short Movie Club]*.
- Unstructured spreadsheet budgeting suffering from an average **8–12% formula error rate** and orphaned line items lacking traceable provenance back to the script *[Source: Entertainment Partners Financial Audits]*.

We built **Backlot** to collapse this entire pre-production ordeal into an instant, deterministic, multi-agent studio session.

---

### What It Does

Backlot is an AI-native pre-production studio workstation that takes raw screenplay text and dispatches an autonomous crew of **6 specialized AI agents** running on the **Gemini Enterprise Agent Platform** and the **Parallel Search API**. In measured live testing on Cloud Run (~27.8s streaming run), Backlot produces a complete, auditable greenlight package spanning **7 synchronized deliverables**:

1. **Ink (Senior Story Analyst):** Analyzes narrative structure, premise viability, character arcs, and commercial appeal, delivering calibrated 1–10 radar scores, reader pull quotes, and an official Reader Verdict (`RECOMMEND` / `CONSIDER` / `PASS`).
2. **Slate (1st Assistant Director):** Performs a comprehensive, scene-by-scene script breakdown across **13 physical production categories** (Cast, Background Extras, SFX, VFX, Stunts, Props, Wardrobe, Vehicles, Special Equipment, Sound, Animal Handlers, Location Security, and Makeup/Hair).
3. **Ledger (Deterministic Line Producer):** Generates an industry-standard **Stripboard Shooting Schedule** (enforcing DGA 12-hour turnaround rest, location clustering, and 3/8-page setup floors) and an **Audited Production Budget** ($34,735 top sheet for *FREQUENCY ZERO*) where **100% of line items carry explicit `tracesTo` provenance strings** linking every dollar directly to its breakdown trigger.
4. **Easel (Key Storyboard Artist):** Generates a **2.39:1 Anamorphic Previz Deck** with shot-by-shot lens choices, camera motion blocking, Kodak 5219 film stock LUTs, and lighting schemas. Previz cards degrade gracefully with full prompt engineering if image generation quota is unavailable.
5. **Marquee (Packaging & Distribution):** Queries the live **Parallel Search API** at runtime to pull real-time theatrical and festival comparables, target audience personas, ROI projections, and a curated festival submission roadmap with verified submission windows.
6. **Revision Diffing & Cascade Invalidation Engine:** When a filmmaker edits a screenplay (e.g., cutting a high-hazard stunt in Scene 8), Backlot re-analyzes only the modified scene, **pinning all 9 untouched scenes with 100% zero mathematical drift**. The Executive Delta banner immediately reports the exact computed variance (**-$6,484 net budget reduction**) and marks affected storyboard keyframes as `STALE` for selective re-render.
7. **Zero-Quota Demonstration Mode:** Pre-loaded with a verified 7-artifact production package (`src/fixtures/sample-run.json`) and static renders, allowing evaluators and judges to inspect the complete studio workstation at zero API quota cost.

---

### How We Built It

Backlot was engineered as a high-performance, containerized studio workstation with zero non-Google AI dependencies:

- **Frontend & Workstation UI:** Built with **Next.js 15+ (App Router)**, **React 19**, and **Tailwind CSS**. Styled with an industrial *Dark Cinema* aesthetic featuring a collapsible studio sidebar, live telemetry wire, SMPTE timecode display, Command Palette (⌘K), and browser print/PDF export.
- **Agent Orchestration & Streaming DAG:** The **Director** orchestrates agent execution as a Directed Acyclic Graph (DAG) via **Server-Sent Events (SSE)**, streaming live token telemetry, agent lifecycle transitions, and model fallback notifications directly to the frontend *Crew Rail*.
- **Gemini Enterprise Agent Platform:** All agent reasoning and visual generation execute against `global-aiplatform.googleapis.com` authenticated via **Google Cloud Application Default Credentials (ADC)** under the Cloud Run service account:
  - *Reasoning / Script Extraction (Ink, Slate):* `gemini-3.5-flash` $\rightarrow$ `gemini-3-flash-preview` $\rightarrow$ `gemini-2.5-flash` $\rightarrow$ `gemini-2.5-pro`
  - *Fast Synthesis & Packaging (Easel, Marquee):* `gemini-3.1-flash-lite` $\rightarrow$ `gemini-2.5-flash-lite` $\rightarrow$ `gemini-2.5-flash`
  - *Visual Storyboard Keyframes (Easel):* `gemini-2.5-flash-image` $\rightarrow$ `gemini-3.1-flash-image` $\rightarrow$ `gemini-3-pro-image`
- **Official Parallel Search API (Partner Track):** Marquee connects to `https://api.parallel.ai/v1beta/search` at runtime via a clean REST client, pulling live market comps and festival signals without bloated third-party wrappers. If the API is unconfigured, it displays an honest indicator rather than fabricating synthetic data.
- **100% Deterministic Pure TypeScript Ledger Math:** Financial calculations, night premiums (+15%), overtime thresholds, catering person-days ($22/person/day), and 10% contingency reserves are computed in pure TypeScript functions covered by **46 automated unit tests**. Financial numbers and scheduling formulas are **never routed through an LLM**.
- **Deployment & Cloud Infrastructure:** Containerized with **Docker** and deployed to **Google Cloud Run** in `us-central1` with a 900-second execution timeout, auto-scaling, and measured warm health responses at ~37ms.

---

### Challenges We Ran Into

1. **Eliminating Arithmetic Hallucinations:** Early experiments demonstrated that LLMs frequently make subtle math errors on complex budgets (drifting subtotals, missed overtime multipliers, inconsistent catering counts). We solved this by enforcing a strict architectural invariant: **zero LLM math**. The AI agents extract physical elements (stunts, cast, rain rigs); our deterministic pure TypeScript engine calculates all days, rates, and budgets.
2. **Preventing Physical Breakdown Hallucinations:** During dogfooding with an artisan screenplay (*The Glassblower*), the breakdown agent classified holding a glassblowing pipe as a physical stunt, booking an unnecessary $1,300 Stunt Coordinator. We resolved this by engineering strict negative constraints in the agent prompt, cleanly separating artisan craft and manual labor from genuine high-hazard stunts.
3. **Selective Scene Pinning & Invalidation:** When a screenwriter modifies one scene in a 10-scene script, re-running all agents introduces random drift in untouched scenes. We built a deterministic cascade invalidation engine (`revision-engine.ts`) that matches scene headers, pins all unmodified scenes, re-breaks only changed scenes, and computes exact budget/schedule deltas.
4. **Honest Degraded States & Zero-Quota Bake:** Public demos often fail when API quotas or rate limits are exceeded. We designed Backlot from day one with graceful fallbacks: prompt-only previz cards when image quotas are exhausted, clear degradation notices for search APIs, and a verified baked fixture that loads all 7 artifacts instantly.

---

### Accomplishments That We're Proud Of

- **100% Google AI & Hackathon Rule Compliance (§7.B):** Backlot uses exclusively Google Gemini models across all agent workflows. Zero non-Google AI libraries (no OpenAI, Anthropic, Replicate, FLUX, LangChain, LlamaIndex, or CrewAI).
- **Measured Live Studio Execution:** Completed a full 6-agent streaming pipeline with live Parallel search in ~27.8s on Cloud Run for a 2-scene script.
- **Mathematical Auditability:** Recomputed 28 of 28 line items, 7 of 7 category subtotals, and verified 100% of `tracesTo` provenance strings against script elements.
- **Robustness & Test Suite:** 46 automated unit tests passing across ledger math, schema contracts, fallback chains, and parallel mapping.
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
| **Partner Track Integration** | Official runtime integration with Parallel Search API (`v1beta/search`) in Marquee | **COMPLIANT** |
| **Deterministic Math** | Pure TypeScript ledger engine for all budget and schedule arithmetic (46 unit tests) | **COMPLIANT** |
| **Cross-Artifact Provenance** | 100% of budget line items contain `tracesTo` links back to breakdown elements | **COMPLIANT** |
| **Zero-Quota Bake** | Pre-baked 7-artifact sample package loads in <250ms with zero API calls | **COMPLIANT** |
| **Live Deployed URL** | Live container deployed on Google Cloud Run (`us-central1`) | **COMPLIANT** |
| **Open Source License** | MIT License in root repository (`LICENSE`) | **COMPLIANT** |

---

## 4. Verification Evidence & Inspection Commands

### Automated Test Suite (46 Tests Passing)
```bash
$ npm test
✓ src/lib/ai/__tests__/fallback.test.ts (7 tests)
✓ src/lib/parallel/__tests__/parallel.test.ts (3 tests)
✓ src/lib/ledger/__tests__/schedule.test.ts (7 tests)
✓ src/lib/ledger/__tests__/budget.test.ts (9 tests)
✓ src/lib/ledger/__tests__/revision-adversarial.test.ts (4 tests)
✓ src/lib/ledger/__tests__/revision.test.ts (9 tests)
✓ src/lib/types/__tests__/schemas.test.ts (5 tests)
✓ src/lib/agents/__tests__/director.test.ts (2 tests)

Test Files  8 passed (8)
     Tests  46 passed (46)
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
