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

interface CrewDept {
  id: AgentId;
  callsign: string;
  name: string;
  department: string;
  role: string;
  model: string;
  defaultTask: string;
}

const CREW_DEPARTMENTS: CrewDept[] = [
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

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Find latest log emitted by each agent
  const getLatestAgentMessage = (agentId: AgentId) => {
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].agent === agentId) {
        return logs[i].message;
      }
    }
    return null;
  };

  const getStatusBadge = (status: AgentStatusState = "idle") => {
    switch (status) {
      case "working":
        return {
          icon: <Radio className="w-3 h-3 text-amber-400 animate-pulse" />,
          label: "DISPATCHING",
          badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
          cardBorder: "border-amber-500/50 shadow-lg shadow-amber-500/5 bg-[#141824]",
        };
      case "done":
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
          label: "ON SET / READY",
          badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          cardBorder: "border-emerald-500/20 bg-[#0F121A]",
        };
      case "degraded":
        return {
          icon: <AlertCircle className="w-3 h-3 text-amber-400" />,
          label: "DEGRADED",
          badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          cardBorder: "border-amber-500/30 bg-[#0F121A]",
        };
      case "error":
        return {
          icon: <ShieldAlert className="w-3 h-3 text-rose-400" />,
          label: "ALERT",
          badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          cardBorder: "border-rose-500/40 bg-[#0F121A]",
        };
      case "idle":
      default:
        return {
          icon: <Clock className="w-3 h-3 text-studio-400" />,
          label: "STANDBY",
          badgeClass: "bg-[#151924] text-studio-400 border-studio-700",
          cardBorder: "border-studio-800 bg-[#0B0D13]",
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
    <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-2xl">
      {/* Call Sheet Header */}
      <div className="flex items-center justify-between border-b border-studio-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Studio Call Sheet & Crew Roster
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-850 text-studio-300 border border-studio-700">
                6 Autonomous Department Heads
              </span>
            </div>
            <p className="text-[11px] text-studio-400">
              Departmental multi-agent crew operating in parallel under Director supervision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>CREW DISPATCH LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>CREW CALL READY</span>
            </div>
          )}
        </div>
      </div>

      {/* 6 Department Cards (Personified Film Units) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        {CREW_DEPARTMENTS.map((member) => {
          const currentStatus = statuses[member.id] || "idle";
          const badge = getStatusBadge(currentStatus);
          const latestMsg = getLatestAgentMessage(member.id);

          return (
            <div
              key={member.id}
              className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2.5 ${badge.cardBorder}`}
            >
              {/* Department Header */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getCallsignTag(
                      member.id
                    )}`}
                  >
                    {member.callsign}
                  </span>
                  <span className="text-[9px] font-mono text-studio-400 truncate max-w-[80px]">
                    {member.department}
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-xs font-mono font-bold text-white block">
                    {member.name}
                  </span>
                  <span className="text-[10px] text-studio-300 font-medium block truncate">
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Dynamic Task or Emitted Output */}
              <div className="bg-[#08090D] border border-studio-800/80 rounded p-2 text-[10px] font-mono min-h-[46px] flex flex-col justify-center">
                {currentStatus === "working" ? (
                  <span className="text-amber-300 leading-snug flex items-center gap-1.5">
                    <Radio className="w-2.5 h-2.5 text-amber-400 animate-spin flex-shrink-0" />
                    <span className="line-clamp-2">{latestMsg || member.defaultTask}</span>
                  </span>
                ) : latestMsg ? (
                  <span className="text-studio-300 line-clamp-2 leading-snug">
                    {latestMsg}
                  </span>
                ) : (
                  <span className="text-studio-500 italic line-clamp-2 leading-snug">
                    {member.defaultTask}
                  </span>
                )}
              </div>

              {/* Footer: Model & Status Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-studio-800/60">
                <div className="flex items-center gap-1 text-[9px] font-mono text-studio-400 truncate" title={member.model}>
                  <Cpu className="w-2.5 h-2.5 text-studio-400 flex-shrink-0" />
                  <span className="truncate">{member.model.split("/")[0]}</span>
                </div>
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold ${badge.badgeClass}`}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* On-Set Production Radio & Director Dispatch Log */}
      <div className="flex flex-col gap-2 pt-2 border-t border-studio-800">
        <div className="flex items-center justify-between text-[11px] font-mono text-studio-400">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <Terminal className="w-3.5 h-3.5 text-amber-400" /> On-Set Production Wire & Agent Dispatch Log
          </span>
          <span className="text-[10px] text-studio-400">{logs.length} events logged</span>
        </div>

        <div
          ref={logContainerRef}
          className="bg-[#08090D] border border-studio-800 rounded-lg p-3 font-mono text-xs h-36 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-studio-700"
        >
          {logs.length === 0 ? (
            <span className="text-studio-500 italic">
              Studio crew on standby. Click &quot;Dispatch Studio Crew&quot; or &quot;Load Sample Production&quot; to initialize on-set wire.
            </span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-studio-500 text-[10px] flex-shrink-0 pt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span
                  className={`font-bold uppercase text-[10px] px-1 rounded flex-shrink-0 ${getCallsignTag(
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
