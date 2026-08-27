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
  Shirt,
  Music,
  MapPin,
  Clock,
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
      return "bg-rose-500/20 text-rose-300 border-rose-500/50";
    }
    if (level >= 4) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/50";
    }
    if (level >= 3) {
      return "bg-sky-500/20 text-sky-300 border-sky-500/50";
    }
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
  };

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* 1st AD Breakdown Master Header */}
      <div className="bg-[#0B0D14] border border-studio-800/90 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-studio-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/5 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-mono font-bold uppercase tracking-wider text-white">
                  1st AD Scene Breakdown Master Sheet
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">
                  13 Physical Categories
                </span>
              </div>
              <p className="text-xs text-studio-400 font-sans mt-0.5">
                Physical element tagging across props, stunts, practical FX, vehicles, and staging logistics
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div
            role="group"
            aria-label="Scene Breakdown Filters"
            className="flex items-center gap-1.5 bg-[#06080C] border border-studio-800 p-1 rounded-xl font-mono text-xs overflow-x-auto scrollbar-none max-w-full"
          >
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-shrink-0 focus-ring cursor-pointer ${
                filter === "ALL"
                  ? "bg-amber-500 text-black shadow-md font-extrabold"
                  : "text-studio-300 hover:text-white hover:bg-[#141824]"
              }`}
            >
              All Scenes ({breakdown.breakdowns.length})
            </button>
            <button
              onClick={() => setFilter("ACTION_SFX")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 focus-ring cursor-pointer ${
                filter === "ACTION_SFX"
                  ? "bg-amber-500 text-black shadow-md font-extrabold"
                  : "text-studio-300 hover:text-white hover:bg-[#141824]"
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Stunts & SFX
            </button>
            <button
              onClick={() => setFilter("CAST_EXTRAS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 focus-ring cursor-pointer ${
                filter === "CAST_EXTRAS"
                  ? "bg-amber-500 text-black shadow-md font-extrabold"
                  : "text-studio-300 hover:text-white hover:bg-[#141824]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Cast & Extras
            </button>
            <button
              onClick={() => setFilter("VEHICLES_EQUIP")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 focus-ring cursor-pointer ${
                filter === "VEHICLES_EQUIP"
                  ? "bg-amber-500 text-black shadow-md font-extrabold"
                  : "text-studio-300 hover:text-white hover:bg-[#141824]"
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Vehicles & Gear
            </button>
          </div>
        </div>

        {/* Category Legend Bar */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-studio-400 flex-wrap">
          <span className="text-white font-bold uppercase text-[10px]">Department Highlighters:</span>
          <span className="px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 font-bold">Cast & Extras</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">Stunts / SFX</span>
          <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">Action Props</span>
          <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">Vehicles & Rigging</span>
        </div>
      </div>

      {/* Breakdown Scene Sheets */}
      <div className="flex flex-col gap-4">
        {filteredBreakdowns.map((b) => {
          const sceneMeta = scenesMap.get(b.sceneId);
          return (
            <div
              key={b.sceneId}
              className="bg-[#0B0D14] border-2 border-studio-800 hover:border-studio-700 transition rounded-2xl p-6 flex flex-col gap-4 shadow-xl group"
            >
              {/* Scene Heading */}
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-studio-800/80 pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="h-8 px-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-extrabold text-xs flex items-center justify-center shadow-inner">
                    SCENE {b.sceneId}
                  </span>
                  <span className="text-sm md:text-base font-mono font-extrabold text-white">
                    {sceneMeta?.slugline || `Scene ${b.sceneId}`}
                  </span>
                  {sceneMeta && (
                    <span className="text-xs font-mono text-studio-400 bg-[#06080C] px-2.5 py-1 rounded-md border border-studio-800 font-bold">
                      {sceneMeta.pageEighths}/8 pgs · {sceneMeta.intExt} {sceneMeta.timeOfDay}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${getComplexityBadge(
                      b.complexity
                    )}`}
                  >
                    COMPLEXITY {b.complexity} / 5
                  </span>
                </div>
              </div>

              {/* 1st AD Staging Note */}
              <div className="bg-[#06080C] border border-studio-800/90 rounded-xl p-3.5 text-xs text-studio-200 font-mono flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong className="text-white uppercase text-[11px] tracking-wide font-bold">1st AD Directive:</strong>{" "}
                  {b.complexityReason}
                </span>
              </div>

              {/* 13-Department Grid Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                {/* Speaking Cast */}
                <div className="bg-[#06080C] border border-studio-800/80 rounded-xl p-3.5 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-yellow-400 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Speaking Cast
                  </span>
                  <span className="text-white font-medium">
                    {b.cast.length > 0 ? b.cast.join(", ") : "— None"}
                  </span>
                </div>

                {/* Stunts & SFX */}
                <div className="bg-[#06080C] border border-studio-800/80 rounded-xl p-3.5 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Stunts & Practical SFX
                  </span>
                  <span className="text-rose-300 font-medium">
                    {[...b.stunts, ...b.sfx].length > 0 ? [...b.stunts, ...b.sfx].join(", ") : "— None"}
                  </span>
                </div>

                {/* Props & Dressing */}
                <div className="bg-[#06080C] border border-studio-800/80 rounded-xl p-3.5 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Key Action Props
                  </span>
                  <span className="text-studio-200 font-medium">
                    {b.props.length > 0 ? b.props.join(", ") : "— None"}
                  </span>
                </div>

                {/* Vehicles & Special Gear */}
                <div className="bg-[#06080C] border border-studio-800/80 rounded-xl p-3.5 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                    <Wrench className="w-3 h-3" /> Vehicles & Rigging
                  </span>
                  <span className="text-purple-200 font-medium">
                    {[...b.vehicles, ...b.specialEquipment].length > 0
                      ? [...b.vehicles, ...b.specialEquipment].join(", ")
                      : "— None"}
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
