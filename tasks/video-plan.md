# Video Demonstration Plan & Recording Record — Backlot Studio

**Status**: Demonstration Video with Full Google Gemini 2.5 Flash TTS Narration Master Completed (Local File; not uploaded, published, or submitted per hackathon privacy and authorization rules).  
**Demonstrated Run Receipt**: `demo/captures/fresh_run_receipt.json` (Run ID: `run_1788844448799`, Budget Total: `$43,465`, Recorded on Deployed Revision: `backlot-studio-00019-x86`, Current Serving Revision: `backlot-studio-00019-x86`)  
**Preserved Withholding Evidence**: `demo/captures/withheld_run_receipt.json` (Run ID: `run_1788841209292`, Budget Total: `$44,510`, Recorded on Deployed Revision: `backlot-studio-00017-4f2`)  
**Production URL**: `https://backlot-studio-112519007745.us-central1.run.app`  
**Serving Revision**: `backlot-studio-00019-x86` (Serving 100% Traffic; Rollback Tag Preserved: `backlot-studio-00014-p4r`)  
**Demonstration Script**: *FREQUENCY ZERO* (10-Scene Contained Suspense Thriller by Zaeem Khan, 10 Pages)  
**Local Export File**: `demo/backlot_studio_demo.mp4` (SHA256: `6a0ccfe1a398a1002986cd3f4127b2ef4d8b743bde86f74eb84df2136a3da021`)  
**Preserved Silent Cut**: `demo/backlot_studio_demo_silent_cut.mp4` (SHA256: `240af70875696039b00d023ad8ddc086b32f05cb94d8090a1efb954aa0e02ead`)  
**Measured Duration**: `02:16.20` (136.20 seconds — strictly under the 175-second / 02:55 maximum cap)  
**Resolution & Encoding**: 1920x1080 (Full HD 16:9), H.264 (yuv420p, 30 fps), AAC Audio (48000 Hz, Stereo, 192 kbps), 11.41 MB  
**Audio / Narration**: Complete 10-segment narration track synthesized via Google Gemini 2.5 Flash Preview TTS (`gemini-2.5-flash-preview-tts` on Gemini Enterprise Agent Platform / Vertex AI, Voice: `Fenrir`). Master audio leveled to **-2.5 dB peak** (Mean: **-22.9 dB**, broadcast standard). All 10 segment transitions enforce positive inter-clip gaps with zero overlaps verified programmatically (maximum inter-clip pause is 9.43s, eliminating the prior 21.4s gap). *Human listening verification: NOT VERIFIED (headless agent environment without auditory interface).*  

---

## Authenticity & Grounding Invariants

1. **Zero Non-Google AI (§7.B)**: Orchestrated exclusively across Google Gemini 3.5 Flash, Gemini 3.1 Flash, and Gemini 2.5 Flash on Google Cloud Run via Google Gen AI SDK.
2. **Deterministic Ledger Math**: Budget and schedule arithmetic is computed deterministically in pure TypeScript, while Gemini receives computed totals for packaging synthesis. Never route arithmetic or financial formulas through an LLM. 85 unit tests verify ledger calculation and schema contracts.
3. **Parallel Partner Search Evidence**: Real-time market comps and verified citations retrieved at runtime from Parallel Search API.
4. **Partitioned Recommendation & Physical Feasibility**: Source-Backed Production Recommendation strictly separates the retrieved factual finding from inferred producer advice. Unsupported diversions from script-required crew are withheld entirely by the shared validator.
5. **Interactive Cross-Artifact Provenance**: Demonstrated budget navigation from recommendation to Account 6000 *Sound Design, Foley & Mix* line item ($650.00 flat), confirming that opening and dismissing the audit inspector leaves ledger arithmetic invariant ($43,465.00).

---

## Timed Demonstration Flow & Measured Audio Synchronization (136.20s)

| Segment | Video Time Window | Audio Start | Speech Duration | Audio Finish | Next Audio Start | Gap / Slack | Verification |
|---|---|---|---|---|---|---|:---:|
| **1. Title Card** | 00:00.0 – 00:06.0 | 0.10s | 5.65s | 5.75s | 6.50s | +0.25s to cut (+0.75s to next) | ZERO OVERLAP |
| **2. Cold Open & Script** | 00:06.0 – 00:16.0 | 6.50s | 9.45s | 15.95s | 17.00s | +0.05s to cut (+1.05s to next) | ZERO OVERLAP |
| **3. Dispatch & Telemetry** | 00:16.0 – 00:34.0 | 17.00s | 15.69s | 32.69s | 35.00s | +1.31s to cut (+2.31s to next) | ZERO OVERLAP |
| **4. Invariant Ledger** | 00:35.0 – 00:50.0 | 35.00s | 13.81s | 48.81s | 52.00s | +1.19s to cut (+3.19s to next) | ZERO OVERLAP |
| **5. Search Telemetry Pacing** | 00:52.0 – 00:77.0 | 52.00s | 20.57s | 72.57s | 82.00s | +4.43s to lock (+9.43s to next) | ZERO OVERLAP |
| **6. Market Intelligence** | 00:82.0 – 00:89.5 | 82.00s | 6.69s | 88.69s | 89.80s | +0.81s to cut (+1.11s to next) | ZERO OVERLAP |
| **7. Budget Inspection** | 00:89.8 – 00:99.0 | 89.80s | 8.81s | 98.61s | 99.50s | +0.39s to cut (+0.89s to next) | ZERO OVERLAP |
| **8. Deliverables Tour** | 00:99.5 – 01:19.0 | 99.50s | 11.77s | 111.27s | 120.00s | +7.73s to web (+8.73s to next) | ZERO OVERLAP |
| **9. External Source Web** | 01:20.0 – 01:29.0 | 120.00s | 8.97s | 128.97s | 129.80s | +0.03s to cut (+0.83s to next) | ZERO OVERLAP |
| **10. Audit End Card** | 01:29.8 – 01:36.2 | 129.80s | 5.05s | 134.85s | End (136.20s) | +1.35s to finish | ZERO OVERLAP |

---

## File Manifest & Export Verification

| File Path | Description | Format | Size |
|---|---|---|---|
| `demo/backlot_studio_demo.mp4` | Master narrated demonstration video (Google Gemini TTS) | 1920x1080 H.264 + AAC Stereo (30fps) | 11.41 MB |
| `demo/backlot_studio_demo_silent_cut.mp4` | Preserved original silent export | 1920x1080 H.264 MP4 (30fps) | 8.84 MB |
| `demo/narration_script.md` | Timecoded voiceover narration script & sync guide | Markdown | 9.4 KB |
| `demo/title_card.html` / `demo/title_card.png` | Studio title card asset | HTML5 / PNG (1920x1080) | 166 KB |
| `demo/end_card.html` / `demo/end_card.png` | Production audit receipt end card | HTML5 / PNG (1920x1080) | 136 KB |
| `demo/captures/fresh_master_run.webm` | Continuous master capture from Cloud Run | 1920x1080 WebM | 4.02 MB |
| `demo/captures/fresh_run_receipt.json` | Live run verification receipt | JSON | 1.8 KB |
| `demo/captures/withheld_run_receipt.json` | Preserved withholding negative outcome receipt | JSON | 1.2 KB |
| `demo/final_frames/` | Keyframe verification PNG captures | 1920x1080 PNGs | 13.0 MB |
