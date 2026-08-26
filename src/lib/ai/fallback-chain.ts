export type ModelTaskKind = "reasoning" | "fast" | "image";

export interface ModelChainConfig {
  reasoning: string[];
  fast: string[];
  image: string[];
}

export const VERTEX_AGENT_PLATFORM_CHAINS: ModelChainConfig = {
  reasoning: [
    process.env.MODEL_REASONING_OVERRIDE || "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
  ],
  fast: [
    process.env.MODEL_FAST_OVERRIDE || "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ],
  image: [
    process.env.MODEL_IMAGE_OVERRIDE || "gemini-2.5-flash-image",
    "gemini-3-pro-image",
  ],
};

export const DEVELOPER_API_CHAINS: ModelChainConfig = {
  reasoning: [
    process.env.MODEL_REASONING_OVERRIDE || "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
  ],
  fast: [
    process.env.MODEL_FAST_OVERRIDE || "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ],
  image: [
    process.env.MODEL_IMAGE_OVERRIDE || "gemini-3.1-flash-image",
    "gemini-3-pro-image",
    "gemini-2.5-flash-image",
  ],
};

export const DEFAULT_MODEL_CHAINS: ModelChainConfig =
  process.env.USE_VERTEX === "true" || process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT
    ? VERTEX_AGENT_PLATFORM_CHAINS
    : DEVELOPER_API_CHAINS;

export interface QuotaState {
  modelCooldowns: Map<string, number>; // model -> epoch ms when cooldown expires
}

const globalQuotaState: QuotaState = {
  modelCooldowns: new Map<string, number>(),
};

export const COOLDOWN_DAILY_EXHAUSTION_MS = 10 * 60 * 1000; // 10 minutes
export const COOLDOWN_MODEL_NOT_FOUND_MS = 60 * 60 * 1000; // 1 hour

export interface ErrorClassification {
  is429: boolean;
  isDailyExhaustion: boolean; // true if retry delay > 60s or message indicates daily quota
  isThrottle: boolean; // true if retry delay <= 60s
  is503: boolean;
  isModelNotFound: boolean;
  retryDelaySeconds?: number;
  message: string;
}

export function classifyGeminiError(error: unknown): ErrorClassification {
  const errStr = error instanceof Error ? error.message : String(error);
  const errObj = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : {};
  const status = (errObj.status || errObj.statusCode || errObj.code) as number | string | undefined;

  const is503 =
    status === 503 ||
    status === "503" ||
    errStr.includes("503") ||
    errStr.includes("Service Unavailable") ||
    errStr.includes("high load") ||
    errStr.includes("overloaded");

  const isModelNotFound =
    status === 404 ||
    status === "404" ||
    errStr.includes("404") ||
    errStr.includes("not found") ||
    errStr.includes("is not supported") ||
    errStr.includes("deprecated");

  const is429 =
    status === 429 ||
    status === "429" ||
    status === "RESOURCE_EXHAUSTED" ||
    errStr.includes("429") ||
    errStr.includes("RESOURCE_EXHAUSTED") ||
    errStr.includes("quota") ||
    errStr.includes("Rate limit exceeded") ||
    errStr.includes("Too Many Requests");

  let retryDelaySeconds: number | undefined;
  const retryMatch = errStr.match(/retry(?: after| in)? (\d+)(?:\s*(?:s|seconds))?/i);
  if (retryMatch && retryMatch[1]) {
    retryDelaySeconds = parseInt(retryMatch[1], 10);
  }

  let isDailyExhaustion = false;
  let isThrottle = false;

  if (is429) {
    if (retryDelaySeconds !== undefined) {
      if (retryDelaySeconds > 60) {
        isDailyExhaustion = true;
      } else {
        isThrottle = true;
      }
    } else if (
      errStr.includes("daily") ||
      errStr.includes("day") ||
      errStr.includes("free tier") ||
      errStr.includes("limit: 0") ||
      errStr.includes("billing")
    ) {
      isDailyExhaustion = true;
    } else {
      isDailyExhaustion = true;
    }
  }

  return {
    is429,
    isDailyExhaustion,
    isThrottle,
    is503,
    isModelNotFound,
    retryDelaySeconds,
    message: errStr,
  };
}

export class ModelFallbackManager {
  private quotaState: QuotaState;
  private chains: ModelChainConfig;

  constructor(
    chains: ModelChainConfig = DEFAULT_MODEL_CHAINS,
    quotaState: QuotaState = globalQuotaState
  ) {
    this.chains = chains;
    this.quotaState = quotaState;
  }

  public getCandidateModels(task: ModelTaskKind): string[] {
    const chain = this.chains[task];
    const now = Date.now();

    // Filter out models currently in cooldown
    const available = chain.filter((model) => {
      const cooldownUntil = this.quotaState.modelCooldowns.get(model);
      return !cooldownUntil || now >= cooldownUntil;
    });

    if (available.length > 0) {
      return available;
    }

    // If all models in cooldown, return the full chain in order of earliest cooldown expiration
    return [...chain].sort((a, b) => {
      const aTime = this.quotaState.modelCooldowns.get(a) || 0;
      const bTime = this.quotaState.modelCooldowns.get(b) || 0;
      return aTime - bTime;
    });
  }

  public putModelInCooldown(model: string, durationMs: number = COOLDOWN_DAILY_EXHAUSTION_MS): void {
    const expiry = Date.now() + durationMs;
    this.quotaState.modelCooldowns.set(model, expiry);
  }

  public clearCooldown(model?: string): void {
    if (model) {
      this.quotaState.modelCooldowns.delete(model);
    } else {
      this.quotaState.modelCooldowns.clear();
    }
  }

  public isModelInCooldown(model: string): boolean {
    const cooldownUntil = this.quotaState.modelCooldowns.get(model);
    return !cooldownUntil ? false : Date.now() < cooldownUntil;
  }
}
