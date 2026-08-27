"use client";

import React from "react";
import { Coverage } from "@/lib/types/coverage";
import {
  Sparkles,
  Award,
  Compass,
  TrendingUp,
  FileText,
  ShieldCheck,
  Quote,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Film,
  Building,
} from "lucide-react";

interface CoverageDossierProps {
  coverage: Coverage;
  title: string;
}

export function CoverageDossier({ coverage, title }: CoverageDossierProps) {
  const getVerdictStamp = (verdict: Coverage["verdict"]) => {
    switch (verdict) {
      case "RECOMMEND":
        return {
          stampClass: "stamp-recommend",
          textClass: "text-emerald-400",
          label: "RECOMMEND",
          subtext: "PRIORITY ACQUISITION / FAST-TRACK GREENLIGHT",
        };
      case "CONSIDER":
        return {
          stampClass: "stamp-consider",
          textClass: "text-amber-400",
          label: "CONSIDER",
          subtext: "STRONG PREMISE / APPROVED FOR PRE-PRODUCTION",
        };
      case "PASS":
        return {
          stampClass: "stamp-pass",
          textClass: "text-rose-400",
          label: "PASS",
          subtext: "REVISE NARRATIVE ARCHITECTURE & RESUBMIT",
        };
    }
  };

  const stamp = getVerdictStamp(coverage.verdict);

  const getScoreDescriptor = (score: number) => {
    if (score >= 9) return { label: "EXCEPTIONAL", color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/40" };
    if (score >= 8) return { label: "EXCELLENT", color: "text-emerald-300 bg-emerald-500/15 border-emerald-500/40" };
    if (score >= 7) return { label: "STRONG", color: "text-amber-300 bg-amber-500/15 border-amber-500/40" };
    if (score >= 6) return { label: "ABOVE AVERAGE", color: "text-amber-300 bg-amber-500/15 border-amber-500/40" };
    return { label: "NEEDS WORK", color: "text-rose-300 bg-rose-500/15 border-rose-500/40" };
  };

  const dimensions = [
    { label: "Premise & Originality", score: coverage.scores.premise, note: "High-concept speculative hook with high-tension time dilation" },
    { label: "Narrative Structure", score: coverage.scores.structure, note: "Three-act short architecture with tight escalation to climax" },
    { label: "Character Arc & Voice", score: coverage.scores.character, note: "Grounded protagonist motivation with clear professional stakes" },
    { label: "Dialogue & Subtext", score: coverage.scores.dialogue, note: "Atmospheric on-air banter with realistic technical terminology" },
    { label: "Marketability & ROI", score: coverage.scores.marketability, note: "Strong genre appeal with lean, producible physical footprint" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-document-land">
      {/* Studio Memo Document Shell */}
      <div className="bg-[#0B0D14] border border-studio-800/90 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden manila-card">
        {/* Archival Memo Header & Studio Department Metadata */}
        <div className="border-b border-studio-800/80 pb-6 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Hollywood Studio Story Analysis & Reader Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#06080C] text-studio-300 border border-studio-800 font-bold">
                DEPT: INK-STORY-2026
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                OFFICIAL RECORD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs pt-2 bg-[#06080C]/80 p-4 rounded-xl border border-studio-800/80">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-studio-400 font-bold tracking-wider">Project Title</span>
              <span className="font-extrabold text-white uppercase text-sm">{title}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-studio-400 font-bold tracking-wider">Story Analyst</span>
              <span className="font-bold text-amber-300">Ink (Story Dept)</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-studio-400 font-bold tracking-wider">Format & Pages</span>
              <span className="text-studio-200">Short Film (12 Pgs)</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase text-studio-400 font-bold tracking-wider">Primary Genre</span>
              <span className="text-studio-200">{coverage.genre.join(" / ")}</span>
            </div>
          </div>
        </div>

        {/* HERO VERDICT: Typographic Ink Stamp + Editorial Pull Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#06080C] border border-studio-800/90 rounded-2xl p-6 sm:p-8 relative shadow-inner">
          {/* Stamped Verdict (Authentic Studio Stamp Effect) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
            <div
              className={`stamp-verdict ${stamp.stampClass} px-7 py-5 rounded-xl transform -rotate-2 sm:-rotate-3 transition-transform hover:rotate-0 flex flex-col items-center gap-1.5 cursor-default select-none shadow-2xl`}
            >
              <span className="text-[10px] font-mono font-extrabold tracking-widest opacity-80 uppercase">
                STUDIO READER VERDICT
              </span>
              <span className="text-4xl md:text-5xl font-extrabold tracking-widest font-mono">
                {stamp.label}
              </span>
              <span className="text-[9px] font-mono font-bold tracking-tight opacity-90 border-t border-current pt-1.5 mt-1 text-center">
                {stamp.subtext}
              </span>
            </div>
          </div>

          {/* Large Editorial Pull Quote */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase font-bold tracking-wider">
              <Quote className="w-4 h-4 text-amber-400" /> Story Analyst Verdict Assessment
            </div>
            <p className="font-editorial text-2xl md:text-3xl text-white italic leading-snug tracking-tight">
              &ldquo;{coverage.pullQuote}&rdquo;
            </p>
            <p className="text-xs text-studio-300 leading-relaxed font-sans pt-2 border-t border-studio-800/80">
              <strong className="text-white font-mono uppercase text-[11px] tracking-wide">Analysis Summary: </strong>
              {coverage.verdictRationale}
            </p>
          </div>
        </div>

        {/* CRITIC'S ASSESSMENT MATRIX (Calibrated Rubric 1–10) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-studio-800/80 pb-3 flex-wrap gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Critic&apos;s Diagnostic Score Matrix (Calibrated 1–10)
            </h3>
            <span className="text-[10px] font-mono text-studio-400 font-semibold">Industry Standard Calibrated Rubric</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dimensions.map((dim, idx) => {
              const desc = getScoreDescriptor(dim.score);
              return (
                <div
                  key={idx}
                  className="bg-[#06080C] border border-studio-800/80 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:border-studio-700/80 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white font-mono tracking-wide">{dim.label}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex-shrink-0 ${desc.color}`}
                    >
                      {desc.label}
                    </span>
                  </div>

                  {/* Critic Discrete Score Track */}
                  <div
                    role="meter"
                    aria-label={`${dim.label} score ${dim.score} out of 10`}
                    aria-valuenow={dim.score}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    className="flex items-center gap-2 font-mono pt-1"
                  >
                    <span className="text-xl font-bold text-white font-mono-tabular">
                      {dim.score}
                      <span className="text-xs text-studio-400 font-normal">/10</span>
                    </span>
                    <div className="flex-1 flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, bIdx) => (
                        <div
                          key={bIdx}
                          className={`h-2.5 flex-1 rounded-sm transition ${
                            bIdx < dim.score
                              ? dim.score >= 8
                                ? "bg-emerald-400 shadow-sm shadow-emerald-500/20"
                                : "bg-amber-400 shadow-sm shadow-amber-500/20"
                              : "bg-studio-850"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-studio-300 leading-relaxed font-sans">{dim.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Synopsis & Dramatic Tone */}
        <div className="bg-[#06080C] border border-studio-800/80 rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-studio-800/80 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" /> Narrative Synopsis & Logline Breakdown
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[10px] uppercase text-studio-400 font-bold">Atmospheric Tone:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                {coverage.tone}
              </span>
            </div>
          </div>
          <p className="text-xs text-studio-200 leading-relaxed font-sans pt-1">
            {coverage.synopsis}
          </p>
        </div>

        {/* Market Comparables & Standout Considerations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Studio Market Comparables */}
          <div className="bg-[#06080C] border border-studio-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-studio-800/80 pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Studio Market Comparables
            </h4>
            <div className="flex flex-col gap-3">
              {coverage.comparables.map((comp, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B0D14] border border-studio-800 rounded-xl p-3.5 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">{comp.title}</span>
                    {comp.year && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold font-mono-tabular">
                        {comp.year}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-studio-300 leading-relaxed font-sans">{comp.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Standout Strengths & Production Notes */}
          <div className="bg-[#06080C] border border-studio-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-studio-800/80 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Standout Strengths & Production Notes
            </h4>
            <div className="flex flex-col gap-3 font-sans text-xs">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  Key Strengths
                </span>
                {coverage.strengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-studio-200 bg-[#0B0D14] p-2.5 rounded-lg border border-studio-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{str}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-studio-800/80">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Development Notes
                </span>
                {coverage.concerns.map((con, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-amber-200 bg-[#0B0D14] p-2.5 rounded-lg border border-studio-800/80">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{con}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
