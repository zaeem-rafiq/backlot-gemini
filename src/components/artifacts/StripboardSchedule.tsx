"use client";

import React from "react";
import { Schedule } from "@/lib/types/schedule";
import { Calendar, Sun, Moon, MapPin, Users, AlertTriangle, Truck, Info } from "lucide-react";

interface StripboardScheduleProps {
  schedule: Schedule;
}

export function StripboardSchedule({ schedule }: StripboardScheduleProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" /> Shoot Duration
          </span>
          <span className="text-xl font-bold text-white">{schedule.stats.shootDays} Days</span>
          <span className="text-[10px] text-[#5865A8]">
            {schedule.stats.totalPageEighths}/8 total pages (≈{(schedule.stats.totalPageEighths / 8).toFixed(1)} pgs)
          </span>
        </div>

        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
            <Moon className="w-3 h-3 text-violet-400" /> Night Shoots
          </span>
          <span className="text-xl font-bold text-violet-300">{schedule.stats.nightShoots} Nights</span>
          <span className="text-[10px] text-[#5865A8]">15% crew premium applied</span>
        </div>

        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
            <Truck className="w-3 h-3 text-amber-400" /> Company Moves
          </span>
          <span className="text-xl font-bold text-amber-300">{schedule.stats.companyMoves} Moves</span>
          <span className="text-[10px] text-[#5865A8]">6/8 capacity per intra-day move</span>
        </div>

        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#7E8CD4] uppercase flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-400" /> Cast Size
          </span>
          <span className="text-xl font-bold text-emerald-300">
            {Object.keys(schedule.stats.castDays).length} Principal(s)
          </span>
          <span className="text-[10px] text-[#5865A8]">Day rate matrix computed</span>
        </div>
      </div>

      {/* Visual Shooting Day Stripboard */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" /> Daily Stripboard Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedule.days.map((day) => {
            const isNight = day.shootType === "NIGHT";
            return (
              <div
                key={day.dayNumber}
                className={`rounded-xl border p-5 flex flex-col gap-3 transition ${
                  isNight
                    ? "bg-[#111026] border-[#3B2C68]/60 hover:border-[#583E9E]"
                    : "bg-[#101420] border-[#1E2438] hover:border-[#2B3152]"
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 px-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center">
                      DAY {day.dayNumber}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        isNight
                          ? "bg-violet-500/10 text-violet-300 border-violet-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {isNight ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                      {day.shootType} SHOOT
                    </span>
                  </div>

                  <span className="text-xs font-mono text-[#D0D7F7]">
                    {day.totalEighths}/8 pgs <span className="text-[#5865A8]">({day.effectiveEighths}/8 eff)</span>
                  </span>
                </div>

                {/* Locations & Moves */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[#D0D7F7]">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="font-semibold">{day.locations.join(" ➔ ")}</span>
                  </div>
                  {day.companyMoves > 0 && (
                    <span className="text-[10px] text-amber-400/90 font-mono pl-5">
                      ⚠️ Intra-day company move required ({day.companyMoves * 6}/8 capacity deducted)
                    </span>
                  )}
                </div>

                {/* Scheduled Scenes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-[#7E8CD4] uppercase mr-1">Scenes:</span>
                  {day.sceneIds.map((scId) => (
                    <span
                      key={scId}
                      className="px-2 py-0.5 rounded bg-[#090A0F] border border-[#2B3152] text-[11px] font-mono text-white font-medium"
                    >
                      Scene {scId}
                    </span>
                  ))}
                </div>

                {/* Cast Needed */}
                <div className="flex items-center gap-1.5 text-xs text-[#A8B4EB]">
                  <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Cast on set: {day.castNeeded.join(", ")}</span>
                </div>

                {/* Day Notes & Warnings */}
                {day.notes.length > 0 && (
                  <div className="mt-1 pt-2 border-t border-[#1E2438] flex flex-col gap-1 text-[11px]">
                    {day.notes.map((n, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-amber-300/90">
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cast Availability Matrix */}
      <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-3">
        <h4 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" /> Cast Booking & Day Matrix
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1E2438] text-[#7E8CD4] font-mono text-[10px] uppercase">
                <th className="py-2 pr-4">Character</th>
                <th className="py-2 px-4">Shoot Days Booked</th>
                <th className="py-2 px-4">Day Rate</th>
                <th className="py-2 pl-4 text-right">Cast Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2438]/60 font-mono">
              {Object.entries(schedule.stats.castDays).map(([char, days]) => (
                <tr key={char} className="hover:bg-[#16192B]/50 transition">
                  <td className="py-2.5 pr-4 text-white font-semibold">{char}</td>
                  <td className="py-2.5 px-4 text-[#D0D7F7]">{days} Day(s)</td>
                  <td className="py-2.5 px-4 text-[#7E8CD4]">$250/day</td>
                  <td className="py-2.5 pl-4 text-right text-emerald-400 font-bold">
                    ${(days * 250).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engine Assumptions */}
      <div className="bg-[#090A0F] border border-[#1E2438] rounded-xl p-4 flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase text-[#7E8CD4] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" /> Deterministic Scheduling Engine Rules & Assumptions
        </span>
        <ul className="flex flex-col gap-1 text-[11px] text-[#A8B4EB] pl-4 list-disc">
          {schedule.assumptions.map((asm, idx) => (
            <li key={idx}>{asm}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
