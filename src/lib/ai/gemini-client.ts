import { GoogleGenAI } from "@google/genai";
import {
  ModelFallbackManager,
  ModelTaskKind,
  classifyGeminiError,
  COOLDOWN_DAILY_EXHAUSTION_MS,
  COOLDOWN_MODEL_NOT_FOUND_MS,
} from "./fallback-chain";

export interface GenerateStructuredOptions {
  taskKind: ModelTaskKind;
  prompt: string;
  systemInstruction?: string;
  jsonSchema?: Record<string, unknown>;
  onLog?: (level: "info" | "warn" | "error", message: string) => void;
  maxRetriesPerModel?: number;
}

export interface GenerateStructuredResult<T> {
  data: T;
  rawText: string;
  modelUsed: string;
  durationMs: number;
}

export class GeminiStudioClient {
  private fallbackManager: ModelFallbackManager;
  private apiKey?: string;

  constructor(apiKey?: string, fallbackManager: ModelFallbackManager = new ModelFallbackManager()) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.fallbackManager = fallbackManager;
  }

  private getClient(): GoogleGenAI {
    if (!this.apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. Free-tier or billed Google Gemini key required."
      );
    }
    return new GoogleGenAI({ apiKey: this.apiKey });
  }

  public async generateStructured<T>(
    options: GenerateStructuredOptions
  ): Promise<GenerateStructuredResult<T>> {
    const startTime = Date.now();
    const candidateModels = this.fallbackManager.getCandidateModels(options.taskKind);
    const maxRetries = options.maxRetriesPerModel ?? 2;
    let lastError: unknown = null;

    if (candidateModels.length === 0) {
      throw new Error(`No available Gemini models in fallback chain for task kind: ${options.taskKind}`);
    }

    const ai = this.getClient();

    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      let retryCount = 0;

      while (retryCount <= maxRetries) {
        try {
          options.onLog?.(
            "info",
            `Dispatching task to ${model} (attempt ${retryCount + 1}/${maxRetries + 1})...`
          );

          const config: Record<string, unknown> = {
            responseMimeType: "application/json",
          };

          if (options.systemInstruction) {
            config.systemInstruction = options.systemInstruction;
          }

          if (options.jsonSchema) {
            config.responseSchema = options.jsonSchema;
          }

          const response = await ai.models.generateContent({
            model,
            contents: options.prompt,
            config,
          });

          const rawText = response.text || "";
          if (!rawText.trim()) {
            throw new Error(`Empty response received from ${model}`);
          }

          let parsed: T;
          try {
            parsed = JSON.parse(rawText) as T;
          } catch (jsonErr) {
            // Strip markdown code fences if present
            const cleaned = rawText
              .replace(/```json\s*/gi, "")
              .replace(/```\s*$/g, "")
              .trim();
            parsed = JSON.parse(cleaned) as T;
          }

          const durationMs = Date.now() - startTime;
          return {
            data: parsed,
            rawText,
            modelUsed: model,
            durationMs,
          };
        } catch (err) {
          lastError = err;
          const classification = classifyGeminiError(err);

          if (classification.isModelNotFound) {
            options.onLog?.(
              "warn",
              `Model ${model} returned 404/deprecated. Putting on 1-hour cooldown and stepping down chain.`
            );
            this.fallbackManager.putModelInCooldown(model, COOLDOWN_MODEL_NOT_FOUND_MS);
            break; // Break inner while loop to move to next candidate model in chain
          }

          if (classification.isDailyExhaustion) {
            options.onLog?.(
              "warn",
              `Daily quota exhaustion detected on ${model} (delay >60s). Putting on 10-minute cooldown and falling back.`
            );
            this.fallbackManager.putModelInCooldown(model, COOLDOWN_DAILY_EXHAUSTION_MS);
            break; // Fall down to next model
          }

          if (classification.isThrottle) {
            retryCount++;
            const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 5000);
            options.onLog?.(
              "warn",
              `Per-minute throttling on ${model}. Exponential backoff ${backoffMs}ms before retry (${retryCount}/${maxRetries})...`
            );
            if (retryCount <= maxRetries) {
              await new Promise((res) => setTimeout(res, backoffMs));
              continue;
            } else {
              options.onLog?.(
                "warn",
                `Throttling retries exhausted for ${model}. Stepping down to next model in chain.`
              );
              break;
            }
          }

          if (classification.is503) {
            retryCount++;
            const backoffMs = 1500 * retryCount;
            options.onLog?.(
              "warn",
              `Service 503 high load on ${model}. Backing off ${backoffMs}ms...`
            );
            if (retryCount <= maxRetries) {
              await new Promise((res) => setTimeout(res, backoffMs));
              continue;
            } else {
              options.onLog?.(
                "warn",
                `503 retries exhausted for ${model}. Stepping down to fallback chain.`
              );
              break;
            }
          }

          // Non-quota, non-503 general error (e.g. invalid arguments or bad response)
          options.onLog?.("error", `Error on ${model}: ${classification.message}`);
          retryCount++;
          if (retryCount > maxRetries) {
            break;
          }
        }
      }
    }

    throw new Error(
      `All Gemini fallback models exhausted for task kind '${options.taskKind}'. Last error: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }
}
