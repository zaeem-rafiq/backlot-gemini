import { ScriptParse } from "../types/screenplay";
import { Coverage } from "../types/coverage";
import { Budget } from "../types/budget";
import { ScriptBreakdown } from "../types/breakdown";
import { Schedule } from "../types/schedule";
import {
  PitchKit,
  PitchKitSchema,
} from "../types/pitch";
import { validateProductionRecommendation } from "./marquee";

export class AgentRuntimeError extends Error {
  public code: string;
  public runId?: string;
  public statusCode?: number;

  constructor(message: string, code: string = "AGENT_RUNTIME_ERROR", runId?: string, statusCode?: number) {
    super(message);
    this.name = "AgentRuntimeError";
    this.code = code;
    this.runId = runId;
    this.statusCode = statusCode;
  }
}

export class AgentRuntimeTimeoutError extends AgentRuntimeError {
  constructor(message: string, runId?: string) {
    super(message, "AGENT_RUNTIME_TIMEOUT", runId, 408);
    this.name = "AgentRuntimeTimeoutError";
  }
}

export class AgentRuntimeAuthenticationError extends AgentRuntimeError {
  constructor(message: string, runId?: string, statusCode: number = 401) {
    super(message, "AGENT_RUNTIME_AUTH_FAILED", runId, statusCode);
    this.name = "AgentRuntimeAuthenticationError";
  }
}

export class AgentRuntimeValidationError extends AgentRuntimeError {
  constructor(message: string, runId?: string) {
    super(message, "AGENT_RUNTIME_VALIDATION_FAILED", runId, 422);
    this.name = "AgentRuntimeValidationError";
  }
}

export class AgentRuntimeFinancialTamperingError extends AgentRuntimeError {
  constructor(message: string, runId?: string) {
    super(message, "AGENT_RUNTIME_FINANCIAL_TAMPERING", runId, 400);
    this.name = "AgentRuntimeFinancialTamperingError";
  }
}

export interface AgentRuntimeClientOptions {
  resourceName?: string;
  endpoint?: string;
  agentUrl?: string;
  timeoutMs?: number;
  authToken?: string;
  fetchFn?: typeof fetch;
}

export interface AgentRuntimeGenerateResult {
  pitchKit: PitchKit;
  modelUsed: string;
  durationMs: number;
  runId: string;
  observedMetadata: {
    provider?: string;
    modelConfigured?: string;
    modelObserved?: string;
    durationMs?: number;
    marketEvidenceCount?: number;
    hasProductionRecommendation?: boolean;
    timestamp?: string;
    [key: string]: unknown;
  };
}

/**
 * Resolves a Google Cloud OAuth 2.0 access token (aiplatform scope) server-side.
 * Never exposes credentials to client bundles or unauthorized callers.
 */
export async function fetchGoogleCloudAccessToken(targetAudience?: string): Promise<string | null> {
  // 1. Explicit token override for local testing / CI
  if (process.env.GCP_ACCESS_TOKEN) {
    return process.env.GCP_ACCESS_TOKEN;
  }

  // 2. Google Cloud Instance Metadata Server Access Token Probe (GCP Compute / Cloud Run -> Vertex AI)
  try {
    const res = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        headers: { "Metadata-Flavor": "Google" },
        signal: AbortSignal.timeout(1500),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as { access_token?: string };
      if (data.access_token) {
        return data.access_token;
      }
    }
  } catch {
    // Not running inside a GCP instance with metadata server
  }

  // 3. Fallback for Cloud Run direct ID-token service-to-service calls if targetAudience provided
  if (targetAudience && targetAudience.startsWith("https://") && !targetAudience.includes("aiplatform.googleapis.com")) {
    try {
      const identityUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(
        targetAudience
      )}`;
      const res = await fetch(identityUrl, {
        headers: { "Metadata-Flavor": "Google" },
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        const idToken = (await res.text()).trim();
        if (idToken) return idToken;
      }
    } catch {
      // Ignore identity probe failures
    }
  }

  // 4. Local Developer gcloud CLI probe (non-production only)
  if (process.env.NODE_ENV !== "production" && typeof window === "undefined") {
    try {
      const { execSync } = await import("node:child_process");
      const token = execSync("gcloud auth print-access-token", {
        encoding: "utf-8",
        timeout: 3000,
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (token) return token;
    } catch {
      // Local gcloud not logged in or CLI unavailable
    }
  }

  return null;
}

export class AgentRuntimeMarqueeClient {
  private resourceName?: string;
  private endpoint: string;
  private timeoutMs: number;
  private authToken?: string;
  private fetchFn: typeof fetch;

  constructor(options: AgentRuntimeClientOptions = {}) {
    this.resourceName =
      options.resourceName ||
      process.env.VERTEX_REASONING_ENGINE_RESOURCE_NAME ||
      "";

    const isProduction = process.env.NODE_ENV === "production";

    // Validate canonical Vertex AI ReasoningEngine resource pattern:
    // projects/{project}/locations/{location}/reasoningEngines/{id}
    const resourceMatch = this.resourceName.match(
      /^projects\/([^/]+)\/locations\/([^/]+)\/reasoningEngines\/([^/]+)$/
    );

    let resolvedEndpoint = "";

    if (isProduction) {
      // In production, require canonical ReasoningEngine resource target.
      // Legacy generic endpoint variables (AGENT_RUNTIME_URL, etc.) must NOT override it!
      if (resourceMatch) {
        const [, , location] = resourceMatch;
        resolvedEndpoint = `https://${location}-aiplatform.googleapis.com/v1/${this.resourceName}:query`;
      }
    } else {
      // In non-production (dev/test), derive from canonical resourceName if present,
      // or fall back to explicit options/environment overrides for local mocks.
      if (resourceMatch) {
        const [, , location] = resourceMatch;
        resolvedEndpoint = `https://${location}-aiplatform.googleapis.com/v1/${this.resourceName}:query`;
      } else {
        resolvedEndpoint =
          options.endpoint ||
          options.agentUrl ||
          process.env.VERTEX_REASONING_ENGINE_URL ||
          process.env.AGENT_RUNTIME_URL ||
          process.env.MARQUEE_AGENT_URL ||
          "";
      }
    }

    this.endpoint = resolvedEndpoint;
    this.timeoutMs = options.timeoutMs ?? 60000;
    this.authToken = options.authToken || process.env.AGENT_RUNTIME_AUTH_TOKEN;
    this.fetchFn = options.fetchFn || fetch;
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public getResourceName(): string | undefined {
    return this.resourceName;
  }

  public isConfigured(): boolean {
    return Boolean(this.endpoint && this.endpoint.trim().length > 0);
  }

  /**
   * Dispatches the Marquee research and pitch synthesis stage to Google Agent Runtime (Vertex AI Reasoning Engine).
   * Enforces strict provenance, run ID matching, budget immutability, caller cancellation, and explicit error handling.
   */
  public async generatePitchKit(
    runId: string,
    scriptParse: ScriptParse,
    coverage: Coverage,
    budget: Budget,
    breakdown: ScriptBreakdown,
    options: {
      schedule?: Schedule;
      onLog?: (level: "info" | "warn" | "error", message: string) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<AgentRuntimeGenerateResult> {
    const onLog = options.onLog;
    const isProduction = process.env.NODE_ENV === "production";

    // In production, strictly require canonical ReasoningEngine resource name
    if (isProduction) {
      const resourceMatch = this.resourceName?.match(
        /^projects\/([^/]+)\/locations\/([^/]+)\/reasoningEngines\/([^/]+)$/
      );
      if (!resourceMatch || !this.endpoint) {
        throw new AgentRuntimeError(
          "Google Agent Runtime canonical ReasoningEngine resource target is strictly required in production (VERTEX_REASONING_ENGINE_RESOURCE_NAME missing or invalid). Legacy endpoint variables are not permitted.",
          "AGENT_RUNTIME_NOT_CONFIGURED",
          runId
        );
      }
    } else if (!this.endpoint) {
      throw new AgentRuntimeError(
        "Google Agent Runtime ReasoningEngine resource is not configured (VERTEX_REASONING_ENGINE_RESOURCE_NAME missing).",
        "AGENT_RUNTIME_NOT_CONFIGURED",
        runId
      );
    }

    if (options.signal?.aborted) {
      const abortReason = options.signal.reason;
      throw abortReason instanceof Error ? abortReason : new Error("Operation aborted by caller.");
    }

    const targetEndpoint = this.endpoint;

    onLog?.(
      "info",
      `[${runId}] Dispatching Marquee stage to Google Agent Runtime: ${targetEndpoint}...`
    );

    // Prepare authorization header if available
    let token = this.authToken;
    if (!token) {
      token = (await fetchGoogleCloudAccessToken(targetEndpoint)) || undefined;
    }

    // Recheck cancellation after async token acquisition, before dispatch
    if (options.signal?.aborted) {
      const abortReason = options.signal.reason;
      throw abortReason instanceof Error ? abortReason : new Error("Operation aborted by caller.");
    }

    const isGoogleApiEndpoint = targetEndpoint.includes("aiplatform.googleapis.com");
    if (isGoogleApiEndpoint && !token && isProduction) {
      throw new AgentRuntimeAuthenticationError(
        "Failed to acquire OAuth access token for Vertex AI ReasoningEngine endpoint.",
        runId
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-backlot-run-id": runId,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Google Agent Runtime request envelope conforming to Reasoning Engine query contract
    const requestPayload = {
      class_method: "generate_pitch_kit",
      input: {
        runId,
        scriptParse,
        coverage,
        budget,
        breakdown,
        schedule: options.schedule,
      },
    };

    const timeoutController = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      timeoutController.abort();
    }, this.timeoutMs);

    const onCallerAbort = () => {
      timeoutController.abort();
    };

    if (options.signal) {
      options.signal.addEventListener("abort", onCallerAbort, { once: true });
    }

    let response: Response;
    let responseText: string = "";

    try {
      response = await this.fetchFn(targetEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestPayload),
        signal: timeoutController.signal,
      });

      // Keep request timeout active through response body parsing
      if (typeof response.text === "function") {
        responseText = await response.text();
      } else if (typeof (response as any).json === "function") {
        try {
          const json = await (response as any).json();
          responseText = JSON.stringify(json);
        } catch (jErr) {
          throw new AgentRuntimeValidationError(
            `Google Agent Runtime returned malformed, non-JSON response: ${String(jErr)}`,
            runId
          );
        }
      }
    } catch (networkOrTimeoutErr: unknown) {
      if (networkOrTimeoutErr instanceof AgentRuntimeValidationError) {
        throw networkOrTimeoutErr;
      }
      if (options.signal?.aborted) {
        const abortReason = options.signal.reason;
        throw abortReason instanceof Error ? abortReason : new Error("Operation aborted by caller.");
      }
      if (timedOut || timeoutController.signal.aborted) {
        throw new AgentRuntimeTimeoutError(
          `Google Agent Runtime timed out after ${this.timeoutMs}ms for run [${runId}].`,
          runId
        );
      }
      throw new AgentRuntimeError(
        `Failed to connect to Google Agent Runtime at ${targetEndpoint}: ${String(networkOrTimeoutErr)}`,
        "AGENT_RUNTIME_NETWORK_ERROR",
        runId
      );
    } finally {
      clearTimeout(timeoutId);
      if (options.signal) {
        options.signal.removeEventListener("abort", onCallerAbort);
      }
    }

    // Handle authentication failures explicitly
    if (response.status === 401 || response.status === 403) {
      throw new AgentRuntimeAuthenticationError(
        `Google Agent Runtime authentication failed (HTTP ${response.status}): ${responseText || "Unauthorized / Forbidden"}`,
        runId,
        response.status
      );
    }

    // Handle server / execution errors explicitly
    if (!response.ok) {
      throw new AgentRuntimeError(
        `Google Agent Runtime returned HTTP ${response.status}: ${responseText || response.statusText}`,
        "AGENT_RUNTIME_HTTP_ERROR",
        runId,
        response.status
      );
    }

    let responseJson: Record<string, unknown>;
    try {
      responseJson = JSON.parse(responseText);
    } catch (jsonErr) {
      throw new AgentRuntimeValidationError(
        `Google Agent Runtime returned malformed, non-JSON response: ${String(jsonErr)}`,
        runId
      );
    }

    // Extract output payload from Agent Runtime response
    const output =
      responseJson.output && typeof responseJson.output === "object"
        ? (responseJson.output as Record<string, unknown>)
        : responseJson;

    // 1. Strictly require matching response run ID (fails if missing or mismatched)
    const returnedRunId =
      output.runId !== undefined
        ? String(output.runId)
        : (responseJson.runId !== undefined ? String(responseJson.runId) : "");

    if (!returnedRunId || returnedRunId !== runId) {
      throw new AgentRuntimeValidationError(
        `Google Agent Runtime returned runId mismatch: expected "${runId}", received "${returnedRunId || "<missing>"}".`,
        runId
      );
    }

    // 2. Reject any attempt to overwrite or replace financial totals
    if ("budget" in output || "budget" in responseJson) {
      const attemptedBudget = (output.budget || responseJson.budget) as Budget | undefined;
      if (
        attemptedBudget?.summary?.grandTotal !== undefined &&
        attemptedBudget.summary.grandTotal !== budget.summary.grandTotal
      ) {
        throw new AgentRuntimeFinancialTamperingError(
          `Google Agent Runtime attempted to replace deterministic budget grand total: expected $${budget.summary.grandTotal}, received $${attemptedBudget.summary.grandTotal}. Invariant violated.`,
          runId
        );
      }
    }

    // 3. Validate Pitch Kit structure against schema
    const rawPitchKit = output.pitchKit || responseJson.pitchKit;
    if (!rawPitchKit || typeof rawPitchKit !== "object") {
      throw new AgentRuntimeValidationError(
        "Google Agent Runtime response missing required 'pitchKit' object.",
        runId
      );
    }

    let parsedPitchKit: PitchKit;
    try {
      parsedPitchKit = PitchKitSchema.parse(rawPitchKit);
    } catch (zodErr) {
      throw new AgentRuntimeValidationError(
        `Google Agent Runtime Pitch Kit failed schema validation: ${String(zodErr)}`,
        runId
      );
    }

    // 4. Re-validate recommendation against originating budget items and feasibility invariants
    if (parsedPitchKit.productionRecommendation) {
      const validatedRec = validateProductionRecommendation(
        parsedPitchKit.productionRecommendation,
        budget,
        parsedPitchKit.marketEvidence
      );

      if (!validatedRec) {
        onLog?.(
          "warn",
          `[${runId}] Remote recommendation failed originating budget cross-verification or feasibility invariants. Withholding recommendation.`
        );
        parsedPitchKit = {
          ...parsedPitchKit,
          productionRecommendation: null,
        };
      } else {
        parsedPitchKit = {
          ...parsedPitchKit,
          productionRecommendation: validatedRec,
        };
      }
    }

    // 5. Observed model metadata: NEVER fabricate model metadata
    const rawModelUsed = output.modelUsed ?? responseJson.modelUsed;
    if (typeof rawModelUsed !== "string" || !rawModelUsed.trim()) {
      throw new AgentRuntimeValidationError(
        "Google Agent Runtime response missing required 'modelUsed' identifier.",
        runId
      );
    }
    const modelUsed = rawModelUsed.trim();
    const durationMs = Number(output.durationMs ?? responseJson.durationMs ?? 0);
    const rawObservedMetadata = ((output.observedMetadata ?? responseJson.observedMetadata) || {}) as Record<string, unknown>;

    onLog?.(
      "info",
      `[${runId}] Successfully received and validated Pitch Kit from Google Agent Runtime (Model: ${modelUsed}, Duration: ${durationMs}ms).`
    );

    return {
      pitchKit: parsedPitchKit,
      modelUsed,
      durationMs,
      runId,
      observedMetadata: {
        provider: "google-genai",
        modelConfigured:
          (rawObservedMetadata.modelConfigured as string | undefined) || process.env.MODEL_FAST_OVERRIDE || "gemini-3.8-flash",
        modelObserved: modelUsed,
        durationMs,
        marketEvidenceCount: parsedPitchKit.marketEvidence.length,
        hasProductionRecommendation: Boolean(parsedPitchKit.productionRecommendation),
        ...rawObservedMetadata,
      },
    };
  }
}

export { AgentRuntimeMarqueeClient as RemoteMarqueeClient };
