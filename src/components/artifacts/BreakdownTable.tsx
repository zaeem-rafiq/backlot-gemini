"use client";

import React, { useState } from "react";
import { ScriptBreakdown } from "@/lib/types/breakdown";
import { ScriptParse } from "@/lib/types/screenplay";
import {
  SlidersHorizontal,
  Flame,
  AlertCircle,
  Zap,
  Shield,
  Car,
  Wrench,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

interface BreakdownTableProps {
  breakdown: ScriptBreakdown;
  scriptParse?: ScriptParse;
}

export function BreakdownTable({ breakdown, scriptParse }: BreakdownTableProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTION_SFX" | "CAST_EXTRAS" | "VEHICLES_EQUIP">("ALL");

  const scenesMap = new Map(scriptParse?.scenes.map((s) => [s.id, s]));

  const filteredBreakdowns = breakdown.breakdowns.filter((b) => {
    if (filter === "ACTION_SFX") {
      return b.stunts.length > 0 || b.sfx.length > 0 || b.vfx.length > 0;
    }
    if (filter === "CAST_EXTRAS") {
      return b.cast.length > 0 || b.background.length > 0;
    }
    if (filter === "VEHICLES_EQUIP") {
      return b.vehicles.length > 0 || b.specialEquipment.length > 0;
    }
    return true;
  });

  const getComplexityBadge = (level: number) => {
    if (level >= 5) {
      return "bg-rose-500/15 text-rose-400 border-rose-500/40";
    }
    if (level >= 4) {
      return "bg-amber-500/15 text-amber-300 border-amber-500/40";
    }
    if (level >= 3) {
      return "bg-sky-500/15 text-sky-300 border-sky-500/40";
    }
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  };

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* 1st AD Breakdown Header Banner */}
      <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-studio-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  1st AD Scene Breakdown Sheet
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-850 text-studio-300 border border-studio-700 font-bold">
                  13 Physical Categories
                </span>
              </div>
              <p className="text-xs text-studio-400">
                Departmental tag indexing for props, stunts, practical FX, vehicles, and staging logistics
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#08090D] border border-studio-800 p-1 rounded-lg font-mono text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded text-[11px] font-bold transition ${
                filter === "ALL"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-studio-400 hover:text-white"
              }`}
            >
              All Scenes ({breakdown.breakdowns.length})
            </button>
            <button
              onClick={() => setFilter("ACTION_SFX")}
              className={`px-3 py-1.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                filter === "ACTION_SFX"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-studio-400 hover:text-white"
              }`}
            >
              <Flame className="w-3 h-3" /> Stunts & SFX
            </button>
            <button
              onClick={() => setFilter("CAST_EXTRAS")}
              className={`px-3 py-1.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                filter === "CAST_EXTRAS"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-studio-400 hover:text-white"
              }`}
            >
              <Shield className="w-3 h-3" /> Cast & Extras
            </button>
            <button
              onClick={() => setFilter("VEHICLES_EQUIP")}
              className={`px-3 py-1.5 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                filter === "VEHICLES_EQUIP"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-studio-400 hover:text-white"
              }`}
            >
              <Car className="w-3 h-3" /> Vehicles & Gear
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Scene Sheets */}
      <div className="flex flex-col gap-4">
        {filteredBreakdowns.map((b) => {
          const sceneMeta = scenesMap.get(b.sceneId);
          return (
            <div
              key={b.sceneId}
              className="bg-[#0F121A] border-2 border-studio-800 hover:border-studio-700 transition rounded-xl p-5 flex flex-col gap-4 shadow-lg"
            >
              {/* Scene Heading */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-studio-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="h-7 px-2.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-extrabold text-xs flex items-center justify-center">
                    SCENE {b.sceneId}
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {sceneMeta?.slugline || `Scene ${b.sceneId}`}
                  </span>
                  {sceneMeta && (
                    <span className="text-xs font-mono text-studio-400">
                      ({sceneMeta.pageEighths}/8 pgs · {sceneMeta.timeOfDay})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded border font-bold uppercase ${getComplexityBadge(
                      b.complexity
                    )}`}
                  >
                    COMPLEXITY {b.complexity} / 5
                  </span>
                </div>
              </div>

              {/* 1st AD Staging Note */}
              <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 text-xs text-studio-300 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong className="text-white uppercase text-[10px]">1st AD Constraint:</strong>{" "}
                  {b.complexityReason}
                </span>
              </div>

              {/* 13-Department Grid Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
                {/* Speaking Cast */}
                <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-studio-400">
                    Speaking Cast
                  </span>
                  <span className="text-white font-medium">
                    {b.cast.length > 0 ? b.cast.join(", ") : "—"}
                  </span>
                </div>

                {/* Stunts & SFX */}
                <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Stunts & Practical SFX
                  </span>
                  <span className="text-rose-300 font-medium">
                    {[...b.stunts, ...b.sfx].length > 0 ? [...b.stunts, ...b.sfx].join(", ") : "—"}
                  </span>
                </div>

                {/* Props & Dressing */}
                <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-studio-400">
                    Action Props
                  </span>
                  <span className="text-studio-200 font-medium">
                    {b.props.length > 0 ? b.props.join(", ") : "—"}
                  </span>
                </div>

                {/* Vehicles & Special Gear */}
                <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <Wrench className="w-3 h-3" /> Vehicles & Special Gear
                  </span>
                  <span className="text-amber-200 font-medium">
                    {[...b.vehicles, ...b.specialEquipment].length > 0
                      ? [...b.vehicles, ...b.specialEquipment].join(", ")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
