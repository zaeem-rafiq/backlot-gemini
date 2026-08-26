"use client";

import React, { useState } from "react";
import { Clapperboard, Sparkles, ShieldCheck, DollarSign, Calendar, Film, Zap, Layers, Play } from "lucide-react";
import { FREQUENCY_ZERO_SCRIPT } from "@/fixtures/frequency-zero";
import { RunState, StreamEvent } from "@/lib/types/events";

export default function BacklotStudioPage() {
  const [screenplay, setScreenplay] = useState(FREQUENCY_ZERO_SCRIPT);
  const [isRunning, setIsRunning] = useState(false);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [logs, setLogs] = useState<Array<{ agent: string; message: string; timestamp: string; level: string }>>([]);

  const handleStartRun = async () => {
    setIsRunning(true);
    setLogs([]);
    setRunState({
      id: `run_${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: "FREQUENCY ZERO",
      screenplayText: screenplay,
      status: "running",
      imagesEnabled: false,
      modelsUsed: [],
    });

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenplayText: screenplay, enableImages: false }),
      });

      if (!response.body) {
        throw new Error("No response body received from stream");
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
                setLogs((prev) => [...prev, { agent: event.agent, message: event.message, timestamp: event.timestamp, level: event.level }]);
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
                setRunState((prev) => prev ? { ...prev, status: "complete" } : null);
                setIsRunning(false);
              } else if (event.type === "error") {
                setRunState((prev) => prev ? { ...prev, status: "error", error: event.message } : null);
                setIsRunning(false);
              }
            } catch (jsonErr) {
              console.error("Error parsing stream event:", jsonErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Stream run error:", err);
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-[#F5F7FD] flex flex-col">
      {/* Top Studio Header */}
      <header className="border-b border-[#1E2438] bg-[#101420]/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-wide text-white flex items-center gap-2">
              BACKLOT
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Parallel Track
              </span>
            </h1>
            <p className="text-xs text-[#7E8CD4]">AI-Native Pre-Production Multi-Agent Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#A8B4EB]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16192B] border border-[#2B3152]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Gemini 3.5 / 2.5 Live
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Screenplay Input & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" /> Screenplay Source
              </h2>
              <span className="text-xs text-[#7E8CD4] font-mono">10 Scenes · Short Film</span>
            </div>

            <textarea
              className="w-full h-80 bg-[#090A0F] border border-[#2B3152] rounded-lg p-3 text-xs font-mono text-[#D0D7F7] focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
              value={screenplay}
              onChange={(e) => setScreenplay(e.target.value)}
              disabled={isRunning}
            />

            <button
              onClick={handleStartRun}
              disabled={isRunning}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-black" />
                  Studio Crew In Session...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Launch Studio Greenlight Run
                </>
              )}
            </button>
          </div>

          {/* Crew Rail Logs */}
          <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-4 flex flex-col gap-2 flex-1 min-h-[220px]">
            <h3 className="text-xs font-mono uppercase text-[#7E8CD4] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Crew Rail Live Stream
            </h3>
            <div className="flex-1 bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 font-mono text-[11px] overflow-y-auto max-h-56 flex flex-col gap-1.5">
              {logs.length === 0 ? (
                <span className="text-[#5865A8] italic">Awaiting screenplay submission to dispatch crew...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold uppercase text-[10px]">[{log.agent}]</span>
                    <span className={log.level === "warn" ? "text-amber-300" : log.level === "error" ? "text-rose-400" : "text-[#D0D7F7]"}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Artifact Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-6 flex flex-col gap-6 shadow-xl flex-1">
            <div className="flex items-center justify-between border-b border-[#1E2438] pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {runState?.title || "Studio Package"}
                </h2>
                <p className="text-xs text-[#7E8CD4]">
                  {runState?.status === "running" ? "Agents generating synchronized artifacts..." : runState?.status === "complete" ? "Complete Greenlight Studio Package Ready" : "Awaiting production run"}
                </p>
              </div>

              {runState?.coverage && (
                <div className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  VERDICT: {runState.coverage.verdict}
                </div>
              )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3">
                <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> Shoot Days
                </span>
                <p className="text-xl font-bold text-white mt-1">
                  {runState?.schedule?.stats.shootDays ?? "—"}
                </p>
                <span className="text-[10px] text-[#5865A8]">
                  {runState?.schedule?.stats.nightShoots ? `${runState.schedule.stats.nightShoots} night shoot(s)` : "Turnaround protected"}
                </span>
              </div>

              <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3">
                <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Audited Budget
                </span>
                <p className="text-xl font-bold text-white mt-1">
                  {runState?.budget?.summary.grandTotal ? `$${runState.budget.summary.grandTotal.toLocaleString()}` : "—"}
                </p>
                <span className="text-[10px] text-[#5865A8]">100% Deterministic Math</span>
              </div>

              <div className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3">
                <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-400" /> Provenance Tags
                </span>
                <p className="text-xl font-bold text-white mt-1">
                  {runState?.budget?.sections.reduce((acc, s) => acc + s.items.length, 0) ?? "—"}
                </p>
                <span className="text-[10px] text-[#5865A8]">Cross-artifact traces</span>
              </div>
            </div>

            {/* Coverage Pull Quote */}
            {runState?.coverage && (
              <div className="bg-[#16192B] border border-[#2B3152] rounded-lg p-4 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Ink Story Analyst Pull Quote
                </span>
                <p className="text-sm italic text-[#EBEFFA]">
                  &ldquo;{runState.coverage.pullQuote}&rdquo;
                </p>
                <p className="text-xs text-[#7E8CD4]">
                  {runState.coverage.verdictRationale}
                </p>
              </div>
            )}

            {/* Breakdown & Schedule Snapshot */}
            {runState?.schedule && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-white">Stripboard Schedule Schedule Snapshot</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {runState.schedule.days.map((day) => (
                    <div key={day.dayNumber} className="bg-[#090A0F] border border-[#1E2438] rounded p-2.5 text-xs">
                      <div className="flex items-center justify-between font-mono text-amber-400 font-bold mb-1">
                        <span>DAY {day.dayNumber} ({day.shootType})</span>
                        <span>{day.totalEighths}/8 pgs</span>
                      </div>
                      <p className="text-[11px] text-[#A8B4EB]">
                        Locations: {day.locations.join(", ")}
                      </p>
                      <p className="text-[10px] text-[#5865A8] mt-1">
                        Cast: {day.castNeeded.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
