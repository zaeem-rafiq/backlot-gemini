# Video Demonstration Plan & Recording Record — Backlot Studio

**Status**: Demonstration Video with Full Google Gemini 2.5 Flash TTS Narration Master Completed (Local File; not uploaded, published, or submitted per hackathon privacy and authorization rules).  
**Demonstrated Run Receipt**: `demo/captures/fresh_run_receipt.json` (Run ID: `run_1788927301049`, Budget Total: `$44,679`, Recorded on Deployed Revision: `backlot-studio-00021-mgc`, Current Serving Revision: `backlot-studio-00021-mgc`)  
**Preserved Withholding Evidence**: `demo/captures/withheld_run_receipt.json` (Run ID: `run_1788841209292`, Budget Total: `$44,510`, Recorded on Deployed Revision: `backlot-studio-00017-4f2`)  
**Production URL**: `https://backlot-studio-112519007745.us-central1.run.app`  
**Serving Revision**: `backlot-studio-00021-mgc` (Serving 100% Traffic; Rollback Tag Preserved: `backlot-studio-00014-p4r`)  
**Demonstration Script**: *FREQUENCY ZERO* (10-Scene Contained Suspense Thriller by Zaeem Khan, 10 Pages)  
**Local Export File**: `demo/backlot_studio_demo.mp4` (SHA256: `33dad2ec64386c0cbb322e78374e0ea13cfda2f5436086e1afbeb9a4353f5c90`)  
**Preserved Silent Cut**: `demo/backlot_studio_demo_silent_cut.mp4` (SHA256: `fd738b2244560f47ba51848c6a830124093e0626ce5414cc3a4a513d7955f285`)  
**Measured Duration**: `02:17.70` (137.70 seconds — strictly under the 175-second / 02:55 maximum cap)  
**Resolution & Encoding**: 1920x1080 (Full HD 16:9), H.264 (yuv420p, 30 fps), AAC Audio (48000 Hz, Stereo, 192 kbps), 8.11 MB  
**Audio / Narration**: Complete 11-segment narration track synthesized via Google Gemini 2.5 Flash Preview TTS (`gemini-2.5-flash-preview-tts` on Gemini Enterprise Agent Platform / Vertex AI, Voice: `Fenrir`). Master audio leveled to **-2.5 dB peak** (Mean: **-23.3 dB**, broadcast standard). All 11 segment transitions enforce positive inter-clip gaps with zero overlaps verified programmatically (maximum inter-clip pause is 9.07s, eliminating the prior 21.4s gap). *Human listening verification: NOT VERIFIED / PENDING (headless agent environment without auditory interface).*  

---

## Authenticity & Grounding Invariants

1. **Zero Non-Google AI (§7.B)**: Orchestrated exclusively across Google Gemini 3.5 Flash, Gemini 3.1 Flash, and Gemini 2.5 Flash on Google Cloud Run via Google Gen AI SDK.
2. **Deterministic Ledger Math**: Budget and schedule arithmetic is computed deterministically in pure TypeScript, while Gemini receives computed totals for packaging synthesis. Never route arithmetic or financial formulas through an LLM. 91 unit tests verify ledger calculation and schema contracts.
3. **Parallel Partner Search Evidence**: Real-time market comps and search citations retrieved at runtime from Parallel Search API with source attribution and evidence-withholding checks. Retrieved information and model suggestions are distinguished; external claims are not assumed to be independently verified.
4. **Partitioned Recommendation & Physical Feasibility**: Source-Backed Production Recommendation strictly separates retrieved factual findings from inferred producer advice. Honest archive attribution (`The Film Collaborative (Archive: horror films, 2013)`) links directly to the cited source. Unsupported diversions from script-required crew are withheld entirely by the shared validator.
5. **Interactive Cross-Artifact Provenance**: Demonstrated budget navigation from recommendation to Account 6000 *Sound Design, Foley & Mix* line item ($650.00 flat), confirming that opening and dismissing the audit inspector leaves ledger arithmetic invariant ($44,679.00). Budget inspection exposes calculations and provenance, including scene requirements and modeled production assumptions (rather than implying every fixed cost originates directly from screenplay text).

---

## Timed Demonstration Flow & Measured Audio Synchronization (137.70s)

| Segment | Video Time Window | Audio Start | Speech Duration | Audio Finish | Next Audio Start | Gap / Slack | Verification |
|---|---|---|---|---|---|---|:---:|
| **1. Title Card** | 00:00.0 – 00:06.0 | 0.10s | 5.49s | 5.59s | 6.50s | +0.41s to cut (+0.91s to next) | ZERO OVERLAP |
| **2. Cold Open & Script** | 00:06.0 – 00:16.0 | 6.50s | 8.97s | 15.47s | 17.00s | +0.53s to cut (+1.53s to next) | ZERO OVERLAP |
| **3. Dispatch & Live SSE** | 00:16.0 – 00:34.0 | 17.00s | 16.29s | 33.29s | 35.00s | +0.71s to cut (+1.71s to next) | ZERO OVERLAP |
| **4. Invariant Ledger** | 00:35.0 – 00:50.0 | 35.00s | 11.29s | 46.29s | 54.00s | +3.71s to cut (+7.71s to next) | ZERO OVERLAP |
| **5. Search Telemetry** | 00:54.0 – 00:71.0 | 54.00s | 12.17s | 66.17s | 72.00s | +4.83s to cut (+5.83s to next) | ZERO OVERLAP |
| **6. Package Lock & Verdict** | 00:72.0 – 00:85.0 | 72.00s | 9.93s | 81.93s | 91.00s | +3.07s to cut (+9.07s to next) | ZERO OVERLAP |
| **7. Pitch Kit Recommendation** | 00:91.0 – 01:01.0 | 91.00s | 6.73s | 97.73s | 102.00s | +3.27s to cut (+4.27s to next) | ZERO OVERLAP |
| **8. Budget Audit Drawer** | 01:02.0 – 01:12.0 | 102.00s | 8.17s | 110.17s | 113.00s | +1.83s to cut (+2.83s to next) | ZERO OVERLAP |
| **9. Deliverables Tour** | 01:13.0 – 01:22.5 | 113.00s | 8.93s | 121.93s | 123.50s | +0.57s to cut (+1.57s to next) | ZERO OVERLAP |
| **10. Source Citation Web** | 01:23.07 – 01:30.70 | 123.50s | 7.13s | 130.63s | 131.00s | +0.07s to cut (+0.37s to next) | ZERO OVERLAP |
| **11. Production Audit End Card** | 01:30.70 – 01:37.70 | 131.00s | 6.13s | 137.13s | End (137.70s) | +0.57s to finish | ZERO OVERLAP |

---

## File Manifest & Export Verification

| File Path | Description | Format | Size |
|---|---|---|---|
| `demo/backlot_studio_demo.mp4` | Master narrated demonstration video (Google Gemini TTS) | 1920x1080 H.264 + AAC Stereo (30fps) | 8.11 MB |
| `demo/backlot_studio_demo_silent_cut.mp4` | Preserved original silent export | 1920x1080 H.264 MP4 (30fps) | 5.53 MB |
| `demo/narration_script.md` | Timecoded voiceover narration script & sync guide | Markdown | 9.4 KB |
| `demo/title_card.html` / `demo/title_card.png` | Studio title card asset | HTML5 / PNG (1920x1080) | 166 KB |
| `demo/end_card.html` / `demo/end_card.png` | Production audit receipt end card | HTML5 / PNG (1920x1080) | 136 KB |
| `demo/captures/fresh_master_run.webm` | Continuous master capture from Cloud Run | 1920x1080 WebM | 4.02 MB |
| `demo/captures/fresh_run_receipt.json` | Live run verification receipt | JSON | 1.8 KB |
| `demo/captures/withheld_run_receipt.json` | Preserved withholding negative outcome receipt | JSON | 1.2 KB |
| `demo/final_frames/` | Keyframe verification PNG captures | 1920x1080 PNGs | 13.0 MB |
