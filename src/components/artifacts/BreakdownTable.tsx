"use client";

import React, { useState } from "react";
import { ScriptBreakdown, SceneBreakdown } from "@/lib/types/breakdown";
import { ScriptParse } from "@/lib/types/screenplay";
import { SlidersHorizontal, Flame, AlertCircle, Zap, Shield, Car, Wrench } from "lucide-react";

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
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
    if (level >= 4) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
    if (level >= 3) {
      return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    }
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2438] pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono uppercase text-[#A8B4EB]">
            13-Element 1st AD Breakdown Matrix ({breakdown.breakdowns.length} scenes)
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#090A0F] border border-[#1E2438] p-1 rounded-lg">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
              filter === "ALL" ? "bg-amber-500 text-black font-semibold" : "text-[#7E8CD4] hover:text-white"
            }`}
          >
            All Scenes
          </button>
          <button
            onClick={() => setFilter("ACTION_SFX")}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition flex items-center gap-1 ${
              filter === "ACTION_SFX" ? "bg-amber-500 text-black font-semibold" : "text-[#7E8CD4] hover:text-white"
            }`}
          >
            <Flame className="w-3 h-3" /> Stunts & SFX
          </button>
          <button
            onClick={() => setFilter("CAST_EXTRAS")}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition flex items-center gap-1 ${
              filter === "CAST_EXTRAS" ? "bg-amber-500 text-black font-semibold" : "text-[#7E8CD4] hover:text-white"
            }`}
          >
            <Shield className="w-3 h-3" /> Cast & Extras
          </button>
          <button
            onClick={() => setFilter("VEHICLES_EQUIP")}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition flex items-center gap-1 ${
              filter === "VEHICLES_EQUIP" ? "bg-amber-500 text-black font-semibold" : "text-[#7E8CD4] hover:text-white"
            }`}
          >
            <Car className="w-3 h-3" /> Vehicles & Gear
          </button>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="flex flex-col gap-3">
        {filteredBreakdowns.map((b) => {
          const sceneMeta = scenesMap.get(b.sceneId);
          return (
            <div
              key={b.sceneId}
              className="bg-[#101420] border border-[#1E2438] hover:border-[#2B3152] transition rounded-xl p-4 flex flex-col gap-3"
            >
              {/* Scene Heading */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-6 px-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                    SCENE {b.sceneId}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {sceneMeta?.slugline || `Scene ${b.sceneId}`}
                  </span>
                  {sceneMeta && (
                    <span className="text-[10px] font-mono text-[#7E8CD4]">
                      ({sceneMeta.pageEighths}/8 pgs · {sceneMeta.timeOfDay})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getComplexityBadge(
                      b.complexity
                    )}`}
                  >
                    COMPLEXITY {b.complexity}/5
                  </span>
                </div>
              </div>

              {/* Complexity explanation */}
              <div className="text-[11px] text-[#7E8CD4] italic flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>1st AD Note: {b.complexityReason}</span>
              </div>

              {/* 13 Element Tag Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2 border-t border-[#1E2438]/80 text-[11px]">
                {/* Cast */}
                <div className="bg-[#090A0F] border border-[#1E2438] rounded p-2 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-[#7E8CD4]">Speaking Cast</span>
                  <span className="text-white font-medium">
                    {b.cast.length > 0 ? b.cast.join(", ") : "—"}
                  </span>
                </div>

                {/* Stunts & SFX */}
                <div className="bg-[#090A0F] border border-[#1E2438] rounded p-2 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Stunts & Practical SFX
                  </span>
                  <span className="text-rose-300 font-medium">
                    {[...b.stunts, ...b.sfx].length > 0 ? [...b.stunts, ...b.sfx].join(", ") : "—"}
                  </span>
                </div>

                {/* Props & Dressing */}
                <div className="bg-[#090A0F] border border-[#1E2438] rounded p-2 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-[#7E8CD4]">Action Props</span>
                  <span className="text-[#D0D7F7] font-medium">
                    {b.props.length > 0 ? b.props.join(", ") : "—"}
                  </span>
                </div>

                {/* Vehicles & Gear */}
                <div className="bg-[#090A0F] border border-[#1E2438] rounded p-2 flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 flex items-center gap-1">
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
