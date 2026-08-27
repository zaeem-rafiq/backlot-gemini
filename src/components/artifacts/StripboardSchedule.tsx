"use client";

import React from "react";
import { Schedule } from "@/lib/types/schedule";
import { ScriptParse } from "@/lib/types/screenplay";
import {
  Calendar,
  Sun,
  Moon,
  MapPin,
  Users,
  AlertTriangle,
  Truck,
  Info,
  Clock,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

interface StripboardScheduleProps {
  schedule: Schedule;
  scriptParse?: ScriptParse;
}

export function StripboardSchedule({ schedule, scriptParse }: StripboardScheduleProps) {
  const scenesMap = new Map(scriptParse?.scenes.map((s) => [s.id, s]));

  // Helper to compute cast ID numbers (1, 2, 3...)
  const allCharacters = Array.from(
    new Set(scriptParse?.scenes.flatMap((s) => s.characters) || Object.keys(schedule.stats.castDays))
  );
  const castIdMap = new Map(allCharacters.map((c, i) => [c, i + 1]));

  // Standard Stripboard Color Mapping:
  // DAY INT = White / Off-White
  // DAY EXT = Canary Yellow
  // NIGHT INT = Sky / Steel Blue
  // NIGHT EXT = Mint / Sage Green
  const getStripColorClasses = (intExt?: string, timeOfDay?: string) => {
    const isExt = intExt === "EXT";
    const isNight = timeOfDay === "NIGHT" || timeOfDay === "DUSK";

    if (!isExt && !isNight) {
      // DAY INT -> White / Off-white strip
      return {
        stripClass: "bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]",
        tagClass: "bg-[#E2E8F0] text-[#0F172A] border-[#94A3B8]",
        castClass: "bg-[#E2E8F0] text-[#0F172A]",
        slugClass: "text-[#0F172A]",
        subtextClass: "text-[#334155]",
        eightClass: "bg-[#0F172A] text-white",
        typeLabel: "DAY INT",
      };
    }
    if (isExt && !isNight) {
      // DAY EXT -> Canary Yellow strip
      return {
        stripClass: "bg-[#FEF08A] text-[#713F12] border-[#FACC15]",
        tagClass: "bg-[#FDE047] text-[#713F12] border-[#EAB308]",
        castClass: "bg-[#FDE047] text-[#713F12]",
        slugClass: "text-[#713F12]",
        subtextClass: "text-[#854D0E]",
        eightClass: "bg-[#713F12] text-[#FEF08A]",
        typeLabel: "DAY EXT",
      };
    }
    if (!isExt && isNight) {
      // NIGHT INT -> Steel Blue strip
      return {
        stripClass: "bg-[#BAE6FD] text-[#0C4A6E] border-[#7DD3FC]",
        tagClass: "bg-[#7DD3FC] text-[#0C4A6E] border-[#38BDF8]",
        castClass: "bg-[#7DD3FC] text-[#0C4A6E]",
        slugClass: "text-[#0C4A6E]",
        subtextClass: "text-[#075985]",
        eightClass: "bg-[#0C4A6E] text-[#BAE6FD]",
        typeLabel: "NIGHT INT",
      };
    }
    // NIGHT EXT -> Mint Green strip
    return {
      stripClass: "bg-[#BBF7D0] text-[#14532D] border-[#86EFAC]",
      tagClass: "bg-[#86EFAC] text-[#14532D] border-[#4ADE80]",
      castClass: "bg-[#86EFAC] text-[#14532D]",
      slugClass: "text-[#14532D]",
      subtextClass: "text-[#166534]",
      eightClass: "bg-[#14532D] text-[#BBF7D0]",
      typeLabel: "NIGHT EXT",
    };
  };

  const formatEighths = (eighths: number) => {
    const pages = Math.floor(eighths / 8);
    const rem = eighths % 8;
    if (pages === 0) return `${rem}/8 pgs`;
    if (rem === 0) return `${pages} pgs`;
    return `${pages} ${rem}/8 pgs`;
  };

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* Board Metadata & Industry Stripboard Legend */}
      <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  Physical Stripboard Schedule & Day Breaks
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Standard Industry Board
                </span>
              </div>
              <p className="text-xs text-studio-400">
                Location clustering · 6/8 company move deductions · 15% night shoot premiums
              </p>
            </div>
          </div>

          {/* Color Legend (The Authentic Convention) */}
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px] font-bold">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
              <span className="h-2 w-2 rounded-full bg-[#0F172A]" />
              <span>DAY INT</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#FEF08A] text-[#713F12] border border-[#FACC15]">
              <span className="h-2 w-2 rounded-full bg-[#713F12]" />
              <span>DAY EXT</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#BAE6FD] text-[#0C4A6E] border border-[#7DD3FC]">
              <span className="h-2 w-2 rounded-full bg-[#0C4A6E]" />
              <span>NIGHT INT</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#BBF7D0] text-[#14532D] border border-[#86EFAC]">
              <span className="h-2 w-2 rounded-full bg-[#14532D]" />
              <span>NIGHT EXT</span>
            </div>
          </div>
        </div>

        {/* Top Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-studio-800">
          <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col">
            <span className="text-[10px] font-mono uppercase text-studio-400">Shoot Duration</span>
            <span className="text-xl font-bold font-mono text-white mt-0.5">
              {schedule.stats.shootDays} Days
            </span>
            <span className="text-[10px] font-mono text-studio-400">
              {schedule.stats.totalPageEighths}/8 pgs (≈{formatEighths(schedule.stats.totalPageEighths)})
            </span>
          </div>

          <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col">
            <span className="text-[10px] font-mono uppercase text-studio-400">Night Shoots</span>
            <span className="text-xl font-bold font-mono text-sky-400 mt-0.5">
              {schedule.stats.nightShoots} Nights
            </span>
            <span className="text-[10px] font-mono text-studio-400">15% crew differential</span>
          </div>

          <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col">
            <span className="text-[10px] font-mono uppercase text-studio-400">Company Moves</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {schedule.stats.companyMoves} Moves
            </span>
            <span className="text-[10px] font-mono text-studio-400">6/8 pgs deducted / move</span>
          </div>

          <div className="bg-[#08090D] border border-studio-800 rounded-lg p-3 flex flex-col">
            <span className="text-[10px] font-mono uppercase text-studio-400">Principal Cast</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {Object.keys(schedule.stats.castDays).length} Actors
            </span>
            <span className="text-[10px] font-mono text-studio-400">SAG-AFTRA matrix</span>
          </div>
        </div>
      </div>

      {/* THE PHYSICAL STRIPBOARD (Stacked Production Strips) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-studio-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> Multi-Strip Production Board & Day Breaks
          </h3>
          <span className="text-[11px] font-mono text-studio-400">
            {schedule.days.reduce((acc, d) => acc + d.sceneIds.length, 0)} Total Scheduled Strips
          </span>
        </div>

        {/* Board Rails Container */}
        <div className="bg-[#05070B] stripboard-rack-metal rounded-xl p-3.5 md:p-5 flex flex-col gap-4 shadow-2xl">
          {schedule.days.map((day) => {
            const isNight = day.shootType === "NIGHT";
            return (
              <div key={day.dayNumber} className="flex flex-col gap-1.5 bg-[#0B0E17]/60 p-2 rounded-lg border border-studio-800/80">
                {/* DAY BREAK HEADER STRIP (Physical Day Divider) */}
                <div className="bg-[#182032] border-t-2 border-b-2 border-amber-400 rounded px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-white font-mono shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-amber-400 text-black font-extrabold text-xs tracking-wider shadow-sm">
                      DAY {day.dayNumber}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                      {day.shootType} SHOOT · {day.locations.join(" & ")}
                    </span>
                    {day.companyMoves > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center gap-1 font-bold">
                        <Truck className="w-3 h-3 text-amber-400" /> {day.companyMoves} Intra-day Move
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-studio-300">
                      Scenes: <strong className="text-white font-mono font-bold">{day.sceneIds.join(", ")}</strong>
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-black/60 border border-white/20 text-amber-300 font-bold font-mono">
                      {formatEighths(day.totalEighths)} ({day.effectiveEighths}/8 eff)
                    </span>
                  </div>
                </div>

                {/* INDIVIDUAL SCENE STRIPS */}
                <div className="flex flex-col gap-1 pl-1 pr-1">
                  {day.sceneIds.map((scId, idx) => {
                    const scene = scenesMap.get(scId);
                    const intExt = scene?.intExt || (day.shootType === "DAY" ? "INT" : "EXT");
                    const timeOfDay = scene?.timeOfDay || day.shootType;
                    const stripTheme = getStripColorClasses(intExt, timeOfDay);
                    const sceneEighths = scene?.pageEighths || 4;

                    return (
                      <React.Fragment key={scId}>
                        {/* If this scene triggers an intra-day move, show the move strip */}
                        {idx > 0 && day.companyMoves > 0 && idx === 1 && (
                          <div className="bg-amber-950/70 border-y-2 border-amber-500/80 text-amber-200 font-mono text-xs py-1.5 px-4 rounded flex items-center justify-between my-0.5">
                            <div className="flex items-center gap-2">
                              <Truck className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span className="font-bold uppercase tracking-wider">
                                COMPANY MOVE & GEAR PACK: RELOCATING TO NEXT SET
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-300 font-bold bg-amber-900/80 px-2 py-0.5 rounded border border-amber-500/40">
                              -6/8 PGS EFF CAPACITY DEDUCTED
                            </span>
                          </div>
                        )}

                        {/* Physical Strip */}
                        <div
                          className={`rounded border px-3 py-2 flex items-center justify-between gap-3 font-mono text-xs transition shadow-sm hover:brightness-105 ${stripTheme.stripClass}`}
                        >
                          {/* Left: Scene Number & Type Tag */}
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <span
                              className={`h-7 px-2.5 rounded font-extrabold text-xs flex items-center justify-center border shadow-inner ${stripTheme.tagClass}`}
                            >
                              SCENE {scId}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${stripTheme.tagClass}`}
                            >
                              {stripTheme.typeLabel}
                            </span>
                          </div>

                          {/* Middle: Slugline & Dramatic Action */}
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-xs truncate ${stripTheme.slugClass}`}>
                                {scene?.slugline || `SCENE ${scId} — ${day.locations[0]}`}
                              </span>
                              {scene?.timeOfDay === "DAWN" && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-black font-bold uppercase flex items-center gap-1">
                                  <Sun className="w-2.5 h-2.5" /> Golden Hour
                                </span>
                              )}
                              {scene?.timeOfDay === "DUSK" && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-400 text-black font-bold uppercase flex items-center gap-1">
                                  <Moon className="w-2.5 h-2.5" /> Dusk Window
                                </span>
                              )}
                            </div>
                            {scene?.summary && (
                              <p className={`text-[11px] truncate ${stripTheme.subtextClass}`}>
                                {scene.summary}
                              </p>
                            )}
                          </div>

                          {/* Cast Roster IDs */}
                          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                            <span className="text-[9px] uppercase font-bold opacity-75 mr-1">Cast:</span>
                            {(scene?.characters || day.castNeeded).map((char) => {
                              const castId = castIdMap.get(char) || 1;
                              return (
                                <span
                                  key={char}
                                  className={`h-5 min-w-[20px] px-1 rounded text-[10px] font-bold flex items-center justify-center ${stripTheme.castClass}`}
                                  title={`${char} (Cast #${castId})`}
                                >
                                  {castId}
                                </span>
                              );
                            })}
                          </div>

                          {/* Right: Page Eighths Block */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`px-2 py-1 rounded font-bold text-[11px] tracking-tight ${stripTheme.eightClass}`}
                            >
                              {formatEighths(sceneEighths)}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Day Wrap Notes */}
                {day.notes.length > 0 && (
                  <div className="mt-1 px-3 py-2 rounded bg-[#0F121A] border border-studio-800 flex flex-col gap-1 text-[11px] font-mono">
                    {day.notes.map((note, nIdx) => (
                      <div key={nIdx} className="flex items-center gap-2 text-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cast Availability & Booking Matrix (Call Sheet Ledger) */}
      <div className="bg-[#0F121A] border border-studio-800 rounded-xl p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-studio-800 pb-2.5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Cast Availability & SAG-AFTRA Day Rate Matrix
          </h4>
          <span className="text-[10px] font-mono text-studio-400">
            Standard SAG Short Film Day Rate Basis: $250.00 / day
          </span>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-xs text-left"
            aria-label="Cast Availability & SAG-AFTRA Day Rate Matrix"
          >
            <thead>
              <tr className="border-b border-studio-800 text-studio-400 font-mono text-[10px] uppercase">
                <th scope="col" className="py-2.5 pr-4">Cast ID</th>
                <th scope="col" className="py-2.5 px-4">Character Role</th>
                <th scope="col" className="py-2.5 px-4">Shoot Days Booked</th>
                <th scope="col" className="py-2.5 px-4">Standard Day Rate</th>
                <th scope="col" className="py-2.5 pl-4 text-right">Cast Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-800/60 font-mono">
              {Object.entries(schedule.stats.castDays).map(([char, days]) => {
                const castId = castIdMap.get(char) || 1;
                return (
                  <tr key={char} className="hover:bg-studio-850/50 transition">
                    <td className="py-2.5 pr-4">
                      <span className="h-5 w-5 rounded bg-studio-800 text-amber-300 font-bold text-[10px] inline-flex items-center justify-center">
                        {castId}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-white font-bold">{char}</td>
                    <td className="py-2.5 px-4 text-studio-200">{days} Shoot Day(s)</td>
                    <td className="py-2.5 px-4 text-studio-400 font-mono-tabular">$250.00 / day</td>
                    <td className="py-2.5 pl-4 text-right text-emerald-400 font-bold font-mono-tabular">
                      ${(days * 250).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deterministic Engine Rules & Assumptions */}
      <div className="bg-[#08090D] border border-studio-800 rounded-xl p-4 flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-studio-400 flex items-center gap-1.5 font-bold">
          <Info className="w-3.5 h-3.5 text-amber-400" /> Deterministic 1st AD Scheduling Engine Invariants
        </span>
        <ul className="flex flex-col gap-1.5 text-xs text-studio-300 pl-4 list-disc font-mono">
          {schedule.assumptions.map((asm, idx) => (
            <li key={idx}>{asm}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
