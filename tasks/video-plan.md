# Video Demonstration Plan & Recording Record — Backlot Studio

**Status**: Demonstration Video with Full Google Gemini 2.5 Flash TTS Narration Master Completed (Local File; not uploaded, published, or submitted per hackathon privacy and authorization rules).  
**Demonstrated Run Receipt**: `demo/captures/fresh_run_receipt.json` (Run ID: `run_1788844448799`, Budget Total: `$43,465`, Recorded on Deployed Revision: `backlot-studio-00019-x86`, Current Serving Revision: `backlot-studio-00019-x86`)  
**Preserved Withholding Evidence**: `demo/captures/withheld_run_receipt.json` (Run ID: `run_1788841209292`, Budget Total: `$44,510`, Recorded on Deployed Revision: `backlot-studio-00017-4f2`)  
**Production URL**: `https://backlot-studio-112519007745.us-central1.run.app`  
**Serving Revision**: `backlot-studio-00019-x86` (Serving 100% Traffic; Rollback Tag Preserved: `backlot-studio-00014-p4r`)  
**Demonstration Script**: *FREQUENCY ZERO* (2-Scene Contained Suspense Thriller by Zaeem Khan)  
**Local Export File**: `demo/backlot_studio_demo.mp4`  
**Preserved Silent Cut**: `demo/backlot_studio_demo_silent_cut.mp4`  
**Measured Duration**: `02:16.45` (136.45 seconds — strictly under the 175-second / 02:55 maximum cap)  
**Resolution & Encoding**: 1920x1080 (Full HD 16:9), H.264 (yuv420p, 30 fps), AAC Audio (48000 Hz, Stereo, 192 kbps), 8.72 MB  
**Audio / Narration**: Complete 9-segment narration track synthesized via Google Gemini 2.5 Flash Preview TTS (`gemini-2.5-flash-preview-tts` on Gemini Enterprise Agent Platform / Vertex AI, Voice: `Fenrir`). Master audio leveled to **-2.5 dB peak** (Mean: **-23.2 dB**, broadcast standard). All 9 segment transitions enforce positive inter-clip gaps with zero overlaps verified programmatically. *Human listening verification: NOT VERIFIED (headless agent environment without auditory interface).*  

---

## Authenticity & Grounding Invariants

1. **Zero Non-Google AI (§7.B)**: Orchestrated exclusively across Google Gemini 3.5 Flash, Gemini 3.1 Flash, and Gemini 2.5 Flash on Google Cloud Run via Google Gen AI SDK.
2. **Deterministic Ledger Math**: Budget and schedule arithmetic is computed deterministically in pure TypeScript, while Gemini may receive computed totals for greenlight synthesis. Never route arithmetic or financial formulas through an LLM. 75 unit tests verify ledger calculation and schema contracts.
3. **Parallel Partner Search Evidence**: Real-time market comps and verified citations retrieved at runtime from Parallel Search API.
4. **Partitioned Recommendation & Physical Feasibility**: Source-Backed Production Recommendation strictly separates the retrieved factual finding from inferred producer advice. Unsupported diversions from script-required crew are withheld entirely by the shared validator.
5. **Interactive Cross-Artifact Provenance**: Demonstrated budget navigation from recommendation to Account 6000 *Sound Design, Foley & Mix* line item ($650.00 flat), confirming that opening and dismissing the audit inspector leaves ledger arithmetic invariant ($43,465.00).

---

## Timed Demonstration Flow & Measured Audio Synchronization (136.45s)

| Segment | Video Time Window | Audio Start | Speech Duration | Audio Finish | Next Audio Start | Gap / Slack | Verification |
|---|---|---|---|---|---|---|:---:|
| **1. Title Card** | 00:00.0 – 00:06.0 | 0.10s | 6.33s | 6.43s | 6.50s | +0.07s | ZERO OVERLAP |
| **2. Cold Open & Script** | 00:06.0 – 00:16.0 | 6.50s | 10.25s | 16.75s | 17.00s | +0.25s | ZERO OVERLAP |
| **3. Dispatch & Telemetry** | 00:16.0 – 00:34.0 | 17.00s | 15.77s | 32.77s | 35.00s | +2.23s | ZERO OVERLAP |
| **4. Invariant Ledger** | 00:35.0 – 00:68.0 | 35.00s | 13.57s | 48.57s | 70.00s | +21.43s | ZERO OVERLAP |
| **5. Market Intelligence** | 01:08.0 – 01:23.0 | 70.00s | 13.49s | 83.49s | 83.50s | +0.01s | ZERO OVERLAP |
| **6. Budget Inspection** | 01:23.5 – 01:38.0 | 83.50s | 14.09s | 97.59s | 99.50s | +1.91s | ZERO OVERLAP |
| **7. Deliverables Tour** | 01:39.5 – 01:54.0 | 99.50s | 12.25s | 111.75s | 115.00s | +3.25s | ZERO OVERLAP |
| **8. External Source Web** | 01:55.0 – 02:08.0 | 115.00s | 8.37s | 123.37s | 129.80s | +6.43s | ZERO OVERLAP |
| **9. Audit End Card** | 02:09.8 – 02:16.2 | 129.80s | 6.65s | 136.45s | End (136.45s) | +0.00s | ZERO OVERLAP |

---

## File Manifest & Export Verification

| File Path | Description | Format | Size |
|---|---|---|---|
| `demo/backlot_studio_demo.mp4` | Master narrated demonstration video (Google Gemini TTS) | 1920x1080 H.264 + AAC Stereo (30fps) | 8.72 MB |
| `demo/backlot_studio_demo_silent_cut.mp4` | Preserved original silent export | 1920x1080 H.264 MP4 (30fps) | 6.02 MB |
| `demo/narration_script.md` | Timecoded voiceover narration script & sync guide | Markdown | 9.2 KB |
| `demo/title_card.html` / `demo/title_card.png` | Studio title card asset | HTML5 / PNG (1920x1080) | 166 KB |
| `demo/end_card.html` / `demo/end_card.png` | Production audit receipt end card | HTML5 / PNG (1920x1080) | 136 KB |
| `demo/captures/fresh_master_run.webm` | Continuous master capture from Cloud Run | 1920x1080 WebM | 4.02 MB |
| `demo/captures/fresh_run_receipt.json` | Live run verification receipt | JSON | 1.8 KB |
| `demo/captures/withheld_run_receipt.json` | Preserved withholding negative outcome receipt | JSON | 1.2 KB |
| `demo/final_frames/` | Keyframe verification PNG captures | 1920x1080 PNGs | 13.0 MB |
