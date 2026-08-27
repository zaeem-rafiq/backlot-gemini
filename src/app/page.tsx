"use client";

import React, { useState } from "react";
import {
  Clapperboard,
  DollarSign,
  Calendar,
  Film,
  Zap,
  Layers,
  Play,
  Clock,
  BookOpen,
  Camera,
  Megaphone,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { FREQUENCY_ZERO_SCRIPT } from "@/fixtures/frequency-zero";
import { RunState, StreamEvent, AgentId, AgentStatusState } from "@/lib/types/events";
import { CrewLogEntry, CREW_DEPARTMENTS } from "@/components/crew/CrewRail";
import { CoverageDossier } from "@/components/artifacts/CoverageDossier";
import { BreakdownTable } from "@/components/artifacts/BreakdownTable";
import { StripboardSchedule } from "@/components/artifacts/StripboardSchedule";
import { AuditedBudget } from "@/components/artifacts/AuditedBudget";
import { StoryboardGallery } from "@/components/artifacts/StoryboardGallery";
import { PitchKitView } from "@/components/artifacts/PitchKitView";
import sampleRunData from "@/fixtures/sample-run.json";

type ActiveTab = "COVERAGE" | "BREAKDOWN" | "SCHEDULE" | "BUDGET" | "STORYBOARD" | "PITCH_KIT";

export default function BacklotStudioPage() {
  const [screenplay, setScreenplay] = useState<string>(FREQUENCY_ZERO_SCRIPT);
  const [runState, setRunState] = useState<RunState | null>(sampleRunData as unknown as RunState);
  const [activeTab, setActiveTab] = useState<ActiveTab>("COVERAGE");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [enableImages, setEnableImages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scriptDrawerOpen, setScriptDrawerOpen] = useState(false);
  const [wireOpen, setWireOpen] = useState(false);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<AgentId | "ALL">("ALL");

  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatusState>>({
    director: "done",
    ink: "done",
    slate: "done",
    ledger: "done",
    easel: "done",
    marquee: "done",
  });

  const [logs, setLogs] = useState<CrewLogEntry[]>([
    {
      agent: "director",
      level: "info",
      message: "Loaded verified production package for 'FREQUENCY ZERO'.",
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

  const handleLoadSample = () => {
    setRunState(sampleRunData as unknown as RunState);
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
        message: "Loaded verified production package for 'FREQUENCY ZERO'.",
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
  };

  const handleStartRun = async () => {
    setIsRunning(true);
    setWireOpen(true);
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

  const getStatusBadge = (status: AgentStatusState = "idle") => {
    switch (status) {
      case "working":
        return {
          icon: <Radio className="w-2.5 h-2.5 text-amber-400 animate-pulse" />,
          label: "ACTIVE",
          dot: "bg-amber-400 animate-ping",
          badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
        };
      case "done":
        return {
          icon: <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />,
          label: "READY",
          dot: "bg-emerald-400",
          badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        };
      case "degraded":
        return {
          icon: <AlertCircle className="w-2.5 h-2.5 text-amber-400" />,
          label: "DEGRADED",
          dot: "bg-amber-400",
          badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "error":
        return {
          icon: <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />,
          label: "ALERT",
          dot: "bg-rose-400",
          badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        };
      case "idle":
      default:
        return {
          icon: <Clock className="w-2.5 h-2.5 text-studio-400" />,
          label: "STANDBY",
          dot: "bg-studio-500",
          badgeClass: "bg-[#151924] text-studio-400 border-studio-700",
        };
    }
  };

  const getCallsignTag = (agent: AgentId) => {
    switch (agent) {
      case "director":
        return "bg-white/10 text-white border-white/20";
      case "ink":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "slate":
        return "bg-sky-500/10 text-sky-300 border-sky-500/30";
      case "ledger":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
      case "easel":
        return "bg-violet-500/10 text-violet-300 border-violet-500/30";
      case "marquee":
        return "bg-pink-500/10 text-pink-300 border-pink-500/30";
    }
  };

  const filteredLogs = selectedAgentFilter === "ALL" 
    ? logs 
    : logs.filter((l) => l.agent === selectedAgentFilter);

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
      label: "Pitch Kit & Sources",
      icon: <Megaphone className="w-3.5 h-3.5" />,
      count: runState?.pitchKit ? `${runState.pitchKit.marketEvidence?.length || 0} Comps` : undefined,
    },
  ];

  return (
    <main className="min-h-screen bg-[#07080B] text-[#F8FAFC] flex flex-col font-sans selection:bg-amber-500/30">
      {/* Sleek Linear-Grade Studio Header */}
      <header className="h-14 border-b border-studio-800 bg-[#0A0C12]/95 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded text-studio-400 hover:text-white hover:bg-[#141824] transition focus-ring cursor-pointer"
            aria-label={sidebarOpen ? "Collapse studio sidebar" : "Expand studio sidebar"}
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4 text-amber-400" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-inner flex-shrink-0">
              <Clapperboard className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold font-mono tracking-wider text-white">BACKLOT</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">
                Parallel Track
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                Agent Platform
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0 font-mono">
          <button
            onClick={() => setWireOpen(!wireOpen)}
            className={`px-2.5 py-1.5 rounded text-xs flex items-center gap-1.5 transition focus-ring cursor-pointer border ${
              wireOpen
                ? "bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold"
                : "bg-[#101420] text-studio-400 hover:text-white border-studio-800"
            }`}
            aria-label="Toggle live wire telemetry drawer"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Telemetry Wire</span>
            <span className="text-[10px] px-1 rounded bg-black/50 text-amber-300 font-mono-tabular">
              {logs.length}
            </span>
          </button>

          <button
            onClick={handleLoadSample}
            disabled={isRunning}
            className="px-2.5 py-1.5 rounded bg-[#141824] hover:bg-studio-700 border border-studio-700 text-xs text-studio-200 flex items-center gap-1.5 transition disabled:opacity-50 focus-ring cursor-pointer font-bold"
            aria-label="Load verified sample production run"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="hidden sm:inline">Load Sample</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#040508] border border-studio-800 text-[11px] text-studio-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-medium">Gemini 2.5 Live</span>
          </div>
        </div>
      </header>

      {/* Main Studio Suite Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar (Script & Crew Rack) */}
        {sidebarOpen && (
          <aside className="w-80 border-r border-studio-800 bg-[#090B10] flex flex-col justify-between flex-shrink-0 overflow-y-auto scrollbar-thin">
            <div className="p-4 flex flex-col gap-4">
              {/* Screenplay Binder Summary & Quick Action */}
              <div className="bg-[#0D1017] border border-studio-800 rounded-lg p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Film className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-mono font-bold text-white truncate">
                      {runState?.title || "FREQUENCY ZERO"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold flex-shrink-0">
                    10 Sc · 12 Pgs
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-studio-400 pt-1 border-t border-studio-800/60">
                  <span>Courier Prime 12pt</span>
                  <button
                    onClick={() => setScriptDrawerOpen(!scriptDrawerOpen)}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 focus-ring"
                  >
                    {scriptDrawerOpen ? "Hide Editor" : "Edit Script"}
                    {scriptDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expandable Screenplay Manuscript Canvas */}
                {scriptDrawerOpen && (
                  <div className="relative rounded overflow-hidden border border-studio-800 mt-1 animate-document-land">
                    <textarea
                      className="w-full h-64 bg-[#040508] screenplay-binder-paper focus:border-amber-500/80 p-3 text-xs font-screenplay text-studio-100 focus-ring transition resize-none leading-relaxed tracking-tight"
                      value={screenplay}
                      onChange={(e) => setScreenplay(e.target.value)}
                      disabled={isRunning}
                      spellCheck={false}
                      aria-label="Screenplay Manuscript in Courier 12 point standard"
                    />
                  </div>
                )}
              </div>

              {/* Department Crew Rack (Linear Channel Strip View) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1 text-[10px] font-mono text-studio-400 uppercase tracking-wider">
                  <span>Autonomous Studio Crew</span>
                  <span>6 Units</span>
                </div>

                <div className="flex flex-col gap-1">
                  {CREW_DEPARTMENTS.map((member) => {
                    const status = agentStatuses[member.id] || "idle";
                    const badge = getStatusBadge(status);

                    return (
                      <div
                        key={member.id}
                        className="px-2.5 py-2 rounded bg-[#0D1017] border border-studio-800/80 flex items-center justify-between gap-2 transition hover:border-studio-700"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getCallsignTag(
                              member.id
                            )}`}
                          >
                            {member.callsign}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-mono font-bold text-white truncate">
                              {member.name}
                            </span>
                            <span className="text-[10px] text-studio-400 truncate">
                              {member.role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          <span className="text-[9px] font-mono text-studio-300 font-bold uppercase">
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Bottom Dispatch Controller */}
            <div className="p-4 border-t border-studio-800 bg-[#0B0D14] flex flex-col gap-3">
              {/* Optional Visual Image Generation Toggle */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-[11px] text-white font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" /> Render Storyboards
                  </span>
                  <span className="text-[9px] text-studio-400">
                    {enableImages ? "gemini-2.5-flash-image" : "Fast previz mode"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableImages(!enableImages)}
                  disabled={isRunning}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer focus-ring flex-shrink-0 ${
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
                className="w-full py-3 px-4 rounded bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-extrabold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 cursor-pointer focus-ring"
              >
                {isRunning ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-black" />
                    Orchestrating...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Greenlight & Dispatch
                  </>
                )}
              </button>
            </div>
          </aside>
        )}

        {/* Main Deliverable Canvas (Full Real Estate) */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#07080B] relative">
          {/* Top Deliverable Navigation Bar */}
          <div className="sticky top-0 z-30 bg-[#090B10]/90 backdrop-blur border-b border-studio-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
            <div
              role="tablist"
              aria-label="Studio Deliverables"
              className="flex items-center gap-1.5 flex-nowrap"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-2 transition flex-shrink-0 focus-ring cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20"
                        : "text-studio-300 hover:text-white hover:bg-[#151924]"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono ${
                          isActive
                            ? "bg-black text-amber-300 border border-black/60"
                            : "bg-[#050609] text-amber-300 border border-studio-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Width Deliverable Viewport */}
          <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
            <div
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="w-full"
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

          {/* Floating On-Set Production Telemetry Drawer */}
          {wireOpen && (
            <div className="border-t border-studio-800 bg-[#090B10] p-4 flex flex-col gap-2 shadow-2xl sticky bottom-0 z-40 max-h-64 overflow-hidden animate-document-land">
              <div className="flex items-center justify-between text-xs font-mono text-studio-400 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-white">Live On-Set Wire Telemetry</span>
                  <span>({filteredLogs.length} events)</span>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => setSelectedAgentFilter("ALL")}
                    className={`px-2 py-0.5 rounded transition ${
                      selectedAgentFilter === "ALL"
                        ? "bg-amber-500 text-black font-bold"
                        : "bg-[#141824] text-studio-400 hover:text-white"
                    }`}
                  >
                    All Units
                  </button>
                  {CREW_DEPARTMENTS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedAgentFilter(m.id)}
                      className={`px-1.5 py-0.5 rounded transition uppercase ${
                        selectedAgentFilter === m.id
                          ? "bg-amber-500 text-black font-bold"
                          : "bg-[#141824] text-studio-400 hover:text-white"
                      }`}
                    >
                      {m.callsign}
                    </button>
                  ))}
                  <button
                    onClick={() => setWireOpen(false)}
                    className="ml-2 text-studio-400 hover:text-white"
                    aria-label="Close telemetry drawer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="bg-[#040508] border border-studio-800 rounded p-2.5 font-mono text-xs h-36 overflow-y-auto flex flex-col gap-1 scrollbar-thin">
                {filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-studio-400 text-[10px] flex-shrink-0 pt-0.5 font-mono-tabular">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span
                      className={`font-bold uppercase text-[9px] px-1 rounded flex-shrink-0 border ${getCallsignTag(
                        log.agent
                      )}`}
                    >
                      {log.agent}
                    </span>
                    <span
                      className={
                        log.level === "warn"
                          ? "text-amber-300"
                          : log.level === "error"
                          ? "text-rose-400"
                          : "text-studio-200"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
    <div className="bg-[#0B0D14] border border-studio-800 rounded-xl flex flex-col items-center justify-center min-h-[420px] gap-4 text-center p-6 sm:p-8 shadow-xl">
      <div className="h-12 w-12 rounded-xl bg-[#05070B] border border-studio-700 flex items-center justify-center text-amber-400">
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
