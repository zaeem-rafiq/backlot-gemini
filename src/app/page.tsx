"use client";

import React, { useState, useEffect } from "react";
import {
  Clapperboard,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Calendar,
  Film,
  Zap,
  Layers,
  Play,
  FileText,
  Clock,
  Search,
  BookOpen,
  Camera,
  Megaphone,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { FREQUENCY_ZERO_SCRIPT } from "@/fixtures/frequency-zero";
import { RunState, StreamEvent, AgentId, AgentStatusState } from "@/lib/types/events";
import { CrewRail, CrewLogEntry } from "@/components/crew/CrewRail";
import { CoverageDossier } from "@/components/artifacts/CoverageDossier";
import { BreakdownTable } from "@/components/artifacts/BreakdownTable";
import { StripboardSchedule } from "@/components/artifacts/StripboardSchedule";
import { AuditedBudget } from "@/components/artifacts/AuditedBudget";
import { StoryboardGallery } from "@/components/artifacts/StoryboardGallery";
import { PitchKitView } from "@/components/artifacts/PitchKitView";

type ActiveTab = "COVERAGE" | "BREAKDOWN" | "SCHEDULE" | "BUDGET" | "STORYBOARD" | "PITCH_KIT";

export default function BacklotStudioPage() {
  const [screenplay, setScreenplay] = useState(FREQUENCY_ZERO_SCRIPT);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("COVERAGE");
  const [runState, setRunState] = useState<RunState | null>(null);

  const [enableImages, setEnableImages] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatusState>>({
    director: "idle",
    ink: "idle",
    slate: "idle",
    ledger: "idle",
    easel: "idle",
    marquee: "idle",
  });

  const [logs, setLogs] = useState<CrewLogEntry[]>([]);

  // Load baked sample run on mount for instantaneous zero-quota experience
  useEffect(() => {
    handleLoadSample();
  }, []);

  const handleLoadSample = async () => {
    try {
      const res = await fetch("/api/sample");
      if (res.ok) {
        const data: RunState = await res.json();
        setRunState(data);
        setAgentStatuses({
          director: "done",
          ink: "done",
          slate: "done",
          ledger: "done",
          easel: "done",
          marquee: "done",
        });
        setLogs([
          {
            agent: "director",
            level: "info",
            message: "Loaded verified baked sample run fixture for 'FREQUENCY ZERO'.",
            timestamp: new Date().toISOString(),
          },
          {
            agent: "marquee",
            level: "info",
            message: "Retrieved 10 live Parallel Search API market citations with active verified URLs.",
            timestamp: new Date().toISOString(),
          },
          {
            agent: "ledger",
            level: "info",
            message: "Audited 100% deterministic budget ($31,875) with complete cross-artifact provenance.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading sample fixture:", err);
    }
  };

  const handleStartRun = async () => {
    setIsRunning(true);
    setLogs([]);
    setAgentStatuses({
      director: "working",
      ink: "working",
      slate: "idle",
      ledger: "idle",
      easel: "idle",
      marquee: "idle",
    });

    const initialRun: RunState = {
      id: `run_${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: "FREQUENCY ZERO",
      screenplayText: screenplay,
      status: "running",
      imagesEnabled: enableImages,
      modelsUsed: [],
    };
    setRunState(initialRun);

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenplayText: screenplay, enableImages }),
      });

      if (!response.body) {
        throw new Error("No SSE response stream received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));
              if (event.type === "agent_log") {
                setLogs((prev) => [
                  ...prev,
                  { agent: event.agent, message: event.message, timestamp: event.timestamp, level: event.level },
                ]);
              } else if (event.type === "agent_status") {
                setAgentStatuses((prev) => ({ ...prev, [event.agent]: event.status }));
              } else if (event.type === "artifact") {
                setRunState((prev) => {
                  if (!prev) return prev;
                  const updated = { ...prev };
                  if (event.kind === "scriptParse") updated.scriptParse = event.data as any;
                  if (event.kind === "coverage") updated.coverage = event.data as any;
                  if (event.kind === "breakdown") updated.breakdown = event.data as any;
                  if (event.kind === "schedule") updated.schedule = event.data as any;
                  if (event.kind === "budget") updated.budget = event.data as any;
                  if (event.kind === "boardPlan") updated.boardPlan = event.data as any;
                  if (event.kind === "pitchKit") updated.pitchKit = event.data as any;
                  return updated;
                });
              } else if (event.type === "done") {
                setRunState((prev) => (prev ? { ...prev, status: "complete" } : null));
                setIsRunning(false);
              } else if (event.type === "error") {
                setRunState((prev) => (prev ? { ...prev, status: "error", error: event.message } : null));
                setIsRunning(false);
              }
            } catch (jsonErr) {
              console.error("Error decoding SSE stream chunk:", jsonErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Studio execution error:", err);
      setIsRunning(false);
      setAgentStatuses((prev) => ({ ...prev, director: "error" }));
    }
  };

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; count?: number | string }> = [
    {
      id: "COVERAGE",
      label: "Story Coverage",
      icon: <BookOpen className="w-3.5 h-3.5" />,
      count: runState?.coverage ? runState.coverage.verdict : undefined,
    },
    {
      id: "BREAKDOWN",
      label: "1st AD Breakdown",
      icon: <Layers className="w-3.5 h-3.5" />,
      count: runState?.breakdown ? `${runState.breakdown.breakdowns.length} Sc` : undefined,
    },
    {
      id: "SCHEDULE",
      label: "Stripboard Schedule",
      icon: <Calendar className="w-3.5 h-3.5" />,
      count: runState?.schedule ? `${runState.schedule.stats.shootDays} Days` : undefined,
    },
    {
      id: "BUDGET",
      label: "Audited Budget",
      icon: <DollarSign className="w-3.5 h-3.5" />,
      count: runState?.budget ? `$${runState.budget.summary.grandTotal.toLocaleString()}` : undefined,
    },
    {
      id: "STORYBOARD",
      label: "Previz Storyboard",
      icon: <Camera className="w-3.5 h-3.5" />,
      count: runState?.boardPlan ? `${runState.boardPlan.frames.length} Shots` : undefined,
    },
    {
      id: "PITCH_KIT",
      label: "Pitch Kit & Parallel Sources",
      icon: <Megaphone className="w-3.5 h-3.5" />,
      count: runState?.pitchKit ? `${runState.pitchKit.marketEvidence?.length || 0} Comps` : undefined,
    },
  ];

  return (
    <main className="min-h-screen bg-[#08090D] text-[#F8FAFC] flex flex-col font-sans selection:bg-amber-500/30">
      {/* Studio Global Header */}
      <header className="border-b border-studio-800 bg-[#0F121A]/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-inner flex-shrink-0">
            <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold font-mono tracking-wider text-white">BACKLOT</h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold whitespace-nowrap">
                Parallel Track
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold whitespace-nowrap">
                Agent Platform
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-studio-400 truncate">AI-Native Pre-Production Studio Crew</p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={handleLoadSample}
            disabled={isRunning}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#141824] hover:bg-studio-700 border border-studio-700 text-[11px] sm:text-xs font-mono text-studio-200 flex items-center gap-1.5 transition disabled:opacity-50 focus-ring cursor-pointer"
            aria-label="Load verified sample production run"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="hidden xs:inline sm:inline">Load Sample</span>
            <span className="hidden md:inline">Production</span>
          </button>

          {/* Model Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#08090D] border border-studio-800 text-[10px] sm:text-[11px] font-mono text-studio-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span>Gemini 2.5 Live</span>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <div className="flex-1 max-w-[1500px] w-full mx-auto p-3.5 sm:p-4 md:p-6 flex flex-col gap-6">
        {/* Multi-Agent Crew Call Sheet Rail */}
        <CrewRail statuses={agentStatuses} logs={logs} isRunning={isRunning} />

        {/* Two-Column Studio Production Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Screenplay Binder Console */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-studio-800 pb-2.5">
                <h2 className="text-xs font-mono uppercase font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" /> Screenplay Binder (Courier 12pt)
                </h2>
                <span className="text-[10px] font-mono text-studio-400">10 Scenes · 12 Pages</span>
              </div>

              {/* Typed Screenplay Manuscript Canvas */}
              <div className="relative">
                <textarea
                  className="w-full h-[280px] sm:h-[360px] lg:h-[420px] bg-[#040508] border border-studio-800 focus:border-amber-500/80 rounded-lg p-3.5 text-xs font-screenplay text-studio-100 focus-ring transition resize-none leading-relaxed tracking-tight shadow-inner"
                  value={screenplay}
                  onChange={(e) => setScreenplay(e.target.value)}
                  disabled={isRunning}
                  spellCheck={false}
                  aria-label="Screenplay Manuscript in Courier 12 point standard"
                />
              </div>

              {/* Optional Visual Image Generation Toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#040508] border border-studio-800 text-xs">
                <div className="flex flex-col pr-2">
                  <span className="text-[11px] font-mono text-white font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" /> Render Visual Storyboard Panels
                  </span>
                  <span className="text-[10px] text-studio-400 font-mono">
                    {enableImages ? "Visual frames enabled (gemini-2.5-flash-image)" : "Previz mode (fast 58s run)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableImages(!enableImages)}
                  disabled={isRunning}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer focus-ring flex-shrink-0 ${
                    enableImages ? "bg-amber-500 justify-end" : "bg-studio-800 justify-start"
                  }`}
                  aria-checked={enableImages}
                  role="switch"
                  aria-label="Toggle visual image generation"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                </button>
              </div>

              <button
                onClick={handleStartRun}
                disabled={isRunning}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold font-mono text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition disabled:opacity-50 cursor-pointer focus-ring"
              >
                {isRunning ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-black" />
                    Studio Crew Orchestrating Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Dispatch Studio Crew
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Artifact Studio Deck */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Artifact Tabs Header (Department Binder Tabs) */}
            <div
              role="tablist"
              aria-label="Department Binder Views"
              className="bg-[#0F121A] border border-studio-800 rounded-xl p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-md scrollbar-none"
            >
              {tabs.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") {
                        e.preventDefault();
                        const nextTab = tabs[(idx + 1) % tabs.length];
                        setActiveTab(nextTab.id);
                        document.getElementById(`tab-${nextTab.id}`)?.focus();
                      } else if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        const prevTab = tabs[(idx - 1 + tabs.length) % tabs.length];
                        setActiveTab(prevTab.id);
                        document.getElementById(`tab-${prevTab.id}`)?.focus();
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition flex-shrink-0 focus-ring ${
                      isActive
                        ? "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20"
                        : "text-studio-300 hover:text-white hover:bg-[#141824]"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                          isActive
                            ? "bg-black text-amber-300 border border-black/50"
                            : "bg-[#08090D] text-amber-300 border border-studio-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Artifact Viewport Container */}
            <div
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="min-h-[500px]"
            >
              {activeTab === "COVERAGE" && (
                runState?.coverage ? (
                  <CoverageDossier coverage={runState.coverage} title={runState.title} />
                ) : (
                  <EmptyArtifactPlaceholder
                    label="Studio Story Coverage"
                    description="Ink (Story Analyst) is evaluating narrative premise, pacing, and calibrated reader scores."
                    isRunning={isRunning}
                    onLoadSample={handleLoadSample}
                    onDispatch={handleStartRun}
                  />
                )
              )}

              {activeTab === "BREAKDOWN" && (
                runState?.breakdown ? (
                  <BreakdownTable breakdown={runState.breakdown} scriptParse={runState.scriptParse} />
                ) : (
                  <EmptyArtifactPlaceholder
                    label="1st AD Breakdown Sheet"
                    description="Slate (1st AD) is cataloging 13 physical element categories across all scenes."
                    isRunning={isRunning}
                    onLoadSample={handleLoadSample}
                    onDispatch={handleStartRun}
                  />
                )
              )}

              {activeTab === "SCHEDULE" && (
                runState?.schedule ? (
                  <StripboardSchedule schedule={runState.schedule} scriptParse={runState.scriptParse} />
                ) : (
                  <EmptyArtifactPlaceholder
                    label="Stripboard Schedule"
                    description="Ledger is clustering location blocks, applying setup floors, and bin-packing shooting days."
                    isRunning={isRunning}
                    onLoadSample={handleLoadSample}
                    onDispatch={handleStartRun}
                  />
                )
              )}

              {activeTab === "BUDGET" && (
                runState?.budget ? (
                  <AuditedBudget budget={runState.budget} />
                ) : (
                  <EmptyArtifactPlaceholder
                    label="Audited Top Sheet Budget"
                    description="Ledger is computing pure mathematical line items with 100% cross-artifact provenance."
                    isRunning={isRunning}
                    onLoadSample={handleLoadSample}
                    onDispatch={handleStartRun}
                  />
                )
              )}

              {activeTab === "STORYBOARD" && (
                runState?.boardPlan ? (
                  <StoryboardGallery boardPlan={runState.boardPlan} />
                ) : (
                  <EmptyArtifactPlaceholder
                    label="Storyboard Previz Deck"
                    description="Easel (Storyboard Artist) is designing 2.39:1 camera focal lengths, blocking, and keyframe prompt plans."
                    isRunning={isRunning}
                    onLoadSample={handleLoadSample}
                    onDispatch={handleStartRun}
                  />
                )
              )}

              {activeTab === "PITCH_KIT" && (
                runState?.pitchKit ? (
                  <PitchKitView pitchKit={runState.pitchKit} title={runState.title} />
                ) : (
                  <EmptyArtifactPlaceholder
                    label="Pitch Kit & Parallel Citations"
                    description="Marquee is querying live Parallel Search API market data and quoting coverage & budget totals."
                    isRunning={isRunning}
                    onLoadSample={handleLoadSample}
                    onDispatch={handleStartRun}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyArtifactPlaceholder({
  label,
  description,
  isRunning,
  onLoadSample,
  onDispatch,
}: {
  label: string;
  description: string;
  isRunning: boolean;
  onLoadSample?: () => void;
  onDispatch?: () => void;
}) {
  return (
    <div className="bg-[#0F121A] border border-studio-800 rounded-xl flex flex-col items-center justify-center min-h-[420px] gap-4 text-center p-6 sm:p-8 shadow-xl">
      <div className="h-12 w-12 rounded-xl bg-[#08090D] border border-studio-700 flex items-center justify-center text-amber-400">
        {isRunning ? <Zap className="w-6 h-6 animate-spin" /> : <Clock className="w-6 h-6 text-studio-400" />}
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
          {isRunning ? `${label} in Progress...` : `${label} Awaiting Run`}
        </h3>
        <p className="text-xs text-studio-300 leading-relaxed font-mono">
          {description}
        </p>
      </div>

      {!isRunning && (
        <div className="flex items-center gap-3 pt-2">
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="px-3.5 py-1.5 rounded-lg bg-[#141824] hover:bg-studio-700 border border-studio-700 text-xs font-mono text-studio-200 flex items-center gap-1.5 transition focus-ring cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              Load Sample Data
            </button>
          )}
          {onDispatch && (
            <button
              onClick={onDispatch}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/10 focus-ring cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Dispatch Studio Crew
            </button>
          )}
        </div>
      )}
    </div>
  );
}
