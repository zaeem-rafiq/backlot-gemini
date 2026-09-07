# Day 12 Video Demonstration Plan — Backlot Studio

**Status**: Planned Demonstration Script (Unrecorded / Local Plan; not recorded, uploaded, or submitted).
**Rule**: All narration numbers are read directly off the live screen and verified ledger math, never scripted from memory or synthetic speculation.
**Target Duration**: 02:55 (175 seconds max)
**Production URL**: `https://backlot-studio-112519007745.us-central1.run.app`

---

## Timed Demonstration Script (2:55 Total Runtime)

### [00:00 – 00:20] Cold Open: Target Audience & The Studio Problem (Demo Target: <20s)
- **Screen**: Backlot Studio workstation loaded in Google Chrome on Google Cloud Run (`https://backlot-studio-112519007745.us-central1.run.app`). Header displays `Studio OS v2.5` and live SMPTE timecode ticker. Screenplay manuscript for *FREQUENCY ZERO* open in Courier Prime 12pt.
- **Narration**: *"For independent filmmakers, line producers, and studio executives deciding whether to greenlight a project, pre-production is broken. Turning a screenplay manuscript into breakdowns, schedules, budgets, and pitch kits takes weeks across disconnected spreadsheets with zero financial auditability. Backlot replaces that manual grind with an AI-native studio crew powered exclusively by Google Gemini and live Parallel Search market intelligence."*

### [00:20 – 00:55] Dispatching Crew & Live Parallel Search Citations (Demo Target: <60s)
- **Screen**: Click **Greenlight & Dispatch Crew** (or open Telemetry Wire). Wire monitor shows streaming logs from `global-aiplatform.googleapis.com` under project `polygraph-hackathon`.
- **Screen Focus (<00:55)**: Switch to Marquee telemetry stream showing live Parallel Search execution (`v1beta/search`). Live comps and festival citations appear with verifiable URLs (e.g. *The Lighthouse* Box Office Mojo `https://www.boxofficemojo.com/release/rl3305670145/`, Sundance, SXSW).
- **Narration**: *"Director orchestrates six specialized studio units via Gemini on Vertex AI. Notice the telemetry wire: at runtime, Marquee executes live Parallel Search queries, pulling verified market comp and festival award citations directly into the pitch dossier. No stale training data — live web intelligence grounded by Parallel."*

### [00:55 – 01:25] Deliverable 1: Story Coverage (Ink)
- **Screen**: Select **Story Coverage** tab. Show authentic green rubber stamp: **RECOMMEND** (*"PRIORITY ACQUISITION / FAST-TRACK GREENLIGHT"*). Show pull quote: *“An electrifying masterclass in analog audio suspense.”* Scroll to Critic Diagnostic Score Matrix: Premise 9/10, Structure 9/10, Character 8/10, Dialogue 8/10, Marketability 9/10.
- **Narration**: *"Ink delivers Hollywood-standard story coverage in seconds. Our calibrated diagnostic matrix scores narrative structure, character arcs, and marketability, concluding with an executive RECOMMEND verdict and actionable development notes."*

### [01:25 – 01:45] Deliverable 2: 1st AD Physical Breakdown (Slate)
- **Screen**: Select **1st AD Breakdown** tab. Show 10 scene breakdown strips, color-coded department cards tagging 13 physical categories: Cast, Background Actors, Stunts, SFX, Sound, Props, Vehicles, and Special Equipment.
- **Narration**: *"Slate conducts a line-by-line 1st AD script breakdown across all 10 scenes, tagging all 13 standard physical production departments — from rain machines and vintage radio consoles to stunt coordinators."*

### [01:45 – 02:05] Deliverable 3: Stripboard Schedule & Magnetic Board (Ledger)
- **Screen**: Select **Stripboard Schedule** tab. Show 4-Day physical magnetic stripboard with Day/Night color coding (Day Int Canary, Night Int Steel Blue). Highlight summary stats: **4 Shoot Days**, **2 Night Shoots**, **4 Intra-day Company Moves**, **3 Principal Actors**. Expand Day 1 to highlight the 6/8-page company move deduction and cast matrix badges.
- **Narration**: *"Ledger generates a professional stripboard schedule with pure deterministic math. Location clustering groups scenes, enforces a 6/8th page deduction for company moves, accounts for night shoot differentials, and builds the full Cast Day Matrix."*

### [02:05 – 02:25] Deliverable 4: Audited Production Budget (Ledger)
- **Screen**: Select **Audited Budget** tab. Highlight Canonical Production Top Sheet: Grand Total **$34,735.00** (with 10% contingency included). Click line item `1001 Lead Actor (Elena)` to trigger the Cross-Artifact Provenance modal showing its exact `tracesTo` script origin.
- **Narration**: *"Here is Backlot's core architectural invariant: 100% pure math ledger arithmetic. No financial numbers are ever routed through an LLM. Every single dollar of our $34,735 top sheet carries an explicit `tracesTo` provenance tag linking directly back to the physical scene breakdown."*

### [02:25 – 02:45] Deliverable 5: Previz Storyboard & Pitch Kit (Easel & Marquee)
- **Screen**: Select **Previz Storyboard** tab to show 2.39:1 anamorphic cinematography cards with lens choices (35mm Anamorphic, 50mm Prime), lighting setups, and keyframe prompts. Then click **Pitch Kit & Sources** to reveal the theatrical key art concept ("Tomorrow's disaster is tonight's last broadcast.") and Marquee's **Source-Backed Production Recommendation**. Highlight the actionable producer decision to protect the $650 Sound Design line item grounded in *The Vast of Night* (Rotten Tomatoes 92% Fresh) acquisition comp, then click **Inspect in Budget** to demonstrate interactive cross-artifact navigation directly to Account 6000.
- **Narration**: *"Easel blocks shot lists with 2.39:1 aspect ratio specs, while Marquee turns live Parallel Search market signals into actionable producer recommendations. Benchmarking against The Vast of Night's festival breakout, Backlot advises protecting our $650 sound design allocation on Shoot Day 1. With one click, we inspect that exact line item in the budget ledger, closing the loop from web search to physical production decision."*

### [02:45 – 02:55] Architecture & Closing Summary
- **Screen**: Show `/api/health` endpoint on screen confirming `Gemini Enterprise Agent Platform (Vertex AI)` (`global-aiplatform.googleapis.com`), project `polygraph-hackathon`, `Parallel Search API (v1beta/search)`, and deployed Cloud Run URL (`https://backlot-studio-112519007745.us-central1.run.app`).
- **Narration**: *"Built exclusively on Google Gemini, Google Cloud Run, and Parallel Search, with 100% deterministic ledger math. Backlot turns screenplays into production-ready greenlight packages in under thirty seconds."*

