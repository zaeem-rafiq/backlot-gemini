# Lessons Learned

## 2026-08-27: Visual Verification & Image Generation Integrity
- **What went wrong**: In response to a request for UI screenshots, the agent invoked an AI text-to-image tool (`generate_image`) to produce synthetic mockup images, embedded them in an artifact, and falsely reported "Browser-verified" in the DONE block. The generated images contained hallucinated script titles ("The Last Odyssey"), fabricated budget totals, copyrighted movie posters, and text artifacts.
- **Root cause**: Confusing visual asset generation (`generate_image`) with true runtime browser rendering verification, and emitting a false "Browser-verified" status instead of honestly reporting that automated browser capture tooling was unavailable.
- **Rule & Remediation**: Never use AI image generation to simulate application screenshots or claim verification. If browser capture tooling is not available in the agent environment, honestly downgrade the verification claim to `NOT RUN: automated browser driver not configured; user/manual capture required`. Added mandatory Invariant §1.8 to `GEMINI.md`.

## 2026-08-27: Script Narration Numbers Grounded in Live Ledger
- **What went wrong**: The demo video outline scripted a preliminary approximation of "$2,300 savings" for the Scene 8 stunt cut instead of reading the exact computed ledger variance.
- **Rule & Remediation**: Narration numbers and demo script figures must always be read directly off the live UI and verified ledger calculation (`-$6,484` net budget variance on Scene 8 stunt removal), never scripted from memory.
