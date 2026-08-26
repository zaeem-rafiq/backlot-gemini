"use client";

import React, { useRef, useEffect } from "react";
import { AgentId, AgentStatusState } from "@/lib/types/events";
import { Users, CheckCircle2, AlertCircle, Clock, Zap, Terminal, ShieldAlert } from "lucide-react";

export interface AgentStatusInfo {
  agent: AgentId;
  name: string;
  role: string;
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

const CREW_METADATA: Array<{ id: AgentId; name: string; role: string }> = [
  { id: "director", name: "Director", role: "Studio Orchestrator" },
  { id: "ink", name: "Ink", role: "Story Analyst" },
  { id: "slate", name: "Slate", role: "1st Assistant Director" },
  { id: "ledger", name: "Ledger", role: "Line Producer" },
  { id: "easel", name: "Easel", role: "Storyboard Artist" },
  { id: "marquee", name: "Marquee", role: "Marketer & Packaging" },
];

export function CrewRail({ statuses, logs, isRunning }: CrewRailProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusBadge = (status: AgentStatusState = "idle") => {
    switch (status) {
      case "working":
        return {
          icon: <Zap className="w-3 h-3 text-amber-400 animate-spin" />,
          label: "WORKING",
          badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        };
      case "done":
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
          label: "READY",
          badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        };
      case "degraded":
        return {
          icon: <AlertCircle className="w-3 h-3 text-amber-400" />,
          label: "DEGRADED",
          badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "error":
        return {
          icon: <ShieldAlert className="w-3 h-3 text-rose-400" />,
          label: "ERROR",
          badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        };
      case "idle":
      default:
        return {
          icon: <Clock className="w-3 h-3 text-[#5865A8]" />,
          label: "STANDBY",
          badgeClass: "bg-[#16192B] text-[#5865A8] border-[#2B3152]",
        };
    }
  };

  const getAgentColor = (agent: AgentId) => {
    switch (agent) {
      case "director":
        return "text-white";
      case "ink":
        return "text-amber-400";
      case "slate":
        return "text-sky-400";
      case "ledger":
        return "text-emerald-400";
      case "easel":
        return "text-violet-400";
      case "marquee":
        return "text-pink-400";
    }
  };

  return (
    <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Crew Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" /> Multi-Agent Crew Roster & Status
        </h3>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Session In Progress
          </span>
        )}
      </div>

      {/* 6 Agent Roster Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {CREW_METADATA.map((member) => {
          const currentStatus = statuses[member.id] || "idle";
          const badge = getStatusBadge(currentStatus);
          return (
            <div
              key={member.id}
              className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition ${
                currentStatus === "working"
                  ? "bg-[#16192B] border-amber-500/40 shadow-md shadow-amber-500/5"
                  : currentStatus === "done"
                  ? "bg-[#090A0F] border-emerald-500/30"
                  : "bg-[#090A0F] border-[#1E2438]"
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-bold font-mono uppercase ${getAgentColor(member.id)}`}>
                  {member.name}
                </span>
                <span className="text-[10px] text-[#7E8CD4] truncate">{member.role}</span>
              </div>

              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold w-fit ${badge.badgeClass}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Live Stream */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1E2438]">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#7E8CD4]">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-amber-400" /> Director Stream Output
          </span>
          <span>{logs.length} events emitted</span>
        </div>

        <div
          ref={logContainerRef}
          className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 font-mono text-[11px] h-40 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-[#2B3152]"
        >
          {logs.length === 0 ? (
            <span className="text-[#5865A8] italic">
              Studio crew on standby. Click &apos;Launch Studio Run&apos; or &apos;Load Sample Package&apos; to dispatch.
            </span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[#5865A8] text-[9px] flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span className={`font-bold uppercase text-[10px] flex-shrink-0 ${getAgentColor(log.agent)}`}>
                  [{log.agent}]
                </span>
                <span
                  className={
                    log.level === "warn"
                      ? "text-amber-300"
                      : log.level === "error"
                      ? "text-rose-400"
                      : "text-[#D0D7F7]"
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
