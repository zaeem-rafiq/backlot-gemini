"use client";

import React, { useState } from "react";
import { RevisionAnalysis, SceneDiff, BudgetLineItemDiff } from "@/lib/types/revision";
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Film,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Truck,
  Sparkles,
} from "lucide-react";

interface RevisionDiffViewProps {
  revision: RevisionAnalysis;
  onRerenderStaleFrames?: (staleFrameIds: string[]) => void;
}

export function RevisionDiffView({ revision, onRerenderStaleFrames }: RevisionDiffViewProps) {
  const [selectedTab, setSelectedTab] = useState<"summary" | "scenes" | "budget" | "previz">("summary");
  const [expandedScenes, setExpandedScenes] = useState<Record<number, boolean>>({});

  const { scriptDiff, scheduleDelta, budgetDelta, invalidationManifest } = revision;

  const toggleSceneExpand = (sceneId: number) => {
    setExpandedScenes((prev) => ({
      ...prev,
      [sceneId]: !prev[sceneId],
    }));
  };

  const isBudgetPositive = budgetDelta.grandTotalDelta > 0;
  const isBudgetNegative = budgetDelta.grandTotalDelta < 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto animate-document-land">
      {/* HEADER BANNER */}
      <div className="bg-[#0B0D14] border border-studio-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-studio-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Script Revision & Cascade Invalidation</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  DELTA ENGINE
                </span>
              </div>
              <p className="text-xs text-studio-400 mt-0.5">
                Deterministic schedule & budget recalculation with cross-artifact provenance tracing
              </p>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex items-center gap-1 bg-[#06080C] p-1 rounded-xl border border-studio-800 self-start md:self-auto">
            {(
              [
                { id: "summary", label: "Executive Delta", icon: GitCompare },
                { id: "scenes", label: `Scenes (${scriptDiff.modifiedSceneIds.length + scriptDiff.addedSceneIds.length})`, icon: Film },
                { id: "budget", label: "Budget Variance", icon: DollarSign },
                { id: "previz", label: `Stale Previz (${invalidationManifest.staleFrameIds.length})`, icon: AlertTriangle },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition focus-ring cursor-pointer ${
                    active
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-studio-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* EXECUTIVE KPI DELTA CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* 1. Net Budget Variance */}
          <div className="bg-[#06080C] border border-studio-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-studio-400 font-bold">
                Net Budget Variance
              </span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono ${
                  isBudgetPositive ? "text-amber-400" : isBudgetNegative ? "text-emerald-400" : "text-white"
                }`}
              >
                {isBudgetPositive ? "+" : isBudgetNegative ? "-" : ""}$
                {Math.abs(budgetDelta.grandTotalDelta).toLocaleString()}
              </span>
              <span
                className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                  isBudgetPositive ? "text-amber-400" : isBudgetNegative ? "text-emerald-400" : "text-studio-400"
                }`}
              >
                {isBudgetPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : isBudgetNegative ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : null}
                {budgetDelta.percentChange > 0 ? "+" : ""}
                {budgetDelta.percentChange}%
              </span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-studio-400 flex items-center justify-between border-t border-studio-800/60 pt-2">
              <span>Original: ${budgetDelta.originalGrandTotal.toLocaleString()}</span>
              <span>Revised: ${budgetDelta.revisedGrandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* 2. Shooting Schedule Shift */}
          <div className="bg-[#06080C] border border-studio-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-studio-400 font-bold">
                Production Duration
              </span>
              <Calendar className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {scheduleDelta.shootDaysDelta > 0 ? `+${scheduleDelta.shootDaysDelta}` : scheduleDelta.shootDaysDelta}{" "}
                <span className="text-sm font-normal text-studio-400">Day(s)</span>
              </span>
              <span className="text-xs font-mono text-studio-400">
                (Total: {scheduleDelta.revisedShootDays} Days)
              </span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-studio-400 flex items-center justify-between border-t border-studio-800/60 pt-2">
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-amber-400" /> Moves: {scheduleDelta.revisedCompanyMoves}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-violet-400" /> Nights: {scheduleDelta.revisedNightDays}
              </span>
            </div>
          </div>

          {/* 3. Screenplay Scope Shift */}
          <div className="bg-[#06080C] border border-studio-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-studio-400 font-bold">
                Screenplay Scope
              </span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {scriptDiff.totalPagesDeltaEighths > 0
                  ? `+${scriptDiff.totalPagesDeltaEighths}`
                  : scriptDiff.totalPagesDeltaEighths}
                /8 <span className="text-sm font-normal text-studio-400">Pages</span>
              </span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-studio-400 flex items-center justify-between border-t border-studio-800/60 pt-2">
              <span className="text-emerald-400">+{scriptDiff.addedSceneIds.length} Added</span>
              <span className="text-amber-400">{scriptDiff.modifiedSceneIds.length} Modified</span>
              <span className="text-red-400">-{scriptDiff.removedSceneIds.length} Deleted</span>
            </div>
          </div>

          {/* 4. Previz Cascade Invalidation */}
          <div className="bg-[#06080C] border border-studio-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-studio-400 font-bold">
                Downstream Previz
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {invalidationManifest.staleFrameIds.length}{" "}
                <span className="text-sm font-normal text-studio-400">Stale Frames</span>
              </span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-studio-400 flex items-center justify-between border-t border-studio-800/60 pt-2">
              <span className="text-emerald-400">{invalidationManifest.reusableFrameIds.length} Reusable</span>
              <span className="text-studio-500">Across {invalidationManifest.staleSceneIds.length} Scene(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. EXECUTIVE SUMMARY TAB */}
      {selectedTab === "summary" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Impact & Drivers */}
          <div className="lg:col-span-2 bg-[#0B0D14] border border-studio-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" /> Key Revision Takeaways & Operational Impacts
            </h3>
            
            <div className="space-y-2">
              {scheduleDelta.impactSummary.map((summary, idx) => (
                <div key={idx} className="bg-[#06080C] border border-studio-800/80 rounded-xl p-3 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-xs font-mono text-studio-200">{summary}</span>
                </div>
              ))}
              {budgetDelta.primaryDrivers.map((driver, idx) => (
                <div key={`d-${idx}`} className="bg-[#06080C] border border-studio-800/80 rounded-xl p-3 flex items-start gap-3">
                  <DollarSign className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-xs font-mono text-studio-200">{driver}</span>
                </div>
              ))}
            </div>

            {/* Global Cast & Location Shifts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-[#06080C] border border-studio-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-studio-300 mb-2">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Cast Ensemble Shifts
                </div>
                {scriptDiff.castChanges.added.length > 0 && (
                  <div className="text-[11px] font-mono text-emerald-400 mb-1">
                    <span className="font-bold">Added:</span> {scriptDiff.castChanges.added.join(", ")}
                  </div>
                )}
                {scriptDiff.castChanges.removed.length > 0 && (
                  <div className="text-[11px] font-mono text-red-400">
                    <span className="font-bold">Removed:</span> {scriptDiff.castChanges.removed.join(", ")}
                  </div>
                )}
                {scriptDiff.castChanges.added.length === 0 && scriptDiff.castChanges.removed.length === 0 && (
                  <span className="text-[11px] font-mono text-studio-500">No primary character roster changes.</span>
                )}
              </div>

              <div className="bg-[#06080C] border border-studio-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-studio-300 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> Location Roster Shifts
                </div>
                {scriptDiff.locationChanges.added.length > 0 && (
                  <div className="text-[11px] font-mono text-emerald-400 mb-1">
                    <span className="font-bold">Added:</span> {scriptDiff.locationChanges.added.join(", ")}
                  </div>
                )}
                {scriptDiff.locationChanges.removed.length > 0 && (
                  <div className="text-[11px] font-mono text-red-400">
                    <span className="font-bold">Removed:</span> {scriptDiff.locationChanges.removed.join(", ")}
                  </div>
                )}
                {scriptDiff.locationChanges.added.length === 0 && scriptDiff.locationChanges.removed.length === 0 && (
                  <span className="text-[11px] font-mono text-studio-500">No primary location changes.</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Previz Invalidation Card */}
          <div className="bg-[#0B0D14] border border-studio-800 rounded-2xl p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Stale Previz Assets
              </div>
              <p className="text-xs text-studio-400">
                Screenplay changes invalidate visual blocking and camera framing for modified scenes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="bg-[#06080C] border border-studio-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
                <span className="text-studio-400">Affected Scene IDs:</span>
                <span className="text-amber-400 font-bold">
                  {invalidationManifest.staleSceneIds.length > 0
                    ? invalidationManifest.staleSceneIds.join(", ")
                    : "None"}
                </span>
              </div>
              <div className="bg-[#06080C] border border-studio-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
                <span className="text-studio-400">Invalidated Frames:</span>
                <span className="text-amber-400 font-bold">
                  {invalidationManifest.staleFrameIds.length > 0
                    ? invalidationManifest.staleFrameIds.join(", ")
                    : "None"}
                </span>
              </div>
            </div>

            {onRerenderStaleFrames && invalidationManifest.staleFrameIds.length > 0 && (
              <button
                onClick={() => onRerenderStaleFrames(invalidationManifest.staleFrameIds)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-render Stale Previz ({invalidationManifest.staleFrameIds.length} Frames)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. SCENE-BY-SCENE DIFF TAB */}
      {selectedTab === "scenes" && (
        <div className="bg-[#0B0D14] border border-studio-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-studio-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" /> Scene-by-Scene Script Audit
            </h3>
            <span className="text-xs font-mono text-studio-400">
              {scriptDiff.scenesDiff.length} Total Scenes Tracked
            </span>
          </div>

          <div className="space-y-3">
            {scriptDiff.scenesDiff.map((sd: SceneDiff) => {
              const isExpanded = !!expandedScenes[sd.sceneId];
              const isAdded = sd.changeType === "added";
              const isRemoved = sd.changeType === "removed";
              const isModified = sd.changeType === "modified";

              return (
                <div
                  key={sd.sceneId}
                  className={`bg-[#06080C] border rounded-xl overflow-hidden transition ${
                    isAdded
                      ? "border-emerald-500/40"
                      : isRemoved
                      ? "border-red-500/40 opacity-75"
                      : isModified
                      ? "border-amber-500/40"
                      : "border-studio-800/60"
                  }`}
                >
                  {/* SCENE HEADER ROW */}
                  <div
                    onClick={() => toggleSceneExpand(sd.sceneId)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-studio-800 text-studio-300 font-mono text-[10px] font-bold">
                        SCENE {sd.sceneId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                          isAdded
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isRemoved
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : isModified
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-studio-800 text-studio-400"
                        }`}
                      >
                        {sd.changeType}
                      </span>
                      <span className="text-xs font-mono text-white font-bold truncate max-w-md">
                        {sd.revisedScene?.slugline || sd.originalScene?.slugline}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {sd.pageEighthsDelta !== 0 && (
                        <span
                          className={`text-xs font-mono font-bold ${
                            sd.pageEighthsDelta > 0 ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {sd.pageEighthsDelta > 0 ? `+${sd.pageEighthsDelta}` : sd.pageEighthsDelta}/8 pages
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-studio-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-studio-400" />
                      )}
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="border-t border-studio-800 p-4 bg-[#080A10] flex flex-col gap-3">
                      {sd.changes.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] uppercase font-mono text-studio-400 font-bold">
                            Detected Changes:
                          </span>
                          <div className="space-y-1">
                            {sd.changes.map((ch, i) => (
                              <div
                                key={i}
                                className="text-xs font-mono text-studio-200 flex items-center gap-2 bg-[#040609] p-2 rounded-lg border border-studio-800/80"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>{ch}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Side by side comparison */}
                      {sd.originalScene && sd.revisedScene && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                          <div className="bg-[#040609] border border-studio-800 p-3 rounded-lg flex flex-col gap-1 text-[11px] font-mono">
                            <span className="text-[9px] uppercase text-studio-500 font-bold">Original Scene</span>
                            <span className="text-studio-300">Location: {sd.originalScene.location}</span>
                            <span className="text-studio-300">Time: {sd.originalScene.timeOfDay}</span>
                            <span className="text-studio-300">Cast: {sd.originalScene.characters.join(", ")}</span>
                            <span className="text-studio-300">Length: {sd.originalScene.pageEighths}/8 pages</span>
                          </div>
                          <div className="bg-[#040609] border border-amber-500/30 p-3 rounded-lg flex flex-col gap-1 text-[11px] font-mono">
                            <span className="text-[9px] uppercase text-amber-400 font-bold">Revised Scene</span>
                            <span className="text-white">Location: {sd.revisedScene.location}</span>
                            <span className="text-white">Time: {sd.revisedScene.timeOfDay}</span>
                            <span className="text-white">Cast: {sd.revisedScene.characters.join(", ")}</span>
                            <span className="text-white">Length: {sd.revisedScene.pageEighths}/8 pages</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. BUDGET VARIANCE TAB */}
      {selectedTab === "budget" && (
        <div className="bg-[#0B0D14] border border-studio-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-studio-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Line Item Variance Ledger & Provenance
            </h3>
            <span className="text-xs font-mono font-bold text-white">
              Grand Total Delta:{" "}
              <span className={isBudgetPositive ? "text-amber-400" : isBudgetNegative ? "text-emerald-400" : ""}>
                {isBudgetPositive ? "+$" : isBudgetNegative ? "-$" : "$"}
                {Math.abs(budgetDelta.grandTotalDelta).toLocaleString()} ({budgetDelta.percentChange}%)
              </span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-studio-800 text-[10px] text-studio-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Line Item</th>
                  <th className="py-2.5 px-3 text-right">Original</th>
                  <th className="py-2.5 px-3 text-right">Revised</th>
                  <th className="py-2.5 px-3 text-right">Variance</th>
                  <th className="py-2.5 px-3">Traces To Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-800/40">
                {budgetDelta.lineItemDiffs
                  .filter((item: BudgetLineItemDiff) => item.status !== "unchanged")
                  .map((item: BudgetLineItemDiff, idx: number) => {
                    const isInc = item.status === "increased" || item.status === "added";
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-bold text-studio-300">{item.category}</td>
                        <td className="py-2.5 px-3 text-white flex items-center gap-1.5">
                          {item.status === "added" ? (
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : item.status === "removed" ? (
                            <MinusCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span>{item.item}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-studio-400">${item.originalTotal.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-white font-bold">${item.revisedTotal.toLocaleString()}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isInc ? "text-amber-400" : "text-emerald-400"}`}>
                          {item.deltaTotal > 0 ? `+$${item.deltaTotal.toLocaleString()}` : `-$${Math.abs(item.deltaTotal).toLocaleString()}`}
                        </td>
                        <td className="py-2.5 px-3 text-[10px] text-studio-400 max-w-xs truncate" title={item.tracesTo}>
                          {item.tracesTo}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PREVIZ INVALIDATION TAB */}
      {selectedTab === "previz" && (
        <div className="bg-[#0B0D14] border border-studio-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-studio-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Stale Storyboard Previz Manifest
            </h3>
            <span className="text-xs font-mono text-studio-400">
              {invalidationManifest.staleFrameIds.length} Frames Stale / {invalidationManifest.reusableFrameIds.length} Reusable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stale List */}
            <div className="bg-[#06080C] border border-amber-500/40 rounded-xl p-4 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Stale Frames (Require Re-render)
              </span>
              {invalidationManifest.staleFrameIds.length > 0 ? (
                <div className="space-y-2">
                  {invalidationManifest.staleFrameIds.map((fId) => (
                    <div key={fId} className="bg-[#0B0D14] border border-studio-800 p-2.5 rounded-lg flex items-center justify-between font-mono text-xs">
                      <span className="text-white font-bold">FRAME {fId}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        STALE / REVISED
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-mono text-studio-500">No storyboard frames invalidated.</span>
              )}
            </div>

            {/* Reusable List */}
            <div className="bg-[#06080C] border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Reusable Frames (Zero GPU Quota Used)
              </span>
              {invalidationManifest.reusableFrameIds.length > 0 ? (
                <div className="space-y-2">
                  {invalidationManifest.reusableFrameIds.map((fId) => (
                    <div key={fId} className="bg-[#0B0D14] border border-studio-800 p-2.5 rounded-lg flex items-center justify-between font-mono text-xs">
                      <span className="text-white font-bold">FRAME {fId}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        UNCHANGED
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-mono text-studio-500">All frames affected.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
