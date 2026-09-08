# Video Demonstration Plan & Recording Record — Backlot Studio

**Status**: Demonstration Video with Full Google Gemini 2.5 Flash TTS Narration Master Completed (Local File; not uploaded, published, or submitted per hackathon privacy and authorization rules).  
**Demonstrated Run Receipt**: `demo/captures/fresh_run_receipt.json` (Run ID: `run_1788841209292`, Budget Total: `$44,510`, Recorded on Deployed Revision: `backlot-studio-00017-4f2`, Current Serving Revision: `backlot-studio-00018-rnt`)  
**Production URL**: `https://backlot-studio-112519007745.us-central1.run.app`  
**Serving Revision**: `backlot-studio-00018-rnt` (Serving 100% Traffic; Rollback Tag Preserved: `backlot-studio-00014-p4r`)  
**Demonstration Script**: *FREQUENCY ZERO* (2-Scene Contained Suspense Thriller by Zaeem Khan)  
**Local Export File**: `demo/backlot_studio_demo.mp4`  
**Preserved Silent Cut**: `demo/backlot_studio_demo_silent_cut.mp4`  
**Measured Duration**: `02:09.65` (129.65 seconds — strictly under the 175-second / 02:55 maximum cap)  
**Resolution & Encoding**: 1920x1080 (Full HD 16:9), H.264 (yuv420p, 30 fps), AAC Audio (48000 Hz, Stereo, 192 kbps), 10.21 MB  
**Audio / Narration**: Complete 9-segment narration track synthesized via Google Gemini 2.5 Flash Preview TTS (`gemini-2.5-flash-preview-tts` on Gemini Enterprise Agent Platform / Vertex AI, Voice: `Fenrir`). Master audio leveled to **-2.5 dB peak** (Mean: **-23.0 dB**, broadcast standard). All 9 segment transitions enforce positive inter-clip gaps with zero overlaps verified programmatically. *Human listening verification: NOT VERIFIED (headless agent environment without auditory interface).*  

---

## Authenticity & Grounding Invariants

1. **Zero Non-Google AI (§7.B)**: Orchestrated exclusively across Google Gemini 3.5 Flash, Gemini 3.1 Flash, and Gemini 2.5 Flash on Google Cloud Run via Google Gen AI SDK.
2. **Deterministic Ledger Math**: Budget and schedule arithmetic is computed deterministically in pure TypeScript, while Gemini may receive computed totals for greenlight synthesis. Never route arithmetic or financial formulas through an LLM. 73 unit tests verify ledger calculation and schema contracts.
3. **Parallel Partner Search Evidence**: Real-time market comps and verified citations retrieved at runtime from Parallel Search API.
4. **Partitioned Recommendation & Physical Feasibility**: Source-Backed Production Recommendation strictly separates the retrieved factual finding from inferred producer advice. Unsupported diversions from script-required crew are withheld entirely by the shared validator.
5. **Interactive Cross-Artifact Provenance**: Demonstrated budget navigation from recommendation to Account 6000 *Sound Design, Foley & Mix* line item ($650.00 flat), confirming that opening and dismissing the audit inspector leaves ledger arithmetic invariant.

---

## Timed Demonstration Flow & Measured Audio Synchronization (129.65s)

| Segment | Video Time Window | Audio Start | Speech Duration | Audio Finish | Next Audio Start | Gap / Slack | Verification |
|---|---|---|---|---|---|---|:---:|
| **1. Title Card** | 00:00.0 – 00:06.5 | 0.10s | 6.25s | 6.35s | 6.80s | +0.45s | ZERO OVERLAP |
| **2. Cold Open & Script** | 00:06.5 – 00:17.5 | 6.80s | 9.09s | 15.89s | 18.80s | +2.91s | ZERO OVERLAP |
| **3. Dispatch & Telemetry** | 00:17.5 – 00:36.5 | 18.80s | 16.25s | 35.05s | 38.00s | +2.95s | ZERO OVERLAP |
| **4. Invariant Ledger** | 00:36.5 – 00:53.0 | 38.00s | 13.65s | 51.65s | 69.50s | +17.85s | ZERO OVERLAP |
| **5. Market Intelligence** | 00:53.0 – 01:23.0 | 69.50s | 12.61s | 82.11s | 84.00s | +1.89s | ZERO OVERLAP |
| **6. Budget Inspection** | 01:23.0 – 01:38.0 | 84.00s | 14.49s | 98.49s | 99.00s | +0.51s | ZERO OVERLAP |
| **7. Deliverables Tour** | 01:38.0 – 01:51.0 | 99.00s | 12.05s | 111.05s | 112.00s | +0.95s | ZERO OVERLAP |
| **8. External Source Web** | 01:51.0 – 02:02.0 | 112.00s | 8.41s | 120.41s | 123.00s | +2.59s | ZERO OVERLAP |
| **9. Audit End Card** | 02:02.0 – 02:09.65 | 123.00s | 6.65s | 129.65s | End (129.65s) | +0.00s | ZERO OVERLAP |

---

## File Manifest & Export Verification

| File Path | Description | Format | Size |
|---|---|---|---|
| `demo/backlot_studio_demo.mp4` | Master narrated demonstration video (Google Gemini TTS) | 1920x1080 H.264 + AAC Stereo (30fps) | 10.21 MB |
| `demo/backlot_studio_demo_silent_cut.mp4` | Preserved original silent export | 1920x1080 H.264 MP4 (30fps) | 8.78 MB |
| `demo/narration_script.md` | Timecoded voiceover narration script & sync guide | Markdown | 5.2 KB |
| `demo/title_card.html` / `demo/title_card.png` | Studio title card asset | HTML5 / PNG (1920x1080) | 157 KB |
| `demo/end_card.html` / `demo/end_card.png` | Production audit receipt end card | HTML5 / PNG (1920x1080) | 125 KB |
| `demo/captures/backlot_master_take.webm` | Continuous master capture from Cloud Run | 1920x1080 WebM | 3.54 MB |
| `demo/captures/seg_c_source.webm` | Supporting source webpage capture | 1920x1080 WebM | 388 KB |
| `demo/captures/seg_f_health_1080.webm` | Live architecture health capture | 1920x1080 WebM | 136 KB |
| `demo/final_frames/` | Keyframe verification PNG captures | 1920x1080 PNGs | 11.2 MB |
