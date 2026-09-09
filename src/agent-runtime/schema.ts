import { z } from "zod";
import { ScriptParseSchema, ScriptParse } from "../lib/types/screenplay";
import { CoverageSchema, Coverage } from "../lib/types/coverage";
import { BudgetSchema, Budget } from "../lib/types/budget";
import { ScriptBreakdownSchema, ScriptBreakdown } from "../lib/types/breakdown";
import { ScheduleSchema, Schedule } from "../lib/types/schedule";

export const SUPPORTED_CLASS_METHODS = ["generate_pitch_kit", "query"] as const;
export type SupportedClassMethod = (typeof SUPPORTED_CLASS_METHODS)[number];

export const AgentRuntimeInputPayloadSchema = z.object({
  runId: z.string().optional(),
  scriptParse: ScriptParseSchema,
  coverage: CoverageSchema,
  budget: BudgetSchema,
  breakdown: ScriptBreakdownSchema,
  schedule: ScheduleSchema.optional(),
});

export type AgentRuntimeInputPayload = z.infer<typeof AgentRuntimeInputPayloadSchema>;

export const ReasoningEngineQueryEnvelopeSchema = z.object({
  class_method: z.string().optional(),
  input: z.record(z.unknown()).optional(),
}).passthrough();

export interface ParsedAgentRuntimeRequest {
  runId: string;
  classMethod: string;
  scriptParse: ScriptParse;
  coverage: Coverage;
  budget: Budget;
  breakdown: ScriptBreakdown;
  schedule?: Schedule;
}

export class AgentRuntimeRequestValidationError extends Error {
  public code: string;
  public details?: unknown;
  public runId: string;

  constructor(message: string, runId: string = "", details?: unknown) {
    super(message);
    this.name = "AgentRuntimeRequestValidationError";
    this.code = "INVALID_ARGUMENT";
    this.runId = runId;
    this.details = details;
  }
}

/**
 * Validates incoming Vertex AI ReasoningEngine request body and headers.
 * Accepts both standard ReasoningEngine envelope (`{ class_method, input }`)
 * and direct BYOC payloads (`{ runId, scriptParse, ... }`).
 */
export function parseAgentRuntimeRequest(
  rawBody: unknown,
  headerRunId?: string
): ParsedAgentRuntimeRequest {
  if (!rawBody || typeof rawBody !== "object") {
    throw new AgentRuntimeRequestValidationError(
      "Request body must be a valid JSON object.",
      headerRunId || ""
    );
  }

  const envelope = rawBody as Record<string, unknown>;
  const classMethod = typeof envelope.class_method === "string" ? envelope.class_method : "generate_pitch_kit";

  if (envelope.class_method && !SUPPORTED_CLASS_METHODS.includes(classMethod as SupportedClassMethod)) {
    throw new AgentRuntimeRequestValidationError(
      `Unsupported class_method: "${classMethod}". Supported classMethods are: [${SUPPORTED_CLASS_METHODS.map((m) => `"${m}"`).join(", ")}].`,
      headerRunId || ""
    );
  }

  const candidatePayload =
    envelope.input && typeof envelope.input === "object"
      ? envelope.input
      : envelope;

  const parseResult = AgentRuntimeInputPayloadSchema.safeParse(candidatePayload);
  if (!parseResult.success) {
    const errorIssues = parseResult.error.issues;
    const summary = errorIssues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; ");
    const fallbackCandidateRunId = (candidatePayload as Record<string, unknown>).runId;
    throw new AgentRuntimeRequestValidationError(
      `Invalid request payload schema: ${summary}`,
      headerRunId || (typeof fallbackCandidateRunId === "string" ? fallbackCandidateRunId : ""),
      parseResult.error.format()
    );
  }

  const validData = parseResult.data;
  const runId = headerRunId || validData.runId || `run_${Date.now()}`;

  return {
    runId,
    classMethod,
    scriptParse: validData.scriptParse,
    coverage: validData.coverage,
    budget: validData.budget,
    breakdown: validData.breakdown,
    schedule: validData.schedule,
  };
}
