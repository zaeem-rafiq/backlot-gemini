"use client";

import React from "react";
import { Coverage } from "@/lib/types/coverage";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Award, Compass, TrendingUp } from "lucide-react";

interface CoverageDossierProps {
  coverage: Coverage;
  title: string;
}

export function CoverageDossier({ coverage, title }: CoverageDossierProps) {
  const getVerdictBadge = (verdict: Coverage["verdict"]) => {
    switch (verdict) {
      case "RECOMMEND":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          label: "RECOMMEND",
        };
      case "CONSIDER":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          label: "CONSIDER",
        };
      case "PASS":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
          label: "PASS",
        };
    }
  };

  const badge = getVerdictBadge(coverage.verdict);

  const scoreBars = [
    { label: "Premise & Originality", score: coverage.scores.premise },
    { label: "Narrative Structure", score: coverage.scores.structure },
    { label: "Character Arc & Voice", score: coverage.scores.character },
    { label: "Dialogue & Subtext", score: coverage.scores.dialogue },
    { label: "Marketability & ROI", score: coverage.scores.marketability },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Verdict & Pull Quote */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        <div className={`md:col-span-4 rounded-xl border p-6 flex flex-col justify-between items-center text-center ${badge.bg}`}>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A8B4EB]">
            Studio Reader Verdict
          </span>
          <div className="flex flex-col items-center gap-2 my-3">
            {badge.icon}
            <span className="text-2xl font-bold tracking-tight">{badge.label}</span>
          </div>
          <span className="text-[11px] opacity-80 font-mono">Calibrated Studio Standard</span>
        </div>

        <div className="md:col-span-8 bg-[#101420] border border-[#1E2438] rounded-xl p-6 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase">
            <Sparkles className="w-4 h-4" /> Story Analyst Pull Quote
          </div>
          <p className="text-base italic text-[#F5F7FD] font-serif leading-relaxed">
            &ldquo;{coverage.pullQuote}&rdquo;
          </p>
          <p className="text-xs text-[#7E8CD4] leading-relaxed">
            {coverage.verdictRationale}
          </p>
        </div>
      </div>

      {/* Score Matrix & Narrative Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 1-10 Dimension Scores */}
        <div className="lg:col-span-5 bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Dimension Ratings (1–10)
          </h3>
          <div className="flex flex-col gap-3">
            {scoreBars.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#D0D7F7]">{item.label}</span>
                  <span className="font-mono font-bold text-white">{item.score}/10</span>
                </div>
                <div className="w-full bg-[#16192B] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 8
                        ? "bg-emerald-400"
                        : item.score >= 6
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                    style={{ width: `${item.score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Synopsis & Genre Context */}
        <div className="lg:col-span-7 bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" /> Narrative Synopsis & Tone
            </h3>
            <div className="flex gap-1.5">
              {coverage.genre.map((g, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#16192B] border border-[#2B3152] text-[10px] font-mono text-[#D0D7F7]"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#D0D7F7] leading-relaxed line-clamp-4">
            {coverage.synopsis}
          </p>
          <div className="bg-[#16192B]/60 border border-[#2B3152]/60 rounded-lg p-3 text-xs text-[#A8B4EB]">
            <span className="text-amber-400 font-mono font-semibold mr-2 uppercase text-[10px]">
              Tone Descriptor:
            </span>
            {coverage.tone}
          </div>
        </div>
      </div>

      {/* Comparables & Production Considerations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-3">
          <h4 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Market Comparables
          </h4>
          <div className="flex flex-col gap-2.5">
            {coverage.comparables.map((comp, idx) => (
              <div key={idx} className="bg-[#090A0F] border border-[#1E2438] rounded-lg p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{comp.title}</span>
                  {comp.year && <span className="text-[10px] font-mono text-[#7E8CD4]">({comp.year})</span>}
                </div>
                <p className="text-[11px] text-[#A8B4EB]">{comp.why}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#101420] border border-[#1E2438] rounded-xl p-5 flex flex-col gap-3">
          <h4 className="text-xs font-mono uppercase text-[#A8B4EB] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standout Strengths & Considerations
          </h4>
          <div className="flex flex-col gap-2">
            {coverage.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#D0D7F7]">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span>{str}</span>
              </div>
            ))}
            {coverage.concerns.map((con, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-amber-300">
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <span>{con}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
