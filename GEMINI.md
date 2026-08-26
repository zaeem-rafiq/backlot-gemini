# GEMINI.md — Project Rules for Backlot

This file defines the project-level rules, architecture invariants, and testing standards for **Backlot** — an AI-native pre-production studio multi-agent crew built for the Agentic Cinema Hackathon (Parallel Track).

---

## 1. Hackathon Standing Rules & Invariants (Mandatory)

1. **Antigravity Pinning:** Antigravity must remain pinned to Google Gemini models (`gemini-3.5-flash`, `gemini-3-flash-preview`, `gemini-2.5-flash`) at all times. Selecting non-Google models violates hackathon rules (§7.B).
2. **Zero Non-Google AI:** No non-Google AI models, agent frameworks, or APIs are permitted anywhere in the repository, builds, demo fixtures, or runtime code (no Replicate, FLUX, OpenAI, Anthropic, Stability, ElevenLabs, LangChain, LlamaIndex, CrewAI). Non-AI third-party services (Cloud Run, Next.js, Tailwind, Docker, Postgres, Vitest) and the official Parallel Partner Search API are fully permitted.
3. **Deterministic Ledger Math:** Schedule and budget arithmetic is 100% deterministic pure code with unit test coverage. Never route financial numbers or scheduling formulas through an LLM.
4. **Cross-Artifact Provenance:** Every single budget line item must carry an explicit `tracesTo` provenance string linking it directly to the specific scene element from the script breakdown that triggered it.
5. **Calibrated Sourced Statistics:** Never add industry statistics without a checkable authoritative source (e.g. WGA West, Filmustage, StoryboardArt.org, Entertainment Partners, Short Movie Club).
6. **Graceful Degradation & Zero-Quota Bake:** The studio suite must support previz cards and prompt-only fallbacks when image generation quota is unavailable, and ship with a verified baked sample run fixture (`sample-run.json`) so the hosted application is fully demonstrable at zero API quota.

---

## 2. Stack & Architecture

- **Framework:** Next.js 15+ (App Router), React 19, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide React, accessible custom design system
- **Validation:** Zod schemas for all agent payloads and stream events
- **AI Runtime:** Google Gen AI SDK (`@google/genai`) with structured JSON schema outputs (`responseSchema`)
- **Partner Integration:** Parallel Search API (`@parallel-ai/sdk` / REST) called at runtime in Marquee for market intelligence & festival signals
- **Test Suite:** Vitest for deterministic ledger (schedule & budget), agent contracts, and Parallel mapper
- **Deployment:** Google Cloud Run (containerized)

---

## 3. Verified Model Fallback Chains

- **Reasoning / Extraction (Ink, Slate):** `gemini-3.5-flash` → `gemini-3-flash-preview` → `gemini-2.5-flash`
- **Fast Generation:** `gemini-3.1-flash-lite` → `gemini-2.5-flash` → `gemini-2.5-flash-lite`
- **Visual Previz / Image (Easel):** `gemini-3.1-flash-image` → `gemini-3-pro-image` → `gemini-2.5-flash-image` (degrades to previz card)

### 429 Handling
- **Daily Exhaustion (>60s retry delay):** Apply ~10-minute cooldown and step down the fallback chain.
- **Per-minute Throttling (<60s retry delay):** Exponential backoff and retry the same model.
- **Crew Rail Logging:** All model fallbacks and retries must emit live log events to the Director stream.

---

## 4. Test & Verification Commands

- Run all unit tests: `npm test` (or `npx vitest run`)
- Run schedule engine tests: `npx vitest run src/lib/ledger/__tests__/schedule.test.ts`
- Run budget engine tests: `npx vitest run src/lib/ledger/__tests__/budget.test.ts`
- Run build verification: `npm run build`
- Run linting: `npm run lint`
