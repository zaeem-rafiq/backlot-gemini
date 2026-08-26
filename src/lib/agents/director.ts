import { InkAgent } from "./ink";
import { SlateAgent } from "./slate";
import { EaselAgent } from "./easel";
import { MarqueeAgent } from "./marquee";
import { buildSchedule } from "../ledger/schedule-engine";
import { buildBudget } from "../ledger/budget-engine";
import { StreamEvent, AgentId, ArtifactKind, RunState } from "../types/events";
import { ScriptParse } from "../types/screenplay";
import { Coverage } from "../types/coverage";
import { ScriptBreakdown } from "../types/breakdown";
import { Schedule } from "../types/schedule";
import { Budget } from "../types/budget";
import { BoardPlan } from "../types/storyboard";
import { PitchKit } from "../types/pitch";

export interface DirectorRunOptions {
  runId?: string;
  enableImages?: boolean;
  onEvent: (event: StreamEvent) => void;
  // Optional pre-instantiated agents or overrides for testing
  inkAgent?: InkAgent;
  slateAgent?: SlateAgent;
  easelAgent?: EaselAgent;
  marqueeAgent?: MarqueeAgent;
  easelRunner?: (
    scriptParse: ScriptParse,
    breakdown: ScriptBreakdown,
    onLog: (level: "info" | "warn" | "error", message: string) => void
  ) => Promise<{ boardPlan: BoardPlan; modelUsed: string }>;
  marqueeRunner?: (
    scriptParse: ScriptParse,
    coverage: Coverage,
    budget: Budget,
    breakdown: ScriptBreakdown,
    onLog: (level: "info" | "warn" | "error", message: string) => void
  ) => Promise<{ pitchKit: PitchKit; modelUsed: string }>;
}

export class DirectorOrchestrator {
  private ink: InkAgent;
  private slate: SlateAgent;
  private easel: EaselAgent;
  private marquee: MarqueeAgent;

  constructor(
    inkAgent?: InkAgent,
    slateAgent?: SlateAgent,
    easelAgent?: EaselAgent,
    marqueeAgent?: MarqueeAgent
  ) {
    this.ink = inkAgent || new InkAgent();
    this.slate = slateAgent || new SlateAgent();
    this.easel = easelAgent || new EaselAgent();
    this.marquee = marqueeAgent || new MarqueeAgent();
  }

  public async executeRun(
    screenplayText: string,
    options: DirectorRunOptions
  ): Promise<RunState> {
    const startTime = Date.now();
    const runId = options.runId || `run_${Date.now()}`;
    const modelsUsedSet = new Set<string>();

    const emit = options.onEvent;

    const log = (agent: AgentId, level: "info" | "warn" | "error", message: string) => {
      emit({
        type: "agent_log",
        agent,
        level,
        message,
        timestamp: new Date().toISOString(),
      });
    };

    const setStatus = (
      agent: AgentId,
      status: "idle" | "working" | "done" | "degraded" | "error",
      message?: string
    ) => {
      emit({
        type: "agent_status",
        agent,
        status,
        message,
      });
    };

    const emitArtifact = (
      kind: ArtifactKind,
      data: ScriptParse | Coverage | ScriptBreakdown | Schedule | Budget | BoardPlan | PitchKit
    ) => {
      emit({
        type: "artifact",
        kind,
        data,
      });
    };

    const runState: RunState = {
      id: runId,
      createdAt: new Date().toISOString(),
      title: "Untitled Production",
      screenplayText,
      status: "running",
      imagesEnabled: options.enableImages ?? false,
      modelsUsed: [],
    };

    try {
      setStatus("director", "working", "Initializing Backlot studio crew...");
      log("director", "info", `Starting pre-production studio run [${runId}].`);

      // STAGE 1: Ink Screenplay Parse (Load-bearing)
      setStatus("ink", "working", "Parsing script structure, sluglines, and scene lengths...");
      const ink = options.inkAgent || this.ink;
      const parseResult = await ink.parseScript(screenplayText, (lvl, msg) => log("ink", lvl, msg));
      modelsUsedSet.add(parseResult.modelUsed);
      runState.scriptParse = parseResult.scriptParse;
      runState.title = parseResult.scriptParse.title;
      emitArtifact("scriptParse", parseResult.scriptParse);
      log("director", "info", `Script parsed: ${parseResult.scriptParse.scenes.length} scenes identified.`);

      // STAGE 2: Ink Coverage & Slate Breakdown (Parallel execution)
      setStatus("ink", "working", "Analyzing narrative arcs and calibrating coverage scores...");
      setStatus("slate", "working", "Performing 13-element physical breakdown...");
      const slate = options.slateAgent || this.slate;

      const [coverageResult, breakdownResult] = await Promise.all([
        ink.generateCoverage(parseResult.scriptParse, screenplayText, (lvl, msg) => log("ink", lvl, msg)),
        slate.breakdownScript(parseResult.scriptParse, screenplayText, (lvl, msg) => log("slate", lvl, msg)),
      ]);

      modelsUsedSet.add(coverageResult.modelUsed);
      modelsUsedSet.add(breakdownResult.modelUsed);

      runState.coverage = coverageResult.coverage;
      emitArtifact("coverage", coverageResult.coverage);
      setStatus("ink", "done", `Coverage complete. Verdict: ${coverageResult.coverage.verdict}`);

      runState.breakdown = breakdownResult.scriptBreakdown;
      emitArtifact("breakdown", breakdownResult.scriptBreakdown);
      setStatus("slate", "done", `13-element breakdown complete for ${breakdownResult.scriptBreakdown.breakdowns.length} scenes.`);

      // STAGE 3: Deterministic Ledger (Schedule & Budget — 100% Pure Code)
      setStatus("ledger", "working", "Generating stripboard schedule and calculating budget with provenance...");
      log("ledger", "info", "Executing deterministic scheduling algorithm (setup floors, location blocks, turnaround protection)...");

      const schedule = buildSchedule(parseResult.scriptParse, breakdownResult.scriptBreakdown);
      runState.schedule = schedule;
      emitArtifact("schedule", schedule);
      log("ledger", "info", `Schedule generated: ${schedule.stats.shootDays} shoot day(s), ${schedule.stats.nightShoots} night shoot(s).`);

      log("ledger", "info", "Executing deterministic budget ledger with 100% cross-artifact provenance tracing...");
      const budget = buildBudget(schedule, breakdownResult.scriptBreakdown);
      runState.budget = budget;
      emitArtifact("budget", budget);
      setStatus(
        "ledger",
        "done",
        `Budget audited: $${budget.summary.grandTotal.toLocaleString()} across ${budget.sections.length} categories.`
      );

      // STAGE 4: Easel (Storyboard Artist)
      setStatus("easel", "working", "Designing camera blocking, lens specs, and storyboard frames...");
      try {
        let easelResult: { boardPlan: BoardPlan; modelUsed: string };
        if (options.easelRunner) {
          easelResult = await options.easelRunner(
            parseResult.scriptParse,
            breakdownResult.scriptBreakdown,
            (lvl, msg) => log("easel", lvl, msg)
          );
        } else {
          const easel = options.easelAgent || this.easel;
          easelResult = await easel.generateBoardPlan(
            parseResult.scriptParse,
            breakdownResult.scriptBreakdown,
            {
              enableImages: options.enableImages,
              onLog: (lvl, msg) => log("easel", lvl, msg),
              onFrameImage: (fId, url) => emit({ type: "frame_image", frameId: fId, imageUrl: url }),
            }
          );
        }
        modelsUsedSet.add(easelResult.modelUsed);
        runState.boardPlan = easelResult.boardPlan;
        emitArtifact("boardPlan", easelResult.boardPlan);
        setStatus("easel", "done", `Storyboard plan generated: ${easelResult.boardPlan.frames.length} key frames.`);
      } catch (easelErr) {
        log("easel", "warn", `Easel encountered error, degrading gracefully: ${String(easelErr)}`);
        setStatus("easel", "degraded", "Degraded to visual prompt previz mode.");
      }

      // STAGE 5: Marquee (Marketer & Pitch Kit with Parallel Grounding)
      setStatus("marquee", "working", "Synthesizing pitch kit and querying live market comparables...");
      try {
        let marqueeResult: { pitchKit: PitchKit; modelUsed: string };
        if (options.marqueeRunner) {
          marqueeResult = await options.marqueeRunner(
            parseResult.scriptParse,
            coverageResult.coverage,
            budget,
            breakdownResult.scriptBreakdown,
            (lvl, msg) => log("marquee", lvl, msg)
          );
        } else {
          const marquee = options.marqueeAgent || this.marquee;
          marqueeResult = await marquee.generatePitchKit(
            parseResult.scriptParse,
            coverageResult.coverage,
            budget,
            breakdownResult.scriptBreakdown,
            {
              onLog: (lvl, msg) => log("marquee", lvl, msg),
              onPosterImage: (url) => emit({ type: "poster_image", posterUrl: url }),
            }
          );
        }
        modelsUsedSet.add(marqueeResult.modelUsed);
        runState.pitchKit = marqueeResult.pitchKit;
        emitArtifact("pitchKit", marqueeResult.pitchKit);
        setStatus("marquee", "done", "Pitch kit synthesized with grounded Parallel market evidence.");
      } catch (marqueeErr) {
        log("marquee", "warn", `Marquee encountered error, degrading gracefully: ${String(marqueeErr)}`);
        setStatus("marquee", "degraded", "Degraded pitch kit without live market queries.");
      }

      // STAGE 6: Complete
      const totalDuration = Date.now() - startTime;
      runState.status = "complete";
      runState.modelsUsed = Array.from(modelsUsedSet);

      setStatus("director", "done", `Studio run completed in ${(totalDuration / 1000).toFixed(1)}s.`);
      emit({
        type: "done",
        runId,
        durationMs: totalDuration,
      });

      return runState;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log("director", "error", `Fatal run failure: ${errorMessage}`);
      setStatus("director", "error", errorMessage);
      runState.status = "error";
      runState.error = errorMessage;

      emit({
        type: "error",
        message: errorMessage,
        fatal: true,
      });

      throw err;
    }
  }
}
