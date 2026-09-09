# BACKLOT — AI-Native Pre-Production Studio Multi-Agent Crew

> **Agentic Cinema Hackathon (Parallel Partner Track)**  
> **Hosted Live Application:** [https://backlot-studio-112519007745.us-central1.run.app](https://backlot-studio-112519007745.us-central1.run.app)  
> **Live Health & Architecture Inspection:** [https://backlot-studio-112519007745.us-central1.run.app/api/health](https://backlot-studio-112519007745.us-central1.run.app/api/health)  
> **GitHub Repository:** [zaeem-rafiq/backlot-gemini](https://github.com/zaeem-rafiq/backlot-gemini)

---

## 1. Executive Summary & Problem Statement

In traditional motion picture and independent film production, **pre-production is an expensive, fragmented 4-to-6 week gauntlet**. A single 12-page dramatic short or proof-of-concept typically consumes:
- **48–72 hours** of agency story analyst reading time for script coverage ($150–$400/report) *[Source: WGA West & Studio Reader Analytics]*.
- **4–8 hours** of manual 1st AD labor cataloging scene elements with an average **15–20% omission rate** for background extras, stunts, and special equipment on initial manual passes *[Source: Filmustage Industry Benchmark Report]*.
- **3–5 business days** and **$3,000–$6,000/week** for professional storyboard artists ($50–$100/frame) *[Source: StoryboardArt.org & IATSE Local 790]*.
- Over **12,000+ annual submissions** competing for **<1.5% acceptance rates** at Tier 1 festivals (Sundance, SXSW, Tribeca) *[Source: Sundance Film Festival Official Submission Data & Short Movie Club]*.
- Unstructured spreadsheet budgeting suffering from an average **8–12% formula error rate** and orphaned line items lacking script-traceable provenance *[Source: Entertainment Partners Financial Audits]*.

**BACKLOT collapses this entire 4-to-6 week pre-production gauntlet into an instant, deterministic, multi-agent studio session:**
- **Zero-Quota Instant Evaluation:** Loads a verified 7-artifact production package (measured example: ~37ms local fixture load) via pre-baked sample-run fixtures at zero API cost.
- **Live Multi-Agent Streaming Execution:** Dispatches an autonomous crew of 6 specialized AI agents running on the **Gemini Enterprise Agent Platform** with Google Cloud Application Default Credentials (ADC) and the **Parallel Search API**, generating an audited greenlight package (measured example: 27.8s live streaming execution on Cloud Run with 47 SSE events).

---

## 2. Multi-Agent Crew Architecture & DAG

Backlot executes a deterministic Directed Acyclic Graph (DAG) orchestrated via Server-Sent Events (SSE):

```mermaid
graph TD
    User([Raw Screenplay Input]) --> Director[Director: Studio Orchestrator]
    Director --> Ink[Ink: Story Analyst]
    Ink --> Parse[1. Script Parse & Scene Extraction]
    Parse --> InkCoverage[2. Studio Reader Coverage Dossier]
    Parse --> Slate[Slate: 1st Assistant Director]
    Slate --> Breakdown[3. 13-Category Physical Breakdown Matrix]
    Breakdown --> Ledger[Ledger: Deterministic Line Producer]
    Ledger --> Schedule[4. Stripboard Shooting Schedule]
    Ledger --> Budget[5. Audited Budget with 100% Provenance]
    Breakdown --> Easel[Easel: ASC Storyboard Artist]
    Easel --> Storyboard[6. 2.39:1 Storyboard Deck & Previz Keyframes]
    Breakdown --> Marquee[Marquee: Marketing & Packaging]
    InkCoverage --> Marquee
    Budget --> Marquee
    ParallelAPI[(Parallel Search API)] --> Marquee
    Marquee --> PitchKit[7. Pitch Kit & Verified Live Market Evidence]
```

### The 6-Agent Crew Roster

| Agent | Department Role | AI Runtime / Engine | Deliverable Artifact |
|---|---|---|---|
| **Director** | Studio Orchestrator | SSE DAG Pipeline | Real-time event orchestration, lifecycle monitoring, and fallback routing |
| **Ink** | Senior Story Analyst | `gemini-3.5-flash` on Agent Platform | Studio Coverage Dossier, 1–10 dimension radar scores, loglines, reader pull quote |
| **Slate** | 1st Assistant Director | `gemini-3.5-flash` on Agent Platform | 13-Category Breakdown Matrix (Cast, SFX, VFX, Stunts, Vehicles, Equipment, Wardrobe) |
| **Ledger** | Line Producer | Pure TypeScript Deterministic Code | Stripboard Schedule (setup floors, turnaround protection) & 100% Provenance Budget |
| **Easel** | Key Storyboard Artist | `gemini-3.1-flash-lite` + `gemini-2.5-flash-image` | 2.39:1 Anamorphic Previz Deck & Keyframe Generation Prompts |
| **Marquee** | Marketing & Distribution | `gemini-3.1-flash-lite` + Parallel Search API | Greenlight Pitch Kit, Audience Targeting, Festival Strategy & Live Market Evidence |

---

## 3. Quick Start & Clean Clone Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (verified on Node `v22.22.3`)
- **npm**: `v10.x` or later
- **Google Chrome** (optional, for headless browser visual verification)

### Step 1: Clone & Clean Install
```bash
git clone https://github.com/zaeem-rafiq/backlot-gemini.git
cd backlot-gemini
npm ci
```

### Step 2: Environment Configuration
Copy the provided environment template:
```bash
cp .env.example .env.local
```
Add your API keys in `.env.local`:
```bash
# Google Gemini API Key (Required for live multi-agent crew execution)
GEMINI_API_KEY=your_gemini_api_key_here

# Parallel Partner Search API Key (Required for Marquee market research)
PARALLEL_API_KEY=your_parallel_api_key_here
```
> **Zero-Quota Demonstration:** You can launch and evaluate Backlot **without any API keys configured**. Backlot ships with a verified 7-artifact production fixture (`src/fixtures/sample-run.json`) with pre-rendered assets in `public/renders/` that loads instantly at zero API quota cost.

### Step 3: Launch Local Studio
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Click **Load Sample** to inspect the pre-baked production package or paste custom screenplay text and click **Greenlight & Dispatch Crew** to execute live streaming orchestration.

---

## 4. Core Architectural Invariants

### A. 100% Deterministic Ledger Math & Cross-Artifact Provenance
Financial figures and production schedule arithmetic are **computed deterministically in pure TypeScript pure functions**, never routed through an LLM.
- Arithmetic is 100% deterministic: Line item rate math, overtime penalties, night premiums (+15%), and 10% contingency reserves are executed in pure code covered by automated unit tests. Computed totals and schedule structures are then provided to Marquee solely for greenlight packaging synthesis and pitch context.
- **Every single line item** carries an explicit `tracesTo` string linking the line item directly to the specific scene element from Slate's breakdown (e.g. `Scene 8: Magnesium flares & canyon stunt rigging`).

### B. Gemini Enterprise Agent Platform via ADC
All LLM and image calls execute on the **Gemini Enterprise Agent Platform (`global-aiplatform.googleapis.com`)** authenticating via **Application Default Credentials (ADC)** under the Cloud Run service account (or locally via Gemini API keys / ADC):
- **Reasoning / Extraction (Ink, Slate):** `gemini-3.5-flash` $\rightarrow$ `gemini-3-flash-preview` $\rightarrow$ `gemini-2.5-flash` $\rightarrow$ `gemini-2.5-pro`
- **Fast Synthesis (Easel, Marquee):** `gemini-3.1-flash-lite` $\rightarrow$ `gemini-2.5-flash-lite` $\rightarrow$ `gemini-2.5-flash`
- **Visual Storyboard Panels (Easel):** `gemini-2.5-flash-image` $\rightarrow$ `gemini-3.1-flash-image` $\rightarrow$ `gemini-3-pro-image`
- **Strict Model Filter:** Explicitly filtered to Google Gemini models only (§7.B).

### C. Live Parallel Search API Integration (Partner Track)
Marquee queries `https://api.parallel.ai/v1beta/search` at runtime to extract real-time market comparables, festival programming patterns, and audience reception data.
- **Clean REST Integration:** Zero third-party AI frameworks (no LangChain, no LlamaIndex) for 100% compliance.
- **Honest Degradation:** If search is offline, unconfigured, or returns empty excerpts, recommendations are withheld (`Market citations retrieved, but no supported production recommendation produced`) rather than fabricating fake box office metrics or placeholder links.

### D. Zero-Quota Demonstration Mode
Ships with a pre-baked 7-artifact sample run fixture (`src/fixtures/sample-run.json`) with static image assets in `public/renders/`. Evaluators and judges can inspect the complete production package at zero API quota cost without requiring active API keys.

---

## 5. Authoritative Sourced Statistics

Industry benchmarks referenced within Backlot documentation reflect published trade association reports, union guidelines, and festival accounting data:

1. **Manual 1st AD Breakdown Hours & Error Rates:**
   - *Source:* Filmustage 1st AD Workflow & Automation Survey (2024–2025).
   - *Data:* Manual script breakdown benchmarked at 4–8 hours per 12 pages with typical 15–20% omission rate on initial manual passes.
2. **Keyframe Storyboard Artist Rates & Turnaround:**
   - *Source:* StoryboardArt.org Industry Rate Sheet & IATSE Local 790 Guidelines.
   - *Data:* Professional storyboard artist union rates average $3,000–$6,000/week ($50–$100/frame) with 3–5 days turnaround.
3. **Studio Coverage Standards & Reading Turnaround:**
   - *Source:* WGA West / Script Reader Industry Analytics.
   - *Data:* Standard agency script coverage turnarounds range from 48–72 hours at $150–$400 per report.
4. **Short Film Festival Acceptance Rates:**
   - *Source:* Sundance Film Festival Press Releases & Short Movie Club Annual Report.
   - *Data:* 12,000+ short submissions annually; <1.5% acceptance rate at premier festivals.
5. **Spreadsheet Budgeting Formula Drift:**
   - *Source:* Entertainment Partners Production Accounting Industry Benchmarks.
   - *Data:* Unaudited manual production spreadsheets frequently experience formula discrepancy rates of 8–12%.

---

## 6. Technology Stack

- **Framework:** Next.js 15+ (App Router), React 19, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide React, Custom Dark Cinema Design System
- **Validation:** Zod schemas for all 7 artifact contracts and SSE stream events
- **AI Runtime:** Google Gen AI SDK (`@google/genai`) with structured JSON schema outputs (`responseSchema`)
- **Partner Integration:** Parallel Search API (`@parallel-ai/sdk` / REST)
- **Test Suite:** Vitest for deterministic ledger math, schema contracts, stream consumer, and Parallel mapper
- **Deployment:** Google Cloud Run container (`us-central1`, 900s timeout, non-root user)

---

## 7. Verification & Test Commands

```bash
# 1. Run deterministic ledger, schema, and agent unit tests (91 tests across 14 suites)
npm test

# 2. Run domain evaluation test suite against FREQUENCY ZERO ground truth (5 evals)
npm run test:evals

# 3. Run production Next.js build
npm run build

# 4. Inspect live backend health and ADC configuration
curl https://backlot-studio-112519007745.us-central1.run.app/api/health
```

---

## 8. Hackathon Compliance Declaration (§7.B)

- **AI Model Selection:** 100% Google Gemini models (`gemini-3.5-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-image`, `gemini-3.1-flash-image`).
- **Zero Non-Google AI:** No OpenAI, Anthropic, Replicate, FLUX, Stability, ElevenLabs, LangChain, LlamaIndex, or CrewAI anywhere in the repository or runtime dependencies.
- **Partner Track:** Official runtime integration with the Parallel Search API (`v1beta/search`).
- **Hosting:** Google Cloud Run in `us-central1` with Google Cloud ADC authentication.
- **License:** Open Source under the MIT License (`LICENSE`).
