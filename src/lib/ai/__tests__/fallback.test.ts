import { describe, it, expect, beforeEach } from "vitest";
import {
  classifyGeminiError,
  ModelFallbackManager,
  ModelChainConfig,
  COOLDOWN_DAILY_EXHAUSTION_MS,
} from "../fallback-chain";

describe("Gemini Resilience & Fallback Chain", () => {
  describe("Error Classification", () => {
    it("classifies long-delay (>60s) 429 as Daily Exhaustion", () => {
      const err = new Error("RESOURCE_EXHAUSTED: Quota exceeded for quota metric. Please retry after 120s.");
      const result = classifyGeminiError(err);
      expect(result.is429).toBe(true);
      expect(result.isDailyExhaustion).toBe(true);
      expect(result.isThrottle).toBe(false);
      expect(result.retryDelaySeconds).toBe(120);
    });

    it("classifies short-delay (<=60s) 429 as Per-Minute Throttling", () => {
      const err = new Error("Rate limit exceeded: Please retry in 15 seconds.");
      const result = classifyGeminiError(err);
      expect(result.is429).toBe(true);
      expect(result.isDailyExhaustion).toBe(false);
      expect(result.isThrottle).toBe(true);
      expect(result.retryDelaySeconds).toBe(15);
    });

    it("classifies 503 as service load error", () => {
      const err = { status: 503, message: "The model is overloaded. Please try again later." };
      const result = classifyGeminiError(err);
      expect(result.is503).toBe(true);
      expect(result.is429).toBe(false);
    });

    it("classifies 404/deprecated as model not found", () => {
      const err = new Error("404 Not Found: Model gemini-3-pro-preview is not supported or deprecated.");
      const result = classifyGeminiError(err);
      expect(result.isModelNotFound).toBe(true);
    });
  });

  describe("ModelFallbackManager", () => {
    const testChains: ModelChainConfig = {
      reasoning: ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"],
      fast: ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite"],
      image: ["gemini-3.1-flash-image", "gemini-3-pro-image", "gemini-2.5-flash-image"],
    };

    let fallbackManager: ModelFallbackManager;

    beforeEach(() => {
      fallbackManager = new ModelFallbackManager(testChains);
      fallbackManager.clearCooldown();
    });

    it("returns candidate models in prioritized chain order", () => {
      const candidates = fallbackManager.getCandidateModels("reasoning");
      expect(candidates).toEqual(["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-2.5-flash"]);
    });

    it("filters out exhausted model placed in cooldown", () => {
      fallbackManager.putModelInCooldown("gemini-3.5-flash", COOLDOWN_DAILY_EXHAUSTION_MS);
      const candidates = fallbackManager.getCandidateModels("reasoning");
      expect(candidates).toEqual(["gemini-3-flash-preview", "gemini-2.5-flash"]);
      expect(candidates.includes("gemini-3.5-flash")).toBe(false);
    });

    it("gracefully returns remaining models when multiple are in cooldown", () => {
      fallbackManager.putModelInCooldown("gemini-3.5-flash", COOLDOWN_DAILY_EXHAUSTION_MS);
      fallbackManager.putModelInCooldown("gemini-3-flash-preview", COOLDOWN_DAILY_EXHAUSTION_MS);
      const candidates = fallbackManager.getCandidateModels("reasoning");
      expect(candidates).toEqual(["gemini-2.5-flash"]);
    });
  });
});
