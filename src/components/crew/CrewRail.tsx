"use client";

import React, { useRef, useEffect } from "react";
import { AgentId, AgentStatusState } from "@/lib/types/events";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Terminal,
  ShieldAlert,
  Cpu,
  Sparkles,
} from "lucide-react";

export interface AgentStatusInfo {
  agent: AgentId;
  name: string;
  department: string;
  role: string;
  model: string;
  activeTask: string;
  status: AgentStatusState;
  message?: string;
}

export interface CrewLogEntry {
  agent: AgentId;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
}

interface CrewRailProps {
  statuses: Record<AgentId, AgentStatusState>;
  logs: CrewLogEntry[];
  isRunning: boolean;
}

export interface CrewDept {
  id: AgentId;
  callsign: string;
  name: string;
  department: string;
  role: string;
  model: string;
  defaultTask: string;
}

export const CREW_DEPARTMENTS: CrewDept[] = [
  {
    id: "director",
    callsign: "DIR",
    name: "Director",
    department: "Executive Office",
    role: "Studio Orchestrator",
    model: "gemini-2.5-flash",
    defaultTask: "Supervising multi-agent execution pipeline",
  },
  {
    id: "ink",
    callsign: "INK",
    name: "Ink",
    department: "Story Dept",
    role: "Story Analyst",
    model: "gemini-2.5-flash",
    defaultTask: "Evaluating narrative premise & coverage rubric",
  },
  {
    id: "slate",
    callsign: "SLATE",
    name: "Slate",
    department: "Production Office",
    role: "1st Assistant Director",
    model: "gemini-2.5-flash",
    defaultTask: "Cataloging 13-category scene elements",
  },
  {
    id: "ledger",
    callsign: "LEDGER",
    name: "Ledger",
    department: "Production Accounting",
    role: "Line Producer",
    model: "deterministic-pure-math",
    defaultTask: "Calculating stripboard & audited top sheet",
  },
  {
    id: "easel",
    callsign: "EASEL",
    name: "Easel",
    department: "Camera & Previz",
    role: "Storyboard Artist",
    model: "gemini-2.5-flash / previz",
    defaultTask: "Designing 2.39:1 shot blocking & lenses",
  },
  {
    id: "marquee",
    callsign: "MARQ",
    name: "Marquee",
    department: "Sales & Packaging",
    role: "Market & Distribution",
    model: "parallel-search-api",
    defaultTask: "Querying live festival & box-office comps",
  },
];

export function CrewRail({ statuses, logs, isRunning }: CrewRailProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [selectedAgentFilter, setSelectedAgentFilter] = React.useState<AgentId | "ALL">("ALL");

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLatestAgentMessage = (agentId: AgentId) => {
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].agent === agentId) {
        return logs[i].message;
      }
    }
    return null;
  };

  const filteredLogs = selectedAgentFilter === "ALL" 
    ? logs 
    : logs.filter((l) => l.agent === selectedAgentFilter);

  const getStatusBadge = (status: AgentStatusState = "idle") => {
    switch (status) {
      case "working":
        return {
          icon: <Radio className="w-2.5 h-2.5 text-amber-400 animate-pulse" />,
          label: "ACTIVE",
          badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
          cardBorder: "border-amber-500/50 bg-[#121622] shadow-lg shadow-amber-500/5",
          vuActive: 4,
        };
      case "done":
        return {
          icon: <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />,
          label: "READY",
          badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          cardBorder: "border-emerald-500/30 bg-[#0C0F17]",
          vuActive: 3,
        };
      case "degraded":
        return {
          icon: <AlertCircle className="w-2.5 h-2.5 text-amber-400" />,
          label: "DEGRADED",
          badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          cardBorder: "border-amber-500/30 bg-[#0F121A]",
          vuActive: 2,
        };
      case "error":
        return {
          icon: <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />,
          label: "ALERT",
          badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          cardBorder: "border-rose-500/40 bg-[#0F121A]",
          vuActive: 1,
        };
      case "idle":
      default:
        return {
          icon: <Clock className="w-2.5 h-2.5 text-studio-400" />,
          label: "STANDBY",
          badgeClass: "bg-[#151924] text-studio-400 border-studio-700",
          cardBorder: "border-studio-800 bg-[#08090D]",
          vuActive: 0,
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

  return (
    <div className="bg-[#0B0D14] border border-studio-800 rounded-xl p-3.5 sm:p-4 md:p-5 flex flex-col gap-4 shadow-2xl hairline-grid">
      {/* Studio Rack Control Header */}
      <div className="flex items-start sm:items-center justify-between border-b border-studio-800 pb-3 flex-wrap gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-8 w-8 rounded bg-[#151924] border border-studio-700 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Cinema Production Deck</span>
                <span className="text-[10px] text-amber-400 font-normal">/ 6 Channel Strips</span>
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-studio-850 text-studio-300 border border-studio-700 font-bold uppercase">
                Parallel Multi-Agent Mesh
              </span>
            </div>
            <p className="text-[11px] text-studio-400">
              Supervised multi-agent department execution with live cross-stream telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isRunning ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/50 text-amber-300 font-mono text-[10px] sm:text-[11px] whitespace-nowrap shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
              <span className="font-extrabold tracking-wide">ON AIR · DISPATCH LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#101522] border border-emerald-500/30 text-emerald-400 font-mono text-[10px] sm:text-[11px] whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="font-bold tracking-wide">ALL UNITS STANDBY</span>
            </div>
          )}
        </div>
      </div>

      {/* 6 Hardware-Grade Department Channel Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {CREW_DEPARTMENTS.map((member, idx) => {
          const currentStatus = statuses[member.id] || "idle";
          const badge = getStatusBadge(currentStatus);
          const latestMsg = getLatestAgentMessage(member.id);
          const isSelected = selectedAgentFilter === member.id;

          return (
            <div
              key={member.id}
              onClick={() => setSelectedAgentFilter(isSelected ? "ALL" : member.id)}
              className={`p-2.5 sm:p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 cursor-pointer group focus-ring ${badge.cardBorder} ${
                isSelected ? "ring-1 ring-amber-400/80 border-amber-400" : "hover:border-studio-700"
              }`}
              title={`Click to filter telemetry log for ${member.name}`}
            >
              {/* Channel Index & Header */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 text-[9px] font-mono">
                  <span className="text-studio-400 font-bold">CH 0{idx + 1}</span>
                  <span
                    className={`font-mono font-bold px-1 py-0.5 rounded border uppercase tracking-wider ${getCallsignTag(
                      member.id
                    )}`}
                  >
                    {member.callsign}
                  </span>
                </div>

                <div className="pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white block truncate group-hover:text-amber-300 transition">
                      {member.name}
                    </span>
                    {/* Hardware VU Segment Meter */}
                    <div className="flex items-center gap-0.5" title={`Signal Level: ${badge.vuActive}/4`}>
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`w-1 h-2 rounded-[1px] ${
                            seg <= badge.vuActive
                              ? seg === 4
                                ? "bg-amber-400"
                                : seg >= 2
                                ? "bg-emerald-400"
                                : "bg-emerald-500"
                              : "bg-studio-800/80"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-studio-300 font-medium block truncate">
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Dynamic Task Readout */}
              <div className="bg-[#050608] border border-studio-800/80 rounded p-1.5 sm:p-2 text-[10px] font-mono min-h-[44px] flex flex-col justify-center">
                {currentStatus === "working" ? (
                  <span className="text-amber-300 leading-snug flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-amber-400 animate-spin flex-shrink-0" />
                    <span className="line-clamp-2">{latestMsg || member.defaultTask}</span>
                  </span>
                ) : latestMsg ? (
                  <span className="text-studio-300 line-clamp-2 leading-snug font-mono">
                    {latestMsg}
                  </span>
                ) : (
                  <span className="text-studio-400 italic line-clamp-2 leading-snug">
                    {member.defaultTask}
                  </span>
                )}
              </div>

              {/* Footer: Model & Status Tag */}
              <div className="flex items-center justify-between pt-1 border-t border-studio-800/60 gap-1">
                <div className="flex items-center gap-1 text-[9px] font-mono text-studio-400 truncate min-w-0" title={member.model}>
                  <Cpu className="w-2.5 h-2.5 text-studio-400 flex-shrink-0" />
                  <span className="truncate">{member.model.split("/")[0]}</span>
                </div>
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold flex-shrink-0 ${badge.badgeClass}`}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* On-Set Production Radio & Live Wire Log */}
      <div className="flex flex-col gap-2 pt-1 border-t border-studio-800">
        <div className="flex items-center justify-between text-[11px] font-mono text-studio-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <Terminal className="w-3.5 h-3.5 text-amber-400" /> On-Set Production Wire
            </span>
            <span className="text-[10px] text-studio-400 font-mono">
              ({filteredLogs.length} event{filteredLogs.length === 1 ? "" : "s"})
            </span>
          </div>

          {/* Log Filter Pills */}
          <div className="flex items-center gap-1 text-[10px] font-mono overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedAgentFilter("ALL")}
              className={`px-2 py-0.5 rounded transition focus-ring ${
                selectedAgentFilter === "ALL"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-[#08090D] text-studio-400 hover:text-white border border-studio-800"
              }`}
            >
              All Units
            </button>
            {CREW_DEPARTMENTS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedAgentFilter(m.id)}
                className={`px-1.5 py-0.5 rounded transition uppercase focus-ring ${
                  selectedAgentFilter === m.id
                    ? "bg-amber-500 text-black font-bold"
                    : "bg-[#08090D] text-studio-400 hover:text-white border border-studio-800"
                }`}
              >
                {m.callsign}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={logContainerRef}
          className="bg-[#050609] border border-studio-800 rounded-lg p-3 font-mono text-xs h-32 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-studio-700"
        >
          {filteredLogs.length === 0 ? (
            <span className="text-studio-400 italic font-mono text-xs">
              No wire events matching filter. Click &quot;Dispatch Studio Crew&quot; or &quot;Load Sample Production&quot; to initialize transmission.
            </span>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed font-mono">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
